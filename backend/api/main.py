from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3, joblib, os
from datetime import datetime, date
from api.analysis import get_spending_analysis, get_kharcha_score, get_savings_suggestions
from api.predictor import smart_predict
from api.auth import verify_token, register_user, login_user, get_db

app = FastAPI(title="Kharcha AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml_models", "category_classifier.pkl")
model = joblib.load(MODEL_PATH)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "kharcha.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at TEXT NOT NULL)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        description TEXT NOT NULL, amount REAL NOT NULL, category TEXT NOT NULL,
        date TEXT NOT NULL, note TEXT, FOREIGN KEY (user_id) REFERENCES users(id))""")
    conn.execute("""CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        category TEXT NOT NULL, limit_amount REAL NOT NULL, month TEXT NOT NULL,
        UNIQUE(user_id, category, month), FOREIGN KEY (user_id) REFERENCES users(id))""")
    conn.execute("""CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        title TEXT NOT NULL, target REAL NOT NULL, months INTEGER NOT NULL,
        monthly_saving REAL DEFAULT 0, avg_spend REAL DEFAULT 0,
        created_at TEXT NOT NULL)""")
    conn.commit()
    conn.close()

init_db()

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: Optional[str] = None
    date: Optional[str] = None
    note: Optional[str] = None

class BudgetCreate(BaseModel):
    category: str
    limit_amount: float
    month: Optional[str] = None

class GoalCreate(BaseModel):
    title: str
    target: float
    months: int

# ── AUTH ──────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Kharcha AI v2 🚀"}

@app.post("/auth/register")
def register(data: RegisterInput):
    return register_user(data.name, data.email, data.password)

@app.post("/auth/login")
def login(data: LoginInput):
    return login_user(data.email, data.password)

@app.get("/auth/me")
def me(user=Depends(verify_token)):
    conn = get_db()
    u = conn.execute("SELECT id,name,email,created_at FROM users WHERE id=?", (user["user_id"],)).fetchone()
    conn.close()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(u)

# ── PREDICT (public) ──────────────────────────────────
@app.post("/predict-category")
def predict_category(data: dict):
    text = data.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text required")
    return smart_predict(model, text)

# ── EXPENSES ──────────────────────────────────────────
@app.post("/expenses")
def add_expense(expense: ExpenseCreate, user=Depends(verify_token)):
    category = expense.category
    if not category:
        category = smart_predict(model, expense.description)["category"]
    expense_date = expense.date or date.today().isoformat()
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO expenses (user_id,description,amount,category,date,note) VALUES (?,?,?,?,?,?)",
        (user["user_id"], expense.description, expense.amount, category, expense_date, expense.note))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "description": expense.description, "amount": expense.amount,
            "category": category, "date": expense_date, "message": "✅ Expense add ho gaya!"}

@app.get("/expenses")
def get_expenses(month: Optional[str] = None, user=Depends(verify_token)):
    conn = get_db()
    if month:
        rows = conn.execute(
            "SELECT * FROM expenses WHERE user_id=? AND date LIKE ? ORDER BY date DESC",
            (user["user_id"], f"{month}%")).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM expenses WHERE user_id=? ORDER BY date DESC LIMIT 100",
            (user["user_id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, user=Depends(verify_token)):
    conn = get_db()
    conn.execute("DELETE FROM expenses WHERE id=? AND user_id=?", (expense_id, user["user_id"]))
    conn.commit()
    conn.close()
    return {"message": "Deleted!"}

# ── AI ANALYSIS ───────────────────────────────────────
@app.get("/analysis/{month}")
def monthly_analysis(month: str, user=Depends(verify_token)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM expenses WHERE user_id=? AND date LIKE ?",
                        (user["user_id"], f"{month}%")).fetchall()
    conn.close()
    expenses = [dict(r) for r in rows]
    if not expenses:
        return {"message": "Is mahine koi expense nahi mila."}
    return get_spending_analysis(expenses, month)

@app.get("/kharcha-score/{month}")
def kharcha_score(month: str, user=Depends(verify_token)):
    conn = get_db()
    expenses = [dict(r) for r in conn.execute(
        "SELECT * FROM expenses WHERE user_id=? AND date LIKE ?",
        (user["user_id"], f"{month}%")).fetchall()]
    budgets = [dict(r) for r in conn.execute(
        "SELECT * FROM budgets WHERE user_id=? AND month=?",
        (user["user_id"], month)).fetchall()]
    conn.close()
    return get_kharcha_score(expenses, budgets)

@app.get("/suggestions/{month}")
def savings_suggestions(month: str, user=Depends(verify_token)):
    conn = get_db()
    expenses = [dict(r) for r in conn.execute(
        "SELECT * FROM expenses WHERE user_id=? AND date LIKE ?",
        (user["user_id"], f"{month}%")).fetchall()]
    conn.close()
    return get_savings_suggestions(expenses)

# ── BUDGETS ───────────────────────────────────────────
@app.post("/budgets")
def set_budget(budget: BudgetCreate, user=Depends(verify_token)):
    month = budget.month or datetime.now().strftime("%Y-%m")
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO budgets (user_id,category,limit_amount,month) VALUES (?,?,?,?)",
        (user["user_id"], budget.category, budget.limit_amount, month))
    conn.commit()
    conn.close()
    return {"message": f"{budget.category} budget set ho gaya!"}

@app.get("/budgets")
def get_budgets(month: Optional[str] = None, user=Depends(verify_token)):
    month = month or datetime.now().strftime("%Y-%m")
    conn = get_db()
    budgets  = [dict(b) for b in conn.execute(
        "SELECT * FROM budgets WHERE user_id=? AND month=?",
        (user["user_id"], month)).fetchall()]
    expenses = conn.execute(
        "SELECT category, SUM(amount) as spent FROM expenses WHERE user_id=? AND date LIKE ? GROUP BY category",
        (user["user_id"], f"{month}%")).fetchall()
    conn.close()
    spent_map = {e["category"]: e["spent"] for e in expenses}
    result = []
    for b in budgets:
        spent = spent_map.get(b["category"], 0)
        pct   = min(100, round((spent / b["limit_amount"]) * 100)) if b["limit_amount"] > 0 else 0
        result.append({**b, "spent": round(spent, 2),
                       "remaining": round(max(0, b["limit_amount"] - spent), 2),
                       "percentage": pct,
                       "status": "over" if spent > b["limit_amount"] else "warning" if pct >= 80 else "ok"})
    return result

# ── GOALS ─────────────────────────────────────────────
@app.post("/goals/predict")
def predict_goal(goal: GoalCreate, user=Depends(verify_token)):
    conn = get_db()
    rows = conn.execute(
        "SELECT SUM(amount) as total FROM expenses WHERE user_id=? AND date >= date('now','-3 months')",
        (user["user_id"],)).fetchone()
    avg  = (rows["total"] or 0) / 3
    need = goal.target / goal.months
    # Save goal to DB
    conn.execute(
        "INSERT INTO goals (user_id, title, target, months, monthly_saving, avg_spend, created_at) VALUES (?,?,?,?,?,?,?)",
        (user["user_id"], goal.title, goal.target, goal.months,
         round(need, 2), round(avg, 2), datetime.now().strftime("%Y-%m-%d")))
    conn.commit()
    conn.close()
    return {"goal_title": goal.title, "target_amount": goal.target, "months": goal.months,
            "monthly_saving_needed": round(need, 2), "current_avg_spend": round(avg, 2),
            "suggestion": f"You need to save ₹{need:,.0f} every month. Review your budget!"}

@app.get("/goals")
def get_goals(user=Depends(verify_token)):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM goals WHERE user_id=? ORDER BY created_at DESC",
        (user["user_id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, user=Depends(verify_token)):
    conn = get_db()
    conn.execute("DELETE FROM goals WHERE id=? AND user_id=?", (goal_id, user["user_id"]))
    conn.commit()
    conn.close()
    return {"message": "Goal deleted!"}

# ── CHANGE PASSWORD ───────────────────────────────────
class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str

@app.post("/auth/change-password")
def change_password(data: ChangePasswordInput, user=Depends(verify_token)):
    from api.auth import hash_password
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE id=?", (user["user_id"],)).fetchone()
    if not u:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    if u["password"] != hash_password(data.current_password):
        conn.close()
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_password) < 6:
        conn.close()
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    conn.execute("UPDATE users SET password=? WHERE id=?",
                 (hash_password(data.new_password), user["user_id"]))
    conn.commit()
    conn.close()
    return {"message": "Password updated successfully!"}

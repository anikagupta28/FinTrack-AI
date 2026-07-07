import sqlite3, os, hashlib, secrets
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

SECRET_KEY = "kharcha-ai-secret-key-2025"
ALGORITHM  = "HS256"
DB_PATH    = os.path.join(os.path.dirname(__file__), "..", "kharcha.db")
security   = HTTPBearer()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_users_table():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL,
            email      TEXT    UNIQUE NOT NULL,
            password   TEXT    NOT NULL,
            created_at TEXT    NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: int, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email":   email,
        "exp":     datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    print("=" * 60)
    print("TOKEN RECEIVED:")
    print(credentials.credentials)

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        print("TOKEN VALID")
        print(payload)
        return payload

    except Exception as e:
        print("TOKEN ERROR:")
        print(repr(e))
        raise HTTPException(status_code=401, detail=str(e))

def register_user(name: str, email: str, password: str):
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(password)
    cursor = conn.execute(
        "INSERT INTO users (name, email, password, created_at) VALUES (?,?,?,?)",
        (name, email, hashed, datetime.now().isoformat())
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    token = create_token(user_id, email)
    return {"user_id": user_id, "name": name, "email": email, "token": token}

def login_user(email: str, password: str):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Email not found")
    if user["password"] != hash_password(password):
        raise HTTPException(status_code=401, detail="Wrong password")
    token = create_token(user["id"], user["email"])
    return {"user_id": user["id"], "name": user["name"], "email": user["email"], "token": token}

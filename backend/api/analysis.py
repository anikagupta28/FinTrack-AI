from collections import defaultdict
from typing import List, Dict

CATEGORIES = ["Food", "Travel", "Entertainment", "Shopping", "Bills", "Rent"]

IDEAL_SPLIT = {
    "Food":          0.30,
    "Travel":        0.15,
    "Entertainment": 0.10,
    "Shopping":      0.15,
    "Bills":         0.20,
    "Rent":          0.00,
}

TIPS = {
    "Food": [
        "Cook at home more often — eating out costs 40% more on average.",
        "Meal prep on weekends to reduce daily food delivery orders.",
        "Carry a lunch box to work — it can save ₹3,000 per month.",
    ],
    "Entertainment": [
        "Review your OTT subscriptions — share a family plan instead of individual ones.",
        "Explore free alternatives: YouTube, free events, or public parks.",
        "Set a fixed monthly entertainment budget and stick to it.",
    ],
    "Shopping": [
        "Add items to your wishlist and wait 48 hours before buying — avoids impulse purchases.",
        "Use cashback apps and seasonal sales for non-urgent purchases.",
        "Unsubscribe from brand emails to reduce temptation.",
    ],
    "Travel": [
        "Try carpooling or public transit for your daily commute.",
        "Use a fuel cashback credit card to save on petrol.",
        "Book flights and trips in advance — prices are 30% lower.",
    ],
    "Bills": [
        "Save electricity by setting your AC to 24°C.",
        "Switch to a prepaid mobile plan — usually cheaper than postpaid.",
        "Cancel unused app subscriptions.",
    ],
}


def get_spending_analysis(expenses: List[Dict], month: str) -> Dict:
    category_totals = defaultdict(float)
    for e in expenses:
        category_totals[e["category"]] += e["amount"]

    total = sum(category_totals.values())
    if total == 0:
        return {"message": "No data found."}

    breakdown = []
    insights  = []

    for cat, amount in sorted(category_totals.items(), key=lambda x: -x[1]):
        pct       = (amount / total) * 100
        ideal_pct = IDEAL_SPLIT.get(cat, 0) * 100
        status    = "normal"

        if cat != "Rent":
            if pct > ideal_pct * 1.3:
                status = "over"
                insights.append({
                    "type": "warning",
                    "message": f"⚠️ You spent {pct:.0f}% on {cat} this month — recommended is {ideal_pct:.0f}%."
                })
            elif pct < ideal_pct * 0.5 and amount > 0:
                status = "under"
                insights.append({
                    "type": "info",
                    "message": f"✅ Your {cat} spending is well under control ({pct:.0f}%)."
                })

        breakdown.append({
            "category":   cat,
            "amount":     round(amount, 2),
            "percentage": round(pct, 1),
            "status":     status,
        })

    top_cat = max(category_totals, key=category_totals.get)
    insights.insert(0, {
        "type": "info",
        "message": f"📊 Your highest spending this month is {top_cat} at ₹{category_totals[top_cat]:,.0f}."
    })

    return {
        "month":             month,
        "total_spent":       round(total, 2),
        "breakdown":         breakdown,
        "insights":          insights,
        "transaction_count": len(expenses),
    }


def get_kharcha_score(expenses: List[Dict], budgets: List[Dict]) -> Dict:
    if not expenses:
        return {"score": 0, "grade": "N/A", "message": "No expenses found."}

    total            = sum(e["amount"] for e in expenses)
    category_totals  = defaultdict(float)
    for e in expenses:
        category_totals[e["category"]] += e["amount"]

    score   = 0
    details = []

    # Budget adherence (40 pts)
    if budgets:
        budget_map    = {b["category"]: b["limit_amount"] for b in budgets}
        within_budget = sum(1 for cat, amt in category_totals.items() if cat in budget_map and amt <= budget_map[cat])
        budget_score  = (within_budget / len(budget_map)) * 40
        score        += budget_score
        details.append(f"Budget adherence: {within_budget}/{len(budget_map)} categories within limit.")
    else:
        score += 20
        details.append("No budget set — add one to improve your score!")

    # Spending balance (35 pts)
    balance_score = 35
    for cat, ideal_ratio in IDEAL_SPLIT.items():
        if cat == "Rent" or ideal_ratio == 0:
            continue
        actual_ratio = category_totals.get(cat, 0) / total if total > 0 else 0
        if abs(actual_ratio - ideal_ratio) > 0.15:
            balance_score -= 5
    score += max(0, balance_score)

    # Transaction consistency (25 pts)
    n = len(expenses)
    score += 25 if n >= 20 else 18 if n >= 10 else 10 if n >= 5 else 5
    details.append(f"Transactions logged this month: {n}.")

    score = min(100, round(score))

    if score >= 80:
        grade, emoji, msg = "A", "🟢", "Excellent! Your spending is very well controlled."
    elif score >= 60:
        grade, emoji, msg = "B", "🟡", "Good job! A bit more planning will make it perfect."
    elif score >= 40:
        grade, emoji, msg = "C", "🟠", "Fair. You need to watch spending in some categories."
    else:
        grade, emoji, msg = "D", "🔴", "Spending is high — set a budget right away!"

    return {
        "score":       score,
        "grade":       grade,
        "emoji":       emoji,
        "message":     msg,
        "details":     details,
        "total_spent": round(total, 2),
    }


def get_savings_suggestions(expenses: List[Dict]) -> Dict:
    if not expenses:
        return {"suggestions": [], "potential_savings": 0}

    category_totals = defaultdict(float)
    for e in expenses:
        category_totals[e["category"]] += e["amount"]

    total       = sum(category_totals.values())
    suggestions = []
    potential   = 0

    for cat, amount in sorted(category_totals.items(), key=lambda x: -x[1]):
        if cat in ("Rent", "Bills"):
            continue
        pct       = (amount / total) * 100
        ideal_pct = IDEAL_SPLIT.get(cat, 0) * 100

        if pct > ideal_pct * 1.2:
            saving_amt = round(amount * 0.15, 0)
            potential += saving_amt
            suggestions.append({
                "category":          cat,
                "current_spend":     round(amount, 2),
                "suggested_reduction": "15%",
                "potential_saving":  saving_amt,
                "message":           f"💡 Reduce {cat} spending by 15% to save ₹{saving_amt:,.0f} this month.",
                "tips":              TIPS.get(cat, ["Review your spending in this category."]),
            })

    if not suggestions:
        suggestions.append({
            "category":        "General",
            "message":         "✅ Your spending pattern looks well balanced!",
            "tips":            ["Build an emergency fund — keep 3 months of expenses aside."],
            "potential_saving": 0,
        })

    return {
        "suggestions":            suggestions,
        "total_potential_savings": round(potential, 2),
        "message":                f"Following these tips could save you ₹{potential:,.0f} this month!"
    }

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

print("=" * 50)
print("   Kharcha AI - Model Training Script")
print("=" * 50)

# ── 1. Load dataset ──────────────────────────────────
dataset_path = os.path.join("dataset", "expenses_dataset.csv")
df = pd.read_csv(dataset_path)
print(f"\n✅ Dataset loaded: {len(df)} samples")
print(f"   Categories: {df['category'].unique().tolist()}")
print(f"   Distribution:\n{df['category'].value_counts().to_string()}")

# ── 2. Prepare data ──────────────────────────────────
X = df["text"]
y = df["category"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n✅ Train size: {len(X_train)} | Test size: {len(X_test)}")

# ── 3. Build pipeline ────────────────────────────────
# TF-IDF converts text to numbers, Naive Bayes classifies
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 2),   # single words + pairs like "pizza hut"
        max_features=3000,
        lowercase=True,
        analyzer="word"
    )),
    ("classifier", MultinomialNB(alpha=0.3))
])

# ── 4. Train ──────────────────────────────────────────
print("\n🔄 Training model...")
pipeline.fit(X_train, y_train)
print("✅ Training complete!")

# ── 5. Evaluate ───────────────────────────────────────
y_pred = pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n📊 Model Accuracy: {accuracy * 100:.1f}%")
print("\nDetailed Report:")
print(classification_report(y_test, y_pred))

# ── 6. Test with real examples ────────────────────────
test_examples = [
    "Swiggy biryani",
    "Uber to airport",
    "Netflix monthly",
    "Myntra dress",
    "JIO recharge",
    "House rent March",
    "Auto rickshaw",
    "Zomato dinner",
    "BookMyShow movie tickets",
    "Kirana store",
    "Petrol filling",
    "Amazon shopping",
]

print("\n🧪 Testing with real examples:")
print("-" * 40)
for example in test_examples:
    prediction = pipeline.predict([example])[0]
    proba = pipeline.predict_proba([example])
    confidence = max(proba[0]) * 100
    print(f"  '{example}' → {prediction} ({confidence:.0f}% confident)")

# ── 7. Save model ──────────────────────────────────────
os.makedirs("ml_models", exist_ok=True)
model_path = os.path.join("ml_models", "category_classifier.pkl")
joblib.dump(pipeline, model_path)

print(f"\n✅ Model saved to: {model_path}")
print("\n🎉 Training done! Tumhara AI model ready hai.")
print("   Ab 'python -m uvicorn api.main:app --reload' run karo\n")

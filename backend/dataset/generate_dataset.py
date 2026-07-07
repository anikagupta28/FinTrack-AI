"""
=========================================================
        FinTrack AI Dataset Generator V2
---------------------------------------------------------
Author : Anika Gupta + ChatGPT
Purpose:
Generate a large India-specific expense dataset for
training FinTrack AI category classifier.

Output:
dataset/expenses_dataset.csv

Target:
20000+ unique rows
=========================================================
"""

import random
import pandas as pd
from pathlib import Path
import os

# ------------------------------------------------------
# CONFIG
# ------------------------------------------------------

TARGET_SIZE = 20000

OUTPUT_FILE = Path("dataset/expenses_dataset.csv")

random.seed(42)

# ------------------------------------------------------
# CATEGORY COUNTS
# ------------------------------------------------------

CATEGORY_DISTRIBUTION = {

    "Food": 5200,

    "Shopping": 4200,

    "Travel": 3200,

    "Entertainment": 2600,

    "Bills": 2500,

    "Rent": 2300

}

# ------------------------------------------------------
# FOOD MERCHANTS
# ------------------------------------------------------

FOOD_MERCHANTS = [

"Swiggy",
"Zomato",
"Blinkit",
"Zepto",
"Instamart",
"BigBasket",
"JioMart",
"Dmart",
"Reliance Fresh",
"Star Bazaar",
"More Supermarket",
"Spencer",

"Pizza Hut",
"Dominos",
"McDonalds",
"Burger King",
"KFC",
"Subway",
"Faasos",
"Box8",
"Behrouz",
"Oven Story",
"EatFit",
"Theobroma",
"Bikanervala",
"Haldirams",
"Wow Momo",
"Burger Singh",
"Chaayos",
"Starbucks",
"CCD",
"Barista",
"Blue Tokai",

"Hostel Mess",
"College Canteen",
"Local Dhaba",
"Mess",
"Cafe",
"Restaurant"

]

# ------------------------------------------------------
# FOOD ITEMS
# ------------------------------------------------------

FOOD_ITEMS = [

"Pizza",
"Burger",
"Biryani",
"Coffee",
"Tea",
"Milk",
"Paneer",
"Vegetables",
"Fruits",
"Bread",
"Butter",
"Eggs",
"Noodles",
"Pasta",
"Sandwich",
"Shawarma",
"Momos",
"Roll",
"Paratha",
"Dosa",
"Idli",
"Poha",
"Pav Bhaji",
"Chole Bhature",
"Rajma Chawal",
"Dal Rice",
"Juice",
"Lassi",
"Cold Coffee",
"Smoothie",
"Ice Cream",
"Chocolate",
"Biscuits",
"Snacks",
"Groceries",
"Lunch",
"Dinner",
"Breakfast",
"Evening Snacks"

]

# ------------------------------------------------------
# FOOD ACTIONS
# ------------------------------------------------------

FOOD_ACTIONS = [

"Bought",

"Purchased",

"Ordered",

"Paid for",

"Ate",

"Had",

"Got",

"Enjoyed",

"Tried",

"Collected"

]

# ------------------------------------------------------
# HINGLISH FOOD ACTIONS
# ------------------------------------------------------

HINGLISH_FOOD = [

"khaya",

"mangaya",

"order kiya",

"liya",

"kharida",

"piya",

"ghar laya",

"canteen se liya",

"mess me khaya",

"bahar khaya"

]
# ------------------------------------------------------
# SHOPPING MERCHANTS
# ------------------------------------------------------

SHOPPING_MERCHANTS = [

"Amazon",
"Flipkart",
"Myntra",
"Ajio",
"Nykaa",
"Nykaa Fashion",
"Meesho",
"Tata Cliq",
"Croma",
"Reliance Digital",
"Apple Store",
"Samsung Store",
"OnePlus Store",
"Mi Store",
"Boat",
"Noise",
"FireBoltt",

"Nike",
"Adidas",
"Puma",
"Reebok",
"Woodland",
"Bata",
"Metro Shoes",

"H&M",
"Zara",
"Uniqlo",
"Westside",
"Lifestyle",
"Pantaloons",
"Max Fashion",
"Shoppers Stop",

"Decathlon",

"Local Market",
"Shopping Mall"

]

# ------------------------------------------------------
# SHOPPING ITEMS
# ------------------------------------------------------

SHOPPING_ITEMS = [

"Laptop",
"Mouse",
"Keyboard",
"Monitor",
"Headphones",
"Earbuds",
"Speaker",
"Power Bank",
"Phone Charger",
"USB Cable",

"Phone Cover",
"Tempered Glass",

"Shoes",
"T Shirt",
"Jeans",
"Kurti",
"Saree",
"Jacket",
"Hoodie",

"Watch",
"Wallet",
"Backpack",

"Perfume",
"Lipstick",
"Makeup Kit",
"Face Wash",
"Shampoo",

"Notebook",
"Books",
"Pen",

"Bottle",
"Lunch Box",

"Gift"

]

# ------------------------------------------------------
# TRAVEL MERCHANTS
# ------------------------------------------------------

TRAVEL_MERCHANTS = [

"Uber",
"Ola",
"Rapido",

"IRCTC",

"RedBus",
"AbhiBus",

"Metro",

"Indigo",

"Air India",

"Akasa",

"SpiceJet",

"Goibibo",

"MakeMyTrip",

"Yatra",

"Parking",

"Fastag",

"Petrol Pump"

]

# ------------------------------------------------------
# TRAVEL ITEMS
# ------------------------------------------------------

TRAVEL_ITEMS = [

"Cab",

"Taxi",

"Auto",

"Metro Ticket",

"Bus Ticket",

"Train Ticket",

"Flight Ticket",

"Petrol",

"Diesel",

"Parking",

"Fastag Recharge",

"Toll Tax"

]

# ------------------------------------------------------
# ENTERTAINMENT MERCHANTS
# ------------------------------------------------------

ENTERTAINMENT_MERCHANTS = [

"Netflix",

"Spotify",

"Prime Video",

"Disney Hotstar",

"JioCinema",

"BookMyShow",

"PVR",

"INOX",

"Steam",

"Epic Games",

"PlayStation Store",

"Xbox"

]

# ------------------------------------------------------
# ENTERTAINMENT ITEMS
# ------------------------------------------------------

ENTERTAINMENT_ITEMS = [

"Movie",

"Movie Ticket",

"Subscription",

"Gaming",

"Music",

"IPL Ticket",

"Cricket Match",

"Bowling",

"Arcade",

"Concert"

]

# ------------------------------------------------------
# BILL MERCHANTS
# ------------------------------------------------------

BILL_MERCHANTS = [

"Jio",

"Airtel",

"BSNL",

"Vi",

"Electricity Board",

"Water Department",

"Gas Agency",

"Broadband",

"ACT Fiber",

"Excitel",

"Credit Card",

"HDFC",

"SBI",

"ICICI"

]

# ------------------------------------------------------
# BILL ITEMS
# ------------------------------------------------------

BILL_ITEMS = [

"Recharge",

"Internet Bill",

"Electricity Bill",

"Water Bill",

"Gas Bill",

"EMI",

"Insurance",

"Credit Card Bill",

"Broadband Bill"

]

# ------------------------------------------------------
# RENT MERCHANTS
# ------------------------------------------------------

RENT_MERCHANTS = [

"PG",

"Hostel",

"Room",

"Flat",

"Apartment",

"House",

"Society"

]

# ------------------------------------------------------
# RENT ITEMS
# ------------------------------------------------------

RENT_ITEMS = [

"PG Rent",

"Hostel Fee",

"Room Rent",

"Flat Rent",

"House Rent",

"Maintenance",

"Security Deposit"

]
# ======================================================
# TEXT TEMPLATES
# ======================================================

ENGLISH_TEMPLATES = [

    "{} {}",

    "{} from {}",

    "{} via {}",

    "{} at {}",

    "{} using {}",

    "{} payment {}",

    "{} purchase {}",

    "{} order {}",

    "{} bought {}",

    "{} purchased {}",

    "{} paid for {}",

    "{} expense {}",

    "{} monthly {}",

    "{} weekly {}",

    "{} today {}",

    "{} yesterday {}",

    "{} this week {}",

    "{} this month {}",

    "{} bill {}",

    "{} recharge {}",

    "{} booking {}",

    "{} subscription {}",

    "{} shopping {}",

    "{} food {}",

]

# ======================================================
# HINGLISH TEMPLATES
# ======================================================

HINGLISH_TEMPLATES = [

    "{} {} liya",

    "{} {} kharida",

    "{} {} order kiya",

    "{} {} mangaya",

    "{} {} book ki",

    "{} {} bharwaya",

    "{} {} diya",

    "{} {} ka payment",

    "{} {} ke liye payment",

    "{} {} se liya",

    "{} {} se mangaya",

    "{} {} pe khaya",

    "{} {} pe gaya",

    "{} {} recharge kiya",

    "{} {} bhar diya",

    "{} {} ka bill",

    "{} {} monthly payment",

]

# ======================================================
# MERCHANT ALIASES
# ======================================================

ALIASES = {

    "Swiggy":[
        "Swiggy",
        "swiggy",
        "SWIGGY",
        "Swigy"
    ],

    "Zomato":[
        "Zomato",
        "zomato",
        "Zomoto",
        "Zomotoo"
    ],

    "Amazon":[
        "Amazon",
        "amazon",
        "Amzn"
    ],

    "Flipkart":[
        "Flipkart",
        "flipkart",
        "Flip Cart"
    ],

    "Uber":[
        "Uber",
        "uber",
        "UBER"
    ],

    "Ola":[
        "Ola",
        "ola"
    ],

    "Netflix":[
        "Netflix",
        "netflix",
        "Netflix Premium"
    ],

    "Jio":[
        "Jio",
        "Reliance Jio"
    ]

}

# ======================================================
# TYPO MAP
# ======================================================

TYPO_MAP = {

    "Swiggy":[
        "swigy",
        "swiggi",
        "swiggey"
    ],

    "Zomato":[
        "zomoto",
        "zomtao"
    ],

    "Amazon":[
        "amzon",
        "amazn"
    ],

    "Flipkart":[
        "flipkartt",
        "flipcart"
    ],

    "Uber":[
        "uberr"
    ],

    "Netflix":[
        "netfix",
        "netfllix"
    ],

    "Airtel":[
        "airtell"
    ]

}

# ======================================================
# EXTRA WORDS
# ======================================================

TIME_WORDS = [

    "today",
    "yesterday",
    "morning",
    "afternoon",
    "evening",
    "night",
    "weekend",
    "month end"

]

PAYMENT_WORDS = [

    "cash",
    "upi",
    "gpay",
    "phonepe",
    "paytm",
    "credit card",
    "debit card"

]

CITY_WORDS = [

    "Delhi",
    "Jaipur",
    "Mumbai",
    "Pune",
    "Agra",
    "Lucknow",
    "Noida",
    "Bangalore",
    "Hyderabad"

]
# ==========================================================
# CONTEXT WORDS
# ==========================================================

CONTEXTS = [

    "for hostel",

    "for college",

    "after class",

    "during trip",

    "with friends",

    "for family",

    "during vacation",

    "for office",

    "late night",

    "morning",

    "evening",

    "weekend",

    "monthly",

    "urgent purchase",

    "daily expense",

    "festival shopping",

    "birthday",

    "exam week",

    "hostel life"

]

# ==========================================================
# LANGUAGE STYLE
# ==========================================================

LANGUAGE_STYLE = [

    "english",

    "hinglish"

]

# ==========================================================
# RANDOM HELPERS
# ==========================================================

def chance(percent):

    return random.randint(1,100)<=percent


def merchant_name(name):

    if name in ALIASES and chance(35):
        return random.choice(ALIASES[name])

    if name in TYPO_MAP and chance(8):
        return random.choice(TYPO_MAP[name])

    return name


def payment():

    return random.choice(PAYMENT_WORDS)


def city():

    return random.choice(CITY_WORDS)


def context():

    return random.choice(CONTEXTS)


def language():

    return random.choice(LANGUAGE_STYLE)
    # ==========================================================
# SENTENCE GENERATOR
# ==========================================================

def build_sentence(category, merchant, item):

    merchant = merchant_name(merchant)

    style = language()

    if style == "english":

        template = random.choice(ENGLISH_TEMPLATES)

        sentence = template.format(item, merchant)

    else:

        template = random.choice(HINGLISH_TEMPLATES)

        sentence = template.format(merchant, item)

    # 40% payment method
    if chance(40):
        sentence += " using " + payment()

    # 30% city
    if chance(30):
        sentence += " in " + city()

    # 45% context
    if chance(45):
        sentence += " " + context()

    # 25% time
    if chance(25):
        sentence += " " + random.choice(TIME_WORDS)

    return " ".join(sentence.split())


# ==========================================================
# CATEGORY GENERATOR
# ==========================================================

def generate_category(category,
                      merchants,
                      items,
                      target_count):

    dataset = set()

    while len(dataset) < target_count:

        merchant = random.choice(merchants)

        item = random.choice(items)

        text = build_sentence(category,
                              merchant,
                              item)

        dataset.add((text, category))

    return list(dataset)


# ==========================================================
# GENERATE DATA
# ==========================================================

rows = []

rows.extend(
    generate_category(
        "Food",
        FOOD_MERCHANTS,
        FOOD_ITEMS,
        CATEGORY_DISTRIBUTION["Food"]
    )
)

rows.extend(
    generate_category(
        "Shopping",
        SHOPPING_MERCHANTS,
        SHOPPING_ITEMS,
        CATEGORY_DISTRIBUTION["Shopping"]
    )
)

rows.extend(
    generate_category(
        "Travel",
        TRAVEL_MERCHANTS,
        TRAVEL_ITEMS,
        CATEGORY_DISTRIBUTION["Travel"]
    )
)

rows.extend(
    generate_category(
        "Entertainment",
        ENTERTAINMENT_MERCHANTS,
        ENTERTAINMENT_ITEMS,
        CATEGORY_DISTRIBUTION["Entertainment"]
    )
)

rows.extend(
    generate_category(
        "Bills",
        BILL_MERCHANTS,
        BILL_ITEMS,
        CATEGORY_DISTRIBUTION["Bills"]
    )
)

rows.extend(
    generate_category(
        "Rent",
        RENT_MERCHANTS,
        RENT_ITEMS,
        CATEGORY_DISTRIBUTION["Rent"]
    )
)
# ==========================================================
# SHUFFLE DATASET
# ==========================================================

random.shuffle(rows)

df = pd.DataFrame(rows, columns=["text", "category"])

# Remove duplicates just in case
df = df.drop_duplicates(subset=["text"])

# Shuffle again
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

print("=" * 60)
print("FINAL DATASET")
print("=" * 60)
print(df.head())

print()
print(df["category"].value_counts())

print()
print("Total Samples :", len(df))


# ==========================================================
# SAVE CSV
# ==========================================================

os.makedirs("dataset", exist_ok=True)

OUTPUT_PATH = os.path.join(
    "dataset",
    "expenses_dataset.csv"
)

df.to_csv(
    OUTPUT_PATH,
    index=False,
    encoding="utf-8"
)

print()
print("=" * 60)
print("DATASET SAVED")
print("=" * 60)
print(OUTPUT_PATH)
print()


# ==========================================================
# RANDOM EXAMPLES
# ==========================================================

print("=" * 60)
print("SAMPLE DATA")
print("=" * 60)

for _, row in df.sample(20).iterrows():
    print(f"{row['text']} ---> {row['category']}")

print()
print("Dataset Generation Completed Successfully 🚀")
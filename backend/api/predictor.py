"""
Smart Category Predictor
- Primary:  Trained ML model (TF-IDF + Naive Bayes)
- Fallback: Keyword/fuzzy matching for unknown brands
"""

KEYWORD_MAP = {
    "Food": [
        "swiggy","zomato","blinkit","zepto","dunzo","bigbasket","jiomart",
        "milkbasket","instamart","pizza hut","domino","kfc","mcdonald",
        "burger king","subway","fasos","box8","eatfit","behrouz","oven story",
        "theobroma","chaayos","starbucks","cafe coffee day","ccd","third wave",
        "blue tokai","barista","costa coffee","naturals","baskin","amul",
        "kwality","dmart","reliance fresh","more supermarket","star bazaar",
        "spencer","licious","freshhome","country delight","britannia","haldiram",
        "food","meal","lunch","dinner","breakfast","snack","tiffin","dabba","khana","khaana","nashta","bhojan","sabzi","roti","chawal","biryani","chai","dudh","dahi","paneer","mithai","nashta","khaya","khayi","peena","piya","order kiya","mangaya","ghar ka","bahar khaya","outside food","delivery","grocery","kirana","bazaar","market","canteen","dhaba","restaurant","cafe","momos","shawarma","paratha","poha","dosa","idli","vada","samosa","pani puri","golgappa","chole","pav bhaji","roll","kebab","thali","meals","brunch","snacks","biscuit","namkeen","juice","lassi","smoothie","cold drink","nimbu pani","anda","atte","maida","tel","ghee","masala","sugar","namak",
        "kirana","grocery","vegetable","fruit","milk","bread","restaurant",
        "cafe","chai","biryani","pizza","burger","dhaba","mess","canteen",
        "eating","khana","nashta",
    ],
    "Travel": [
        "uber","ola","rapido","meru","nuego","abhibus","redbus","vrl",
        "parveen","kallada","upsrtc","msrtc","ksrtc","gsrtc","tsrtc","apsrtc",
        "volvo bus","sleeper bus","ac bus","indigo","air india","spicejet",
        "vistara","akasa","go first","makemytrip","goibibo","yatra",
        "easemytrip","cleartrip","irctc","confirmtkt","ixigo","trainman",
        "oyo rooms","treebo","fabhotel","zostel","airbnb","lemon tree",
        "zoomcar","drivezy","revv","petrol","diesel","fuel","toll","parking",
        "auto","rickshaw","metro","train","flight","bus","cab","taxi",
        "travel","trip","journey","ride","ticket","station","airport",
        "railway","highway","bike service","car service","tyre","vehicle",
        "safar","yatra",
    ],
    "Entertainment": [
        "netflix","prime video","hotstar","disney","sonyliv","zee5",
        "jiocinema","mxplayer","voot","lionsgate","mubi","apple tv",
        "spotify","gaana","wynk","jiosaavn","hungama","resso",
        "bgmi","pubg","free fire","battlegrounds","garena","steam",
        "epic games","playstation","xbox","nintendo","game pass","ps plus",
        "roblox","minecraft","bookmyshow","pvr","inox","cinepolis",
        "carnival cinema","fun cinema","miraj cinema",
        "bowling","escape room","imagica","wonderla","snow world","smaaash",
        "time zone","fun zone","amusement park","water park","theme park",
        "movie","cinema","concert","show","event","entertainment","pub",
        "bar","lounge","nightclub","comedy","theatre","match","ipl",
        "cricket match","sports event","game","gaming",
    ],
    "Shopping": [
        "myntra","ajio","zudio","tira","nykaa fashion","sugar cosmetics","mamaearth","mcaffeine","minimalist","the derma co","plum","dot and key","good glamm","myglamm","colorbar","faces canada","h&m","zara","uniqlo","gap","westside",
        "pantaloons","max fashion","vmart","reliance trends","fbb","lifestyle",
        "shoppers stop","central mall","brand factory","marks spencer",
        "meesho","flipkart","amazon","snapdeal","tata cliq","nykaa",
        "purplle","mamaearth","croma","vijay sales","reliance digital",
        "apple store","samsung store","oneplus","mi store","boat","noise",
        "puma","nike","adidas","reebok","bata","metro shoes","woodland",
        "liberty shoes","decathlon","crossword","lakme","vlcc",
        "jawed habib","naturals salon","ylg","enrich salon",
        "clothes","clothing","shopping","purchase","order","shoes","shirt",
        "jeans","kurta","saree","dress","outfit","cosmetics","beauty",
        "makeup","perfume","watch","bag","furniture","decor","salon",
        "haircut","hair colour","parlour","spa","waxing","facial","kapde",
    ],
    "Bills": [
        "jio","airtel","bsnl","vi ","vodafone","idea","recharge","postpaid",
        "prepaid","mobile bill","hathway","act fibernet","excitel",
        "you broadband","spectranet","tikona","broadband","internet bill",
        "tata play","tata sky","dish tv","d2h","sundirect","videocon d2h",
        "airtel dth","bses","msedcl","tneb","bescom","wbsedcl","cesc",
        "torrent power","adani electricity","electricity bill","indane",
        "hp gas","bharat gas","mahanagar gas","igl gas","gas cylinder",
        "gas bill","emi","loan payment","credit card bill","lic premium",
        "insurance premium","hdfc emi","sbi emi","icici emi","axis emi",
        "bajaj finserv","paytm postpaid","lazypay","simpl",
        "property tax","municipal tax","water tax","bill","utility",
        "bijli","phone bill",
    ],
    "Rent": [
        "stanza living","oyo life","nestaway","zolo","good fellas",
        "colive","housr","cove","rent","pg","paying guest","hostel",
        "accommodation","flat rent","room rent","apartment","1bhk","2bhk",
        "3bhk","society maintenance","maintenance charges","society fee",
        "mess charges","coliving","studio apartment","kiraya",
    ],
}


def keyword_predict(text: str):
    text_lower = text.lower().strip()
    scores = {cat: 0 for cat in KEYWORD_MAP}

    for category, keywords in KEYWORD_MAP.items():
        for kw in keywords:
            if kw in text_lower:
                scores[category] += len(kw.split())

    best_cat   = max(scores, key=scores.get)
    best_score = scores[best_cat]

    if best_score == 0:
        return None

    confidence = min(95, 50 + best_score * 15)
    return {"category": best_cat, "confidence": round(confidence, 1), "method": "keyword"}


def smart_predict(model, text: str) -> dict:
    text = text.strip()
    if not text:
        return {"category": "Shopping", "confidence": 0, "method": "default"}

    ml_category = model.predict([text])[0]
    ml_proba    = model.predict_proba([text])
    ml_conf     = round(max(ml_proba[0]) * 100, 1)

    if ml_conf >= 45:
        return {"category": ml_category, "confidence": ml_conf, "method": "ml"}

    kw_result = keyword_predict(text)
    if kw_result:
        return kw_result

    return {"category": ml_category, "confidence": ml_conf, "method": "ml_low_confidence"}

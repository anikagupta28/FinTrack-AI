import { useState, useEffect } from "react";
import { api, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, getCurrentMonth } from "../utils/api";

// ── Kharcha Score ─────────────────────────────────────
export function KharchaScore({ lang, globalMonth, setGlobalMonth }) {
  const [score, setScore]     = useState(null);
  const [loading, setLoading] = useState(false);
  // globalMonth = globalMonth prop

  const t = {
    title:   lang === "hi" ? "खर्चा स्कोर"                      : "Kharcha Score",
    subtitle:lang === "hi" ? "मासिक वित्तीय स्वास्थ्य स्कोर"   : "Your monthly financial health score",
    loading: lang === "hi" ? "गणना हो रही है..."                : "Calculating...",
    total:   lang === "hi" ? "कुल खर्च"                         : "Total Spent",
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await api.getKharchaScore(globalMonth);
      setScore(data);
      setLoading(false);
    };
    fetch();
  }, [globalMonth]);

  const ringColor = !score ? "#e5e7eb"
    : score.score >= 80 ? "#22c55e"
    : score.score >= 60 ? "#eab308"
    : score.score >= 40 ? "#f97316"
    : "#ef4444";

  const scoreColor = !score ? "text-gray-400"
    : score.score >= 80 ? "text-green-500"
    : score.score >= 60 ? "text-yellow-500"
    : score.score >= 40 ? "text-orange-500"
    : "text-red-500";

  const circumference = 2 * Math.PI * 54;
  const strokeDash = score ? `${(score.score / 100) * circumference} ${circumference}` : `0 ${circumference}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">🏆 {t.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t.subtitle}</p>
        </div>
        <input type="month" value={globalMonth} onChange={e => setGlobalMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-gray-400 text-sm">⏳ {t.loading}</div>
      ) : score ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="54" fill="none" stroke="#f3f4f6" strokeWidth="14"/>
              <circle cx="80" cy="80" r="54" fill="none" stroke={ringColor} strokeWidth="14"
                strokeDasharray={strokeDash} strokeLinecap="round"
                transform="rotate(-90 80 80)"
                style={{ transition: "stroke-dasharray 1s ease" }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${scoreColor}`}>{score.score}</span>
              <span className={`text-sm font-bold ${scoreColor}`}>{score.grade}</span>
            </div>
          </div>
          <p className="text-sm text-gray-700 text-center font-medium">{score.emoji} {score.message}</p>
          <p className="text-sm text-gray-400">{t.total}: ₹{score.total_spent?.toLocaleString("en-IN")}</p>
          {score.details?.length > 0 && (
            <div className="w-full space-y-1.5">
              {score.details.map((d, i) => (
                <p key={i} className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">• {d}</p>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ── Savings Suggestions ───────────────────────────────
export function SavingsSuggestions({ lang, globalMonth, setGlobalMonth }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  // globalMonth = globalMonth prop

  const t = {
    title:    lang === "hi" ? "स्मार्ट बचत सुझाव"         : "Smart Savings Suggestions",
    subtitle: lang === "hi" ? "AI द्वारा बचत के सुझाव"    : "AI-powered tips to save more",
    saving:   lang === "hi" ? "संभावित बचत"               : "Potential saving",
    tips:     lang === "hi" ? "सुझाव"                     : "Tips",
    total:    lang === "hi" ? "कुल संभावित बचत इस महीने"  : "Total potential savings this month",
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const d = await api.getSuggestions(globalMonth);
      setData(d);
      setLoading(false);
    };
    fetch();
  }, [globalMonth]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">💡 {t.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t.subtitle}</p>
        </div>
        <input type="month" value={globalMonth} onChange={e => setGlobalMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">⏳</div>
      ) : data ? (
        <div className="space-y-4">
          {data.total_potential_savings > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-sm font-semibold text-green-700">
                🎯 {t.total}: ₹{data.total_potential_savings.toLocaleString("en-IN")}/month
              </p>
            </div>
          )}
          {data.suggestions.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  {CATEGORY_ICONS[s.category] || "💡"} {s.category}
                </span>
                {s.potential_saving > 0 && (
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">
                    {t.saving}: ₹{s.potential_saving.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-3">{s.message}</p>
              {s.tips?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.tips}</p>
                  {s.tips.map((tip, j) => (
                    <p key={j} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">→ {tip}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ── Goal Predictor ────────────────────────────────────
export function GoalPredictor({ lang }) {
  const [form, setForm]       = useState({ title: "", target: "", months: 6 });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals]     = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  const t = {
    title:      lang === "hi" ? "बचत लक्ष्य"               : "Savings Goal Predictor",
    subtitle:   lang === "hi" ? "लक्ष्य बनाएं और ट्रैक करें" : "Set a goal and track your progress",
    goalName:   lang === "hi" ? "लक्ष्य का नाम"            : "Goal Name",
    target:     lang === "hi" ? "लक्ष्य राशि (₹)"          : "Target Amount (₹)",
    months:     lang === "hi" ? "कितने महीनों में?"         : "Achieve in (months)",
    predict:    lang === "hi" ? "लक्ष्य सेट करें"           : "Predict & Save Goal",
    loading:    lang === "hi" ? "गणना हो रही है..."         : "Calculating...",
    monthlyNeed:lang === "hi" ? "मासिक बचत जरूरी"           : "Monthly saving needed",
    avgSpend:   lang === "hi" ? "औसत मासिक खर्च"           : "Avg monthly spend",
    saved:      lang === "hi" ? "मेरे लक्ष्य"               : "My Saved Goals",
    noGoals:    lang === "hi" ? "कोई लक्ष्य नहीं।"          : "No goals saved yet. Add one above!",
    delete:     lang === "hi" ? "हटाएं"                     : "Delete",
    target_lbl: lang === "hi" ? "लक्ष्य"                    : "Target",
    duration:   lang === "hi" ? "अवधि"                      : "Duration",
    mo:         lang === "hi" ? "महीने"                     : "months",
  };

  const fetchGoals = async () => {
    setGoalsLoading(true);
    try { setGoals(await api.getGoals()); } catch(e) { console.error(e); }
    setGoalsLoading(false);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handlePredict = async () => {
    if (!form.title || !form.target) return;
    setLoading(true);
    try {
      const data = await api.predictGoal({
        title: form.title, target: parseFloat(form.target), months: parseInt(form.months)
      });
      setResult(data);
      setForm({ title: "", target: "", months: 6 });
      await fetchGoals();
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeleting(d => ({...d, [id]: true}));
    await api.deleteGoal(id);
    await fetchGoals();
    setDeleting(d => ({...d, [id]: false}));
  };

  return (
    <div className="space-y-5">
      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">🎯 {t.title}</h3>
        <p className="text-xs text-gray-400 mb-5">{t.subtitle}</p>

        <div className="space-y-3 mb-4">
          <input type="text" placeholder={t.goalName} value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
            <input type="number" placeholder={t.target} value={form.target}
              onChange={e => setForm({...form, target: e.target.value})}
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          </div>
          <div className="flex items-center gap-4 px-1">
            <label className="text-sm text-gray-600 whitespace-nowrap">{t.months}:</label>
            <input type="range" min="1" max="36" value={form.months}
              onChange={e => setForm({...form, months: e.target.value})}
              className="flex-1 accent-indigo-600"/>
            <span className="text-sm font-bold text-indigo-600 w-20 text-right">
              {form.months} {t.mo}
            </span>
          </div>
        </div>

        <button onClick={handlePredict} disabled={loading || !form.title || !form.target}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50">
          {loading ? `⏳ ${t.loading}` : `🎯 ${t.predict}`}
        </button>

        {/* Latest result */}
        {result && (
          <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="font-semibold text-indigo-800 mb-3">✅ {result.goal_title}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{t.monthlyNeed}</p>
                <p className="text-xl font-bold text-indigo-600">
                  ₹{result.monthly_saving_needed?.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{t.avgSpend}</p>
                <p className="text-xl font-bold text-gray-700">
                  ₹{result.current_avg_spend?.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <p className="text-xs text-indigo-700 bg-white rounded-lg px-3 py-2">{result.suggestion}</p>
          </div>
        )}
      </div>

      {/* Saved goals list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">📋 {t.saved}</h3>
        {goalsLoading ? (
          <p className="text-sm text-gray-400 text-center py-4">⏳</p>
        ) : goals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">{t.noGoals}</p>
        ) : (
          <div className="space-y-3">
            {goals.map(g => (
              <div key={g.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{g.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.created_at} · {g.months} {t.mo}</p>
                  </div>
                  <button onClick={() => handleDelete(g.id)} disabled={deleting[g.id]}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 ml-2">
                    {deleting[g.id] ? "..." : "✕"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">{t.target_lbl}</p>
                    <p className="text-sm font-bold text-gray-700">₹{g.target?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">{t.monthlyNeed}</p>
                    <p className="text-sm font-bold text-indigo-600">₹{g.monthly_saving?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">{t.duration}</p>
                    <p className="text-sm font-bold text-gray-700">{g.months} {t.mo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

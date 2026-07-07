import { useState, useEffect } from "react";
import { api, CATEGORIES, CATEGORY_ICONS, getCurrentMonth } from "../utils/api";

export default function BudgetPage({ lang, globalMonth, setGlobalMonth }) {
  const [budgets, setBudgets]   = useState([]);
  const [inputs, setInputs]     = useState({});
  const [saving, setSaving]     = useState({});
  // month from global
  const [loading, setLoading]   = useState(true);

  const t = {
    title:       lang === "en" ? "Budget Planner"            : "बजट योजनाकार",
    subtitle:    lang === "en" ? "Set limits, track spending" : "सीमा तय करें, खर्च ट्रैक करें",
    save:        lang === "en" ? "Save"                       : "सहेजें",
    spent:       lang === "en" ? "Spent"                      : "खर्च",
    remaining:   lang === "en" ? "Remaining"                  : "शेष",
    limit:       lang === "en" ? "Limit"                      : "सीमा",
    over:        lang === "en" ? "Over budget!"               : "बजट से ज़्यादा!",
    warning:     lang === "en" ? "Almost full"                : "लगभग भर गया",
    ok:          lang === "en" ? "On track"                   : "सही है",
    noBudget:    lang === "en" ? "No budget set"              : "बजट सेट नहीं",
    totalBudget: lang === "en" ? "Total Budget"               : "कुल बजट",
    totalSpent:  lang === "en" ? "Total Spent"                : "कुल खर्च",
    totalLeft:   lang === "en" ? "Total Remaining"            : "कुल शेष",
  };

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await api.getBudgets(globalMonth);
      setBudgets(data);
      const inp = {};
      data.forEach(b => { inp[b.category] = b.limit_amount; });
      setInputs(inp);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchBudgets(); }, [globalMonth]);

  const handleSave = async (cat) => {
    if (!inputs[cat]) return;
    setSaving(s => ({...s, [cat]: true}));
    await api.setBudget({ category: cat, limit_amount: parseFloat(inputs[cat]), month: globalMonth });
    await fetchBudgets();
    setSaving(s => ({...s, [cat]: false}));
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLeft   = Math.max(0, totalBudget - totalSpent);
  const budgetMap   = {};
  budgets.forEach(b => { budgetMap[b.category] = b; });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🎯 {t.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{t.subtitle}</p>
        </div>
        <input type="month" value={globalMonth} onChange={e => setGlobalMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
      </div>

      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t.totalBudget, value: totalBudget, color: "text-indigo-600" },
            { label: t.totalSpent,  value: totalSpent,  color: "text-red-500" },
            { label: t.totalLeft,   value: totalLeft,   color: "text-green-600" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{card.label}</p>
              <p className={`text-lg font-bold ${card.color}`}>₹{card.value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">⏳ Loading...</div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const b   = budgetMap[cat];
            const pct = b ? b.percentage : 0;
            const barColor = !b ? "bg-gray-200"
              : b.status === "over"    ? "bg-red-500"
              : b.status === "warning" ? "bg-yellow-400"
              : "bg-indigo-500";
            const badge = !b ? null
              : b.status === "over"    ? { text: t.over,    cls: "bg-red-50 text-red-600 border-red-200" }
              : b.status === "warning" ? { text: t.warning, cls: "bg-yellow-50 text-yellow-700 border-yellow-200" }
              : { text: t.ok, cls: "bg-green-50 text-green-600 border-green-200" };

            return (
              <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                    <span className="font-semibold text-gray-800">{cat}</span>
                  </div>
                  {badge && (
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${badge.cls}`}>{badge.text}</span>
                  )}
                </div>

                <div className="mb-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{t.spent}: ₹{(b?.spent || 0).toLocaleString("en-IN")}</span>
                    <span>{t.limit}: {b ? `₹${b.limit_amount.toLocaleString("en-IN")}` : t.noBudget}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}/>
                  </div>
                  {b && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">{pct}% used</span>
                      <span className={b.status === "over" ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                        {b.status === "over"
                          ? `₹${(b.spent - b.limit_amount).toLocaleString("en-IN")} over`
                          : `₹${b.remaining.toLocaleString("en-IN")} ${t.remaining}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input type="number" min="0"
                      placeholder={b ? "Update limit..." : "Set limit..."}
                      value={inputs[cat] || ""}
                      onChange={e => setInputs(inp => ({...inp, [cat]: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                  </div>
                  <button onClick={() => handleSave(cat)} disabled={saving[cat] || !inputs[cat]}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                    {saving[cat] ? "..." : b ? "Update" : t.save}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

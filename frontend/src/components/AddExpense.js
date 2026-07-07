import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { api, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, getCurrentMonth } from "../utils/api";

export default function AddExpense({ lang, onExpenseAdded }) {
  const [form, setForm]         = useState({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], note: "" });
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [recent, setRecent]       = useState([]);

  const t = {
    title:      lang === "hi" ? "नया खर्च जोड़ें"     : "Add New Expense",
    desc:       lang === "hi" ? "विवरण"                : "Description",
    hint:       lang === "hi" ? "जैसे Swiggy dinner..." : "e.g. Swiggy dinner, Uber ride...",
    amount:     lang === "hi" ? "राशि (₹)"             : "Amount (₹)",
    category:   lang === "hi" ? "श्रेणी"               : "Category",
    detect:     lang === "hi" ? "AI पहचानें"           : "AI Detect",
    date:       lang === "hi" ? "तारीख"                : "Date",
    note:       lang === "hi" ? "नोट"                  : "Note",
    submit:     lang === "hi" ? "खर्च जोड़ें"          : "Add Expense",
    success:    lang === "hi" ? "खर्च जोड़ा गया! ✅"   : "Expense added! ✅",
    detected:   lang === "hi" ? "AI पहचाना"            : "AI detected",
    recent:     lang === "hi" ? "हाल के खर्च"          : "Recent Expenses",
    noRecent:   lang === "hi" ? "कोई खर्च नहीं"        : "No recent expenses yet",
    conf:       lang === "hi" ? "विश्वास"              : "confidence",
  };

  useEffect(() => {
    api.getExpenses(getCurrentMonth()).then(setRecent).catch(() => {});
  }, [success]);

  const handleDetect = async () => {
    if (form.description.length < 2) return;
    setDetecting(true);
    try {
      const r = await api.predictCategory(form.description);
      setDetected(r);
      setForm(f => ({...f, category: r.category}));
    } catch(e) { console.error(e); }
    setDetecting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    setSubmitting(true);
    try {
      await api.addExpense({...form, amount: parseFloat(form.amount)});
      setSuccess(true);
      setForm({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], note: "" });
      setDetected(null);
      if (onExpenseAdded) onExpenseAdded();
      setTimeout(() => setSuccess(false), 3000);
    } catch(e) { console.error(e); }
    setSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
      {/* Form */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {t.title}
          </h2>

          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold flex items-center gap-2">
                ✅ {t.success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Description + AI */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.desc}</label>
              <div className="flex gap-2">
                <input type="text" value={form.description} placeholder={t.hint}
                  onChange={e => setForm({...form, description: e.target.value})}
                  onBlur={handleDetect}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"
                  required/>
                <motion.button type="button" whileTap={{ scale: 0.95 }}
                  onClick={handleDetect} disabled={detecting || !form.description}
                  className="px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                  {detecting ? <span className="animate-spin">⚙️</span> : <Sparkles className="w-3.5 h-3.5"/>}
                  {detecting ? "..." : t.detect}
                </motion.button>
              </div>
              <AnimatePresence>
                {detected && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                      style={{ background: "#f5f3ff", color: "#7c3aed", borderColor: "#ede9fe" }}>
                      ✨ {t.detected}: {CATEGORY_ICONS[detected.category]} {detected.category}
                    </span>
                    <span className="text-xs text-gray-400">{detected.confidence}% {t.conf}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.amount}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                <input type="number" value={form.amount} placeholder="0" min="0"
                  onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"
                  required/>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.category}</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <motion.button key={cat} type="button" whileTap={{ scale: 0.97 }}
                    onClick={() => setForm({...form, category: cat})}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      form.category === cat ? "text-white shadow-md border-transparent" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                    }`}
                    style={form.category === cat ? { background: CATEGORY_COLORS[cat] } : {}}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Date + Note */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.date}</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.note}</label>
                <input type="text" value={form.note} placeholder="Optional..."
                  onChange={e => setForm({...form, note: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"/>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.99 }}
                className="flex-1 py-3.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                {submitting ? "Adding..." : `+ ${t.submit}`}
              </motion.button>
              <button type="button" onClick={() => { setForm({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], note: "" }); setDetected(null); }}
                className="px-4 py-3.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                <RotateCcw className="w-4 h-4"/>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent sidebar */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden sticky top-0">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #faf5ff, #eef2ff)" }}>
            <h3 className="text-sm font-bold text-purple-700">{t.recent}</h3>
            <span className="text-xs text-purple-400 font-medium">{recent.length} this month</span>
          </div>
          {recent.length === 0 ? (
            <div className="py-12 text-center text-gray-300 text-sm">{t.noRecent}</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {recent.slice(0, 5).map((exp, i) => (
                <motion.div key={exp.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${CATEGORY_COLORS[exp.category]}18` }}>
                    {CATEGORY_ICONS[exp.category] || "💸"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{exp.description}</p>
                    <p className="text-xs text-gray-400">{exp.date} · {exp.category}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-700 flex-shrink-0">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

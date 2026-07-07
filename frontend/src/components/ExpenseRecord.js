import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Trash2 } from "lucide-react";
import { api, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, getCurrentMonth } from "../utils/api";

export default function ExpenseRecord({ lang, globalMonth, setGlobalMonth }) {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  // month from global
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [deleting, setDeleting]   = useState({});

  const T = {
    title:    lang === "hi" ? "खर्च का रिकॉर्ड"           : "Expense Records",
    subtitle: lang === "hi" ? "अपने सभी खर्च यहाँ देखें और प्रबंधित करें" : "View and manage all your expenses",
    search:   lang === "hi" ? "खर्च खोजें..."             : "Search expenses...",
    all:      lang === "hi" ? "सभी श्रेणियाँ"              : "All Categories",
    noData:   lang === "hi" ? "कोई खर्च नहीं मिला।"       : "No expenses found.",
    total:    lang === "hi" ? "कुल"                       : "Total",
    entries:  lang === "hi" ? "प्रविष्टियाँ"               : "entries",
    desc:     lang === "hi" ? "विवरण"                     : "Description",
    category: lang === "hi" ? "श्रेणी"                    : "Category",
    date:     lang === "hi" ? "तारीख"                     : "Date",
    amount:   lang === "hi" ? "राशि"                      : "Amount",
    summary:  lang === "hi" ? "श्रेणी सारांश"              : "Category Summary",
    loading:  lang === "hi" ? "लोड हो रहा है..."           : "Loading...",
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try { setExpenses(await api.getExpenses(globalMonth)); }
    catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, [globalMonth]);

  const handleDelete = async (id) => {
    setDeleting(d => ({...d, [id]: true}));
    await api.deleteExpense(id);
    await fetchExpenses();
    setDeleting(d => ({...d, [id]: false}));
  };

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === "All" || e.category === filterCat;
    return matchSearch && matchCat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const catSummary = {};
  expenses.forEach(e => { catSummary[e.category] = (catSummary[e.category] || 0) + e.amount; });

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          {T.title}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{T.subtitle}</p>
      </div>

      {/* Category summary cards */}
      {Object.keys(catSummary).length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{T.summary}</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.filter(c => catSummary[c]).map(cat => (
              <motion.div key={cat} whileHover={{ scale: 1.03 }}
                onClick={() => setFilterCat(filterCat === cat ? "All" : cat)}
                className={`bg-white rounded-xl border p-3 text-center shadow-sm cursor-pointer transition-all ${
                  filterCat === cat ? "border-2" : "border-purple-50"
                }`}
                style={filterCat === cat ? { borderColor: CATEGORY_COLORS[cat] } : {}}>
                <div className="text-xl mb-1">{CATEGORY_ICONS[cat]}</div>
                <p className="text-xs text-gray-500 font-medium truncate">{cat}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: CATEGORY_COLORS[cat] }}>
                  ₹{catSummary[cat].toLocaleString("en-IN")}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input type="text" placeholder={T.search} value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"/>
        </div>
        <input type="month" value={globalMonth} onChange={e => setGlobalMonth(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium"/>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium">
          <option value="All">{T.all}</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
      </div>

      {/* Count + total */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400 font-medium">{filtered.length} {T.entries}</p>
        <p className="text-sm font-bold text-gray-700">
          {T.total}: <span style={{ color:"#7c3aed" }}>₹{total.toLocaleString("en-IN")}</span>
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100">
          <span className="col-span-5 text-xs font-bold text-gray-500 uppercase tracking-wide">{T.desc}</span>
          <span className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{T.category}</span>
          <span className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wide">{T.date}</span>
          <span className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">{T.amount}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"/>
              <p className="text-xs text-gray-400">{T.loading}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm text-gray-400">{T.noData}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
            {filtered.map((exp, i) => (
              <motion.div key={exp.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.015 }}
                className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-purple-50/40 transition-colors group">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background:`${CATEGORY_COLORS[exp.category]}18` }}>
                    {CATEGORY_ICONS[exp.category] || "💸"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{exp.description}</p>
                    {exp.note && <p className="text-xs text-gray-400 truncate">{exp.note}</p>}
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background:`${CATEGORY_COLORS[exp.category]}18`, color:CATEGORY_COLORS[exp.category] }}>
                    {exp.category}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">{exp.date}</p>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="text-sm font-bold text-gray-800">₹{exp.amount.toLocaleString("en-IN")}</span>
                  <button onClick={() => handleDelete(exp.id)} disabled={deleting[exp.id]}
                    className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                    {deleting[exp.id] ? "..." : <Trash2 className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

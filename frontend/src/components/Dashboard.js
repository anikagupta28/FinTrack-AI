import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Receipt, BarChart3, TrendingUp, Sparkles } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { api, CATEGORY_COLORS, CATEGORY_ICONS, getCurrentMonth } from "../utils/api";

const StatCard = ({ icon: Icon, label, value, sub, gradient, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="rounded-2xl p-5 text-white cursor-default relative overflow-hidden"
    style={{ background: gradient }}>
    <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10"
      style={{ background: "white", transform: "translate(30%,-30%)" }}/>
    <div className="flex items-start justify-between relative">
      <div>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold mb-0.5">{value}</p>
        {sub && <p className="text-white/60 text-xs">{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5"/>
      </div>
    </div>
  </motion.div>
);

// Custom donut center label


// Custom X axis tick for daily chart — show every 5th day clearly
const DayTick = ({ x, y, payload }) => {
  const day = parseInt(payload.value);
  if (day % 5 !== 0 && day !== 1) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#9ca3af" fontSize={10} fontWeight={500}>
        {payload.value}
      </text>
    </g>
  );
};

export default function Dashboard({ lang, refresh, onNavigate, globalMonth, setGlobalMonth }) {
  const [expenses, setExpenses] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(true);
  // month prop from App.js

  const T = {
    total:     lang === "hi" ? "कुल खर्च"         : "Total Spent",
    trans:     lang === "hi" ? "लेनदेन"           : "Transactions",
    topCat:    lang === "hi" ? "सर्वाधिक खर्च"    : "Top Category",
    daily:     lang === "hi" ? "प्रतिदिन औसत"     : "Daily Average",
    breakdown: lang === "hi" ? "श्रेणी अनुसार खर्च": "Spending by Category",
    trend:     lang === "hi" ? "दैनिक खर्च प्रवृत्ति": "Daily Spending Trend",
    insights:  lang === "hi" ? "AI अंतर्दृष्टि"   : "AI Insights",
    recent:    lang === "hi" ? "हाल के खर्च"     : "Recent Expenses",
    viewAll:   lang === "hi" ? "सभी देखें →"      : "View all →",
    noData:    lang === "hi" ? "इस महीने कोई खर्च नहीं।" : "No expenses this month.",
    thisMonth: lang === "hi" ? "इस महीने"         : "this month",
    perDay:    lang === "hi" ? "प्रतिदिन"         : "per day",
    day:       lang === "hi" ? "दिन"              : "Day",
    spent:     lang === "hi" ? "खर्च"             : "Spent",
    loading:   lang === "hi" ? "लोड हो रहा है..."  : "Loading...",
    category:  lang === "hi" ? "श्रेणी"           : "Category",
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [exp, anal] = await Promise.all([
          api.getExpenses(globalMonth),
          api.getAnalysis(globalMonth)
        ]);
        setExpenses(exp);
        setAnalysis(anal);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [globalMonth, refresh]);

  const handleDelete = async (id) => {
    await api.deleteExpense(id);
    const [exp, anal] = await Promise.all([api.getExpenses(globalMonth), api.getAnalysis(globalMonth)]);
    setExpenses(exp); setAnalysis(anal);
  };

  const total   = expenses.reduce((s, e) => s + e.amount, 0);
  const topCat  = analysis?.breakdown?.[0];
  const days    = new Date(globalMonth.split("-")[0], globalMonth.split("-")[1], 0).getDate();

  // Pie/Donut data
  const pieData = (analysis?.breakdown || []).map(b => ({
    name:  b.category,
    value: b.amount,
  }));

  // Daily trend — fill all days 1..end with 0 if no spend
  const dailyMap = {};
  expenses.forEach(e => {
    const d = parseInt(e.date.split("-")[2]);
    dailyMap[d] = (dailyMap[d] || 0) + e.amount;
  });
  // Only days that have data, sorted
  const trendData = Object.keys(dailyMap)
    .map(Number).sort((a, b) => a - b)
    .map(d => ({ day: String(d), amount: Math.round(dailyMap[d]) }));

  const GRADIENTS = [
    "linear-gradient(135deg,#7c3aed,#4f46e5)",
    "linear-gradient(135deg,#0891b2,#0e7490)",
    "linear-gradient(135deg,#d97706,#b45309)",
    "linear-gradient(135deg,#059669,#047857)",
  ];

  // Translate AI insight messages to Hindi if needed
  const translateInsight = (msg) => {
    if (lang === "en") return msg;
    // Basic pattern replacements for Hindi
    return msg
      .replace("Your highest spending this month is", "इस महीने सबसे ज़्यादा खर्च")
      .replace(" at ₹", " पर ₹")
      .replace("You spent", "आपने")
      .replace("% on", "% खर्च")
      .replace("this month — recommended is", "किया — अनुशंसित है")
      .replace("Your", "आपका")
      .replace("spending is well under control", "खर्च नियंत्रण में है")
      .replace("⚠️", "⚠️")
      .replace("✅", "✅")
      .replace("📊", "📊");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          {lang === "hi" ? "अवलोकन" : "Overview"}
        </h1>
        <input type="month" value={globalMonth} onChange={e => setGlobalMonth(e.target.value)}
          className="px-3 py-2 rounded-xl border border-purple-200 text-sm bg-white text-gray-700 font-medium"/>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"/>
            <p className="text-sm text-gray-400">{T.loading}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet}     label={T.total}   gradient={GRADIENTS[0]} delay={0.1}
              value={`₹${total.toLocaleString("en-IN")}`}
              sub={`${expenses.length} ${T.thisMonth}`}/>
            <StatCard icon={Receipt}    label={T.trans}   gradient={GRADIENTS[1]} delay={0.2}
              value={expenses.length} sub={T.thisMonth}/>
            <StatCard icon={BarChart3}  label={T.topCat}  gradient={GRADIENTS[2]} delay={0.3}
              value={topCat ? `${CATEGORY_ICONS[topCat.category]} ${topCat.category}` : "—"}
              sub={topCat ? `₹${topCat.amount.toLocaleString("en-IN")}` : ""}/>
            <StatCard icon={TrendingUp} label={T.daily}   gradient={GRADIENTS[3]} delay={0.4}
              value={`₹${Math.round(total / days).toLocaleString("en-IN")}`}
              sub={T.perDay}/>
          </div>

          {/* Charts row */}
          {pieData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* ── Donut chart (circle wala) ── */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-purple-600 inline-block"/>
                  {T.breakdown}
                </h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={3} dataKey="value"
                        startAngle={90} endAngle={-270}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#7c3aed"}/>
                        ))}
    
                      </Pie>
                      <Tooltip
                        formatter={(v, name) => [`₹${v.toLocaleString("en-IN")}`, name]}
                        contentStyle={{ borderRadius:12, border:"1px solid #e5e7eb", fontSize:12 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex-1 space-y-2.5">
                    {pieData.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: CATEGORY_COLORS[entry.name] }}/>
                          <span className="text-xs text-gray-600 truncate">
                            {CATEGORY_ICONS[entry.name]} {entry.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-700 flex-shrink-0">
                          ₹{entry.value.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── Daily bar chart ── */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
                className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-indigo-500 inline-block"/>
                  {T.trend}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  {lang === "hi" ? "हर दिन का खर्च (तारीख अनुसार)" : "Spending per day of the globalMonth"}
                </p>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={trendData}
                      margin={{ top:5, right:8, left:-18, bottom:18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f0ff" vertical={false}/>
                      <XAxis
                        dataKey="day"
                        tick={<DayTick/>}
                        interval={0}
                        axisLine={{ stroke:"#e9d5ff" }}
                        tickLine={false}
                        label={{
                          value: T.day,
                          position: "insideBottom",
                          offset: -10,
                          fontSize: 10,
                          fill: "#a78bfa"
                        }}
                      />
                      <YAxis
                        tick={{ fontSize:9, fill:"#9ca3af" }}
                        tickFormatter={v => v >= 1000 ? `${v/1000}k` : v}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={v => [`₹${v.toLocaleString("en-IN")}`, T.spent]}
                        labelFormatter={l => `${T.day} ${l}`}
                        contentStyle={{ borderRadius:12, border:"1px solid #e5e7eb", fontSize:12 }}
                        cursor={{ fill:"#f5f3ff" }}
                      />
                      <Bar dataKey="amount" radius={[5,5,0,0]} fill="#7c3aed" maxBarSize={28}/>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
                    {lang === "hi" ? "खर्च जोड़ें ट्रेंड देखने के लिए" : "Add expenses to see daily trend"}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* AI Insights */}
          {analysis?.insights?.length > 0 && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
              className="rounded-2xl p-5 border border-purple-100"
              style={{ background:"linear-gradient(135deg,#faf5ff,#eef2ff)" }}>
              <h3 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4"/> {T.insights}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.insights.map((ins, i) => (
                  <div key={i}
                    className="bg-white/70 rounded-xl px-4 py-3 text-sm text-gray-700 border border-purple-100">
                    {translateInsight(ins.message)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent — only 5 */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }}
            className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700">{T.recent}</h3>
              <button onClick={() => onNavigate && onNavigate("records")}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors">
                {T.viewAll}
              </button>
            </div>
            {expenses.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">{T.noData}</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {expenses.slice(0, 5).map((exp, i) => (
                  <motion.div key={exp.id}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-purple-50/40 transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background:`${CATEGORY_COLORS[exp.category]}18` }}>
                      {CATEGORY_ICONS[exp.category] || "💸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{exp.description}</p>
                      <p className="text-xs text-gray-400">
                        {exp.date} ·{" "}
                        <span style={{ color: CATEGORY_COLORS[exp.category] }}>{exp.category}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        ₹{exp.amount.toLocaleString("en-IN")}
                      </span>
                      <button onClick={() => handleDelete(exp.id)}
                        className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all">
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

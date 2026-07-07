import { useState } from "react";
import { KharchaScore, SavingsSuggestions, GoalPredictor } from "./AIFeatures";

const TABS = [
  { id: "score",       en: "Kharcha Score",  hi: "खर्चा स्कोर",  icon: "🏆" },
  { id: "suggestions", en: "Savings Tips",   hi: "बचत सुझाव",    icon: "💡" },
  { id: "goal",        en: "Goal Predictor", hi: "लक्ष्य प्रेडिक्टर", icon: "🎯" },
];

export default function AnalysisPage({ lang, defaultTab, globalMonth, setGlobalMonth }) {
  const [activeTab, setActiveTab] = useState(defaultTab || "score");

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          {lang === "hi" ? "AI विश्लेषण" : "AI Analysis"}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {lang === "hi" ? "आपके खर्च का स्मार्ट विश्लेषण" : "Smart insights powered by your spending data"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-purple-50 shadow-sm p-1.5 gap-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-purple-50"
            }`}
            style={activeTab === tab.id ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)" } : {}}>
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{lang === "hi" ? tab.hi : tab.en}</span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === "score"       && <KharchaScore       lang={lang} globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>}
        {activeTab === "suggestions" && <SavingsSuggestions lang={lang} globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>}
        {activeTab === "goal"        && <GoalPredictor       lang={lang} globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>}
      </div>
    </div>
  );
}

import { useState } from "react";

export default function Navbar({ lang, setLang, activePage, setActivePage, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", en: "Dashboard",   hi: "डैशबोर्ड",    icon: "📊" },
    { id: "add",       en: "Add Expense", hi: "खर्च जोड़ें",  icon: "➕" },
    { id: "analysis",  en: "AI Analysis", hi: "AI विश्लेषण",  icon: "🤖" },
    { id: "budget",    en: "Budget",      hi: "बजट",          icon: "🎯" },
    { id: "export",    en: "Export",      hi: "निर्यात",       icon: "📥" },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setActivePage("dashboard")}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">₹</div>
          <span className="text-lg font-bold text-gray-800">
            {lang === "hi" ? "खर्चा AI" : "Kharcha AI"}
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activePage === item.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}>
              <span className="text-base">{item.icon}</span>
              <span>{lang === "en" ? item.en : item.hi}</span>
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            {lang === "en" ? "हिंदी" : "EN"}
          </button>
          {user && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <button onClick={onLogout}
                className="text-xs px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                Sign out
              </button>
            </div>
          )}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}/>
            <div className={`w-5 h-0.5 bg-gray-600 my-1 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}/>
            <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}/>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-lg">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActivePage(item.id); setMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
                activePage === item.id ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <span>{item.icon}</span>
              <span>{lang === "en" ? item.en : item.hi}</span>
            </button>
          ))}
          {user && (
            <button onClick={onLogout}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-3 transition-all">
              <span>🚪</span>
              <span>Sign out ({user.name})</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

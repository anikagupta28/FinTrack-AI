import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, PlusCircle, Sparkles, Wallet, Target, FileText, Settings, X, TrendingUp, Download } from "lucide-react";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, en: "Dashboard",   hi: "डैशबोर्ड" },
  { id: "add",       icon: PlusCircle,      en: "Add Expense",  hi: "खर्च जोड़ें" },
  { id: "analysis",  icon: Sparkles,        en: "AI Analysis",  hi: "AI विश्लेषण" },
  { id: "budget",    icon: Wallet,          en: "Budget",       hi: "बजट" },
  { id: "goals",     icon: Target,          en: "Goals",        hi: "लक्ष्य" },
  { id: "export",    icon: Download,        en: "Export",       hi: "निर्यात" },
  { id: "settings",  icon: Settings,        en: "Settings",     hi: "सेटिंग्स" },
];

function SidebarContent({ activePage, setActivePage, lang, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            💰
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Kharcha AI
            </h1>
            <p className="text-xs text-gray-400">Smart Expense Tracker</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-purple-50 text-gray-400">
            <X className="w-5 h-5"/>
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-purple-100 to-transparent mb-3"/>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV.map((item, i) => {
          const active = activePage === item.id;
          return (
            <motion.button key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setActivePage(item.id); onClose && onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                active ? "nav-active" : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
              }`}>
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18}/>
              <span>{lang === "hi" ? item.hi : item.en}</span>
              {active && (
                <motion.div layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"/>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom promo card */}
      <div className="p-4">
        <div className="rounded-2xl p-4 border border-purple-100 text-center"
          style={{ background: "linear-gradient(135deg, #f5f3ff, #eef2ff)" }}>
          <div className="text-2xl mb-2">✨</div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Your AI is learning</p>
          <p className="text-xs text-gray-500">Add more expenses for better insights</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ activePage, setActivePage, lang, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-purple-50 shadow-sm"
        style={{ minHeight: "100vh" }}>
        <SidebarContent activePage={activePage} setActivePage={setActivePage} lang={lang}/>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"/>
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
              <SidebarContent activePage={activePage} setActivePage={setActivePage} lang={lang}
                onClose={() => setMobileOpen(false)}/>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

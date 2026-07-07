import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Globe, ChevronDown, LogOut, Settings, Calendar } from "lucide-react";

export default function Topbar({ user, lang, setLang, onLogout, activePage, setActivePage, setMobileOpen, globalMonth, setGlobalMonth }) {
  const [dropOpen, setDropOpen] = useState(false);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (lang === "hi") {
      if (h < 12) return "सुप्रभात"; if (h < 17) return "नमस्ते"; return "शुभ संध्या";
    }
    if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; return "Good evening";
  };

  const PAGE_TITLES = {
    dashboard: { en:"Dashboard",   hi:"डैशबोर्ड"   },
    add:       { en:"Add Expense", hi:"खर्च जोड़ें" },
    analysis:  { en:"AI Analysis", hi:"AI विश्लेषण" },
    budget:    { en:"Budget",      hi:"बजट"         },
    goals:     { en:"Goals",       hi:"लक्ष्य"       },
    records:   { en:"Records",     hi:"रिकॉर्ड"      },
    export:    { en:"Export",      hi:"निर्यात"       },
    settings:  { en:"Settings",    hi:"सेटिंग्स"     },
  };

  // Pages where month picker makes sense
  const showMonthPicker = !["add","settings"].includes(activePage);

  return (
    <header className="h-16 bg-white border-b border-purple-50 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 gap-3">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl hover:bg-purple-50 text-gray-600 flex-shrink-0">
          <Menu className="w-5 h-5"/>
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-800 truncate" style={{fontFamily:"Plus Jakarta Sans"}}>
            {PAGE_TITLES[activePage]?.[lang] || "Dashboard"}
          </h2>
          <p className="text-xs text-gray-400 hidden sm:block">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Global month picker — visible on relevant pages */}
        {showMonthPicker && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-100 bg-purple-50">
            <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0"/>
            <input
              type="month"
              value={globalMonth}
              onChange={e => setGlobalMonth(e.target.value)}
              className="text-xs font-bold text-purple-700 bg-transparent border-none outline-none cursor-pointer w-28"
            />
          </div>
        )}

        {/* Language toggle */}
        <motion.button whileTap={{ scale:0.95 }}
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-100 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-all">
          <Globe className="w-3.5 h-3.5"/>
          {lang === "en" ? "हिंदी" : "EN"}
        </motion.button>

        {/* User dropdown */}
        <div className="relative">
          <button onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-purple-50 border border-purple-100 transition-all">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
              style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-semibold text-gray-700">{user?.name?.split(" ")[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block"/>
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)}/>
              <motion.div initial={{opacity:0,y:8,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
                className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lang === "hi" ? "मेरा खाता" : "My Account"}</p>
                </div>
                <button onClick={() => { setActivePage("settings"); setDropOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2.5 transition-all">
                  <Settings className="w-4 h-4 text-gray-400"/>
                  {lang === "hi" ? "सेटिंग्स" : "Settings"}
                </button>
                <button onClick={onLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-all">
                  <LogOut className="w-4 h-4"/>
                  {lang === "hi" ? "साइन आउट" : "Sign out"}
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

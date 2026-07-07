import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import AddExpense from "./components/AddExpense";
import BudgetPage from "./components/BudgetPage";
import AnalysisPage from "./components/AnalysisPage";
import ExportPage from "./components/ExportPage";
import SettingsPage from "./components/SettingsPage";
import ExpenseRecord from "./components/ExpenseRecord";
import AuthPage from "./components/AuthPage";
import { getUser, getToken, clearAuth, setUnauthorizedHandler } from "./utils/api";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
};

export default function App() {
  const [user, setUser]             = useState(getUser());
  const [lang, setLang]             = useState("en");
  const [activePage, setActivePage] = useState("dashboard");
  const [refresh, setRefresh]       = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionMsg, setSessionMsg] = useState("");

  // Global month — shared across ALL pages
  const [globalMonth, setGlobalMonth] = useState(getCurrentMonth());

  useEffect(() => {
    setUnauthorizedHandler((msg) => { setSessionMsg(msg); setUser(null); });
  }, []);

  const handleLogin  = (data) => { setSessionMsg(""); setUser(data); };
  const handleLogout = ()     => { clearAuth(); setUser(null); setSessionMsg(""); };

  if (!user || !getToken()) {
    return <AuthPage onLogin={handleLogin} sessionMsg={sessionMsg} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage}
        lang={lang} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar user={user} lang={lang} setLang={setLang} onLogout={handleLogout}
          activePage={activePage} setActivePage={setActivePage}
          setMobileOpen={setMobileOpen}
          globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activePage}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-8 }} transition={{ duration:0.18 }}>
                {activePage === "dashboard" && (
                  <Dashboard lang={lang} refresh={refresh}
                    onNavigate={setActivePage}
                    globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>
                )}
                {activePage === "add" && (
                  <AddExpense lang={lang} onExpenseAdded={() => setRefresh(r=>r+1)}/>
                )}
                {activePage === "records" && (
                  <ExpenseRecord lang={lang}
                    globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>
                )}
                {activePage === "analysis" && (
                  <AnalysisPage lang={lang}
                    globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>
                )}
                {activePage === "budget" && (
                  <BudgetPage lang={lang}
                    globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>
                )}
                {activePage === "goals" && (
                  <AnalysisPage lang={lang} defaultTab="goal"
                    globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>
                )}
                {activePage === "export" && (
                  <ExportPage lang={lang}
                    globalMonth={globalMonth} setGlobalMonth={setGlobalMonth}/>
                )}
                {activePage === "settings" && (
                  <SettingsPage lang={lang} setLang={setLang} onLogout={handleLogout}/>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

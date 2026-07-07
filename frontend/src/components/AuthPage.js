import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Sparkles, TrendingUp, PiggyBank, Shield } from "lucide-react";
import { api, saveAuth } from "../utils/api";

export default function AuthPage({ onLogin, sessionMsg }) {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (mode === "register" && !form.name) { setError("Please enter your name."); return; }
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login(form.email, form.password)
        : await api.register(form.name, form.email, form.password);
      saveAuth(data);
      onLogin(data);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const features = [
    { icon: TrendingUp, text: "AI-powered spending analysis" },
    { icon: PiggyBank,  text: "Smart savings recommendations" },
    { icon: Shield,     text: "Secure & private data" },
    { icon: Sparkles,   text: "Kharcha Score — your financial health" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-14"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)", transform: "translate(30%, -30%)" }}/>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)", transform: "translate(-30%, 30%)" }}/>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl border border-white/30">
              💰
            </div>
            <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Kharcha AI
            </h1>
            <p className="text-purple-200 text-lg mb-12">Your intelligent expense companion</p>
          </motion.div>

          <div className="space-y-4 text-left">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 bg-white/15 backdrop-blur rounded-2xl px-5 py-4 border border-white/20"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ffffff 50%, #eef2ff 100%)" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-2">💰</div>
            <h1 className="text-3xl font-bold gradient-text">Kharcha AI</h1>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-8">
            {/* Tabs */}
            <div className="flex bg-purple-50 rounded-2xl p-1 mb-7">
              {["login","register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                    mode === m ? "bg-white shadow text-purple-700" : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {mode === "login" ? "Welcome back!" : "Get started free"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {mode === "login" ? "Sign in to your Kharcha AI account" : "Create your account and start tracking"}
            </p>

            {/* Session expired banner */}
            <AnimatePresence>
              {sessionMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium"
                  style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c" }}>
                  🔐 {sessionMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <AnimatePresence>
                {mode === "register" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Your name" value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"/>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm bg-white"/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handleSubmit} disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 transition-all mt-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
              </motion.button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-5">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-purple-600 font-semibold hover:text-purple-700">
                {mode === "login" ? "Sign up free" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

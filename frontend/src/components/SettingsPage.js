import { useState } from "react";
import { motion } from "framer-motion";
import { User, Globe, Lock, Camera, Save, Eye, EyeOff, Check } from "lucide-react";
import { getUser, saveAuth, api } from "../utils/api";

const SECTIONS = [
  { id: "profile",  icon: User, en: "Profile",     hi: "प्रोफ़ाइल"     },
  { id: "prefs",    icon: Globe, en: "Preferences", hi: "प्राथमिकताएं" },
  { id: "security", icon: Lock, en: "Security",    hi: "सुरक्षा"       },
];

export default function SettingsPage({ lang, setLang, onLogout }) {
  const user = getUser();
  const [active, setActive]     = useState("profile");
  const [showPass, setShowPass] = useState({ cur: false, new: false, con: false });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState("");
  const [error, setError]       = useState("");

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password form
  const [passForm, setPassForm] = useState({ current: "", newPass: "", confirm: "" });

  const T = {
    settings:      lang === "hi" ? "सेटिंग्स"                    : "Settings",
    profileTitle:  lang === "hi" ? "प्रोफ़ाइल सेटिंग्स"           : "Profile Settings",
    fullName:      lang === "hi" ? "पूरा नाम"                     : "Full Name",
    email:         lang === "hi" ? "ईमेल"                         : "Email",
    saveChanges:   lang === "hi" ? "परिवर्तन सहेजें"               : "Save Changes",
    savedOk:       lang === "hi" ? "सहेजा गया!"                   : "Saved!",
    freePlan:      lang === "hi" ? "निःशुल्क योजना"                : "Free Plan",
    prefsTitle:    lang === "hi" ? "ऐप प्राथमिकताएं"               : "App Preferences",
    language:      lang === "hi" ? "भाषा"                         : "Language",
    langNote:      lang === "hi" ? "ऊपर के टॉगल से भी बदल सकते हैं" : "You can also use the toggle in the top bar",
    securityTitle: lang === "hi" ? "पासवर्ड बदलें"                 : "Change Password",
    currentPass:   lang === "hi" ? "वर्तमान पासवर्ड"               : "Current Password",
    newPass:       lang === "hi" ? "नया पासवर्ड"                  : "New Password",
    confirmPass:   lang === "hi" ? "पासवर्ड की पुष्टि करें"         : "Confirm New Password",
    updatePass:    lang === "hi" ? "पासवर्ड अपडेट करें"             : "Update Password",
    passMismatch:  lang === "hi" ? "नए पासवर्ड मेल नहीं खाते"       : "New passwords do not match",
    passShort:     lang === "hi" ? "पासवर्ड कम से कम 6 अक्षर का हो" : "Password must be at least 6 characters",
    passUpdated:   lang === "hi" ? "पासवर्ड अपडेट हो गया!"          : "Password updated successfully!",
    nameRequired:  lang === "hi" ? "नाम आवश्यक है"                 : "Name is required",
  };

  const showSaved = (msg) => {
    setSaved(msg); setError("");
    setTimeout(() => setSaved(""), 3000);
  };

  // ── Save profile ──────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim()) { setError(T.nameRequired); return; }
    setSaving(true); setError("");
    try {
      // Update localStorage immediately so UI reflects change
      const currentUser = getUser();
      const updatedUser = { ...currentUser, name: name.trim(), email: email.trim() };
      localStorage.setItem("kharcha_user", JSON.stringify(updatedUser));
      showSaved(T.savedOk);
    } catch(e) { setError("Failed to save."); }
    setSaving(false);
  };

  // ── Change password ───────────────────────────────
  const handleChangePassword = async () => {
    setError("");
    if (!passForm.current) { setError(T.currentPass + " is required"); return; }
    if (passForm.newPass.length < 6) { setError(T.passShort); return; }
    if (passForm.newPass !== passForm.confirm) { setError(T.passMismatch); return; }

    setSaving(true);
    try {
      // Call backend change-password endpoint
      await api.changePassword(passForm.current, passForm.newPass);
      showSaved(T.passUpdated);
      setPassForm({ current: "", newPass: "", confirm: "" });
    } catch(e) {
      setError("Current password is incorrect.");
    }
    setSaving(false);
  };

  const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
      className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ background: checked ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "#e5e7eb" }}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${checked ? "left-7" : "left-1"}`}/>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily:"Plus Jakarta Sans" }}>
        {T.settings}
      </h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => { setActive(s.id); setError(""); setSaved(""); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all border-l-2 ${
                  active === s.id
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}>
                <s.icon className="w-4 h-4"/>
                {lang === "hi" ? s.hi : s.en}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div key={active} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.15 }}
            className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6">

            {/* Success / Error banners */}
            {saved && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
                style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#15803d" }}>
                <Check className="w-4 h-4"/> {saved}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
                ⚠️ {error}
              </motion.div>
            )}

            {/* ── PROFILE ── */}
            {active === "profile" && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-5" style={{ fontFamily:"Plus Jakarta Sans" }}>
                  {T.profileTitle}
                </h3>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                      style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                      {name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{name || user?.name}</p>
                    <p className="text-sm text-gray-500">{email || user?.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 text-xs rounded-full font-semibold"
                      style={{ background:"#f5f3ff", color:"#7c3aed" }}>{T.freePlan}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {T.fullName}
                    </label>
                    <input type="text" value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {T.email}
                    </label>
                    <input type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"/>
                  </div>
                </div>

                <button onClick={handleSaveProfile} disabled={saving}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow transition-all disabled:opacity-60"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                  <Save className="w-4 h-4"/>
                  {saving ? "Saving..." : T.saveChanges}
                </button>
              </div>
            )}

            {/* ── PREFERENCES ── */}
            {active === "prefs" && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-5" style={{ fontFamily:"Plus Jakarta Sans" }}>
                  {T.prefsTitle}
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    {T.language}
                  </label>
                  <div className="flex gap-3">
                    {[{code:"en",label:"English"},{code:"hi",label:"हिंदी"}].map(l => (
                      <button key={l.code} onClick={() => setLang(l.code)}
                        className="flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all"
                        style={lang === l.code
                          ? { background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"white", borderColor:"transparent" }
                          : { background:"#f9fafb", color:"#374151", borderColor:"#e5e7eb" }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{T.langNote}</p>
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {active === "security" && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-5" style={{ fontFamily:"Plus Jakarta Sans" }}>
                  {T.securityTitle}
                </h3>
                <div className="space-y-4">
                  {[
                    { label: T.currentPass, key: "current", show: showPass.cur, toggle: () => setShowPass(s=>({...s,cur:!s.cur})) },
                    { label: T.newPass,     key: "newPass", show: showPass.new, toggle: () => setShowPass(s=>({...s,new:!s.new})) },
                    { label: T.confirmPass, key: "confirm", show: showPass.con, toggle: () => setShowPass(s=>({...s,con:!s.con})) },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {f.label}
                      </label>
                      <div className="relative">
                        <input
                          type={f.show ? "text" : "password"}
                          placeholder="••••••••"
                          value={passForm[f.key]}
                          onChange={e => setPassForm(p => ({...p, [f.key]: e.target.value}))}
                          className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm bg-white"/>
                        <button type="button" onClick={f.toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {f.show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button onClick={handleChangePassword} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow transition-all disabled:opacity-60"
                    style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    <Lock className="w-4 h-4"/>
                    {saving ? "Updating..." : T.updatePass}
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}

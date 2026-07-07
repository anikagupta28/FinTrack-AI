import { useState } from "react";
import { api, CATEGORY_COLORS, CATEGORY_ICONS, getCurrentMonth } from "../utils/api";

export default function ExportPage({ lang, globalMonth, setGlobalMonth }) {
  const [loading, setLoading] = useState({ csv: false, pdf: false });

  const T = {
    title:    lang === "hi" ? "रिपोर्ट डाउनलोड करें" : "Export Report",
    subtitle: lang === "hi" ? "मासिक रिपोर्ट CSV या PDF में डाउनलोड करें" : "Download your monthly report as CSV or PDF",
    csv:      lang === "hi" ? "CSV डाउनलोड करें"      : "Download CSV",
    pdf:      lang === "hi" ? "PDF डाउनलोड करें"      : "Download PDF",
    csvDesc:  lang === "hi" ? "Excel या Google Sheets में खोलें" : "Open in Excel or Google Sheets",
    pdfDesc:  lang === "hi" ? "सीधे PDF फ़ाइल डाउनलोड करें" : "Properly formatted PDF file",
    noData:   lang === "hi" ? "इस महीने कोई डेटा नहीं" : "No data for this month",
    select:   lang === "hi" ? "महीना चुनें"           : "Select Month",
    how:      lang === "hi" ? "यह कैसे काम करता है"   : "How it works",
    gen:      lang === "hi" ? "जनरेट हो रहा है..."    : "Generating...",
  };

  // ── CSV ───────────────────────────────────────────
  const downloadCSV = async () => {
    setLoading(l => ({...l, csv: true}));
    try {
      const expenses = await api.getExpenses(globalMonth);
      if (!expenses.length) { alert(T.noData); return; }

      const headers = ["Date","Description","Category","Amount (INR)","Note"];
      const rows    = expenses.map(e => [
        e.date,
        `"${(e.description||"").replace(/"/g,'""')}"`,
        e.category,
        e.amount,
        `"${(e.note||"").replace(/"/g,'""')}"`
      ]);
      const total = expenses.reduce((s,e) => s + e.amount, 0);
      rows.push(["","","TOTAL", total,""]);

      const csv  = [headers,...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `kharcha-ai-${globalMonth}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setLoading(l => ({...l, csv: false}));
  };

  // ── PDF using jsPDF ───────────────────────────────
  const downloadPDF = async () => {
    setLoading(l => ({...l, pdf: true}));
    try {
      const [expenses, analysis] = await Promise.all([
        api.getExpenses(globalMonth),
        api.getAnalysis(globalMonth)
      ]);
      if (!expenses.length) { alert(T.noData); setLoading(l=>({...l,pdf:false})); return; }

      // Dynamically import jsPDF so it doesn't slow initial load
      // Try jsPDF, fallback to print-to-PDF
      let jsPDFClass;
      try { const mod = await import("jspdf"); jsPDFClass = mod.jsPDF; }
      catch(err) {
  console.error(err);
  alert("PDF generation failed.");
  setLoading(l => ({ ...l, pdf: false }));
  return;
}
      const jsPDF = jsPDFClass;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const total     = expenses.reduce((s,e) => s+e.amount, 0);
      const breakdown = analysis?.breakdown || [];
      const [year,mon] = globalMonth.split("-");
      const monthLabel = new Date(year, mon-1, 1).toLocaleString("en-IN", {month:"long", year:"numeric"});

      const PW = 210, PH = 297, M = 15; // A4 dims, margin
      let y = M;

      // ── Header bar ──
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, PW, 22, "F");
      doc.setTextColor(255,255,255);
      doc.setFontSize(16); doc.setFont("helvetica","bold");
      doc.text("Kharcha AI", M, 14);
      doc.setFontSize(9); doc.setFont("helvetica","normal");
      doc.text("Monthly Expense Report", M, 19);
      doc.setFontSize(9);
      doc.text(monthLabel, PW - M, 14, {align:"right"});
      doc.setFontSize(11); doc.setFont("helvetica","bold");
      doc.text(`Total: Rs.${total.toLocaleString("en-IN")}`, PW - M, 19, {align:"right"});

      y = 30;

      // ── Category Summary ──
      doc.setTextColor(100,100,100);
      doc.setFontSize(8); doc.setFont("helvetica","bold");
      doc.text("CATEGORY SUMMARY", M, y);
      y += 4;

      const colW = (PW - 2*M) / 3;
      breakdown.forEach((b, i) => {
        const bx = M + (i % 3) * colW;
        const by = y + Math.floor(i/3) * 18;
        doc.setFillColor(245, 243, 255);
        doc.roundedRect(bx, by, colW - 3, 15, 2, 2, "F");
        doc.setTextColor(124, 58, 237);
        doc.setFontSize(8); doc.setFont("helvetica","bold");
        doc.text(`${b.category}`, bx+3, by+5);
        doc.setTextColor(30,30,30);
        doc.setFontSize(10); doc.setFont("helvetica","bold");
        doc.text(`Rs.${b.amount.toLocaleString("en-IN")}`, bx+3, by+11);
        doc.setTextColor(130,130,130);
        doc.setFontSize(7); doc.setFont("helvetica","normal");
        doc.text(`${b.percentage}%`, bx+3, by+14);
      });

      const catRows = Math.ceil(breakdown.length / 3);
      y += catRows * 18 + 6;

      // ── Transactions table ──
      doc.setTextColor(100,100,100);
      doc.setFontSize(8); doc.setFont("helvetica","bold");
      doc.text("ALL TRANSACTIONS", M, y);
      y += 5;

      // Table header
      doc.setFillColor(124, 58, 237);
      doc.rect(M, y, PW - 2*M, 7, "F");
      doc.setTextColor(255,255,255);
      doc.setFontSize(8); doc.setFont("helvetica","bold");
      const cols = [M+2, M+30, M+95, M+125];
      doc.text("Date",        cols[0], y+5);
      doc.text("Description", cols[1], y+5);
      doc.text("Category",    cols[2], y+5);
      doc.text("Amount (Rs)", PW-M-2,  y+5, {align:"right"});
      y += 7;

      // Table rows
      expenses.forEach((e, i) => {
        if (y > PH - 25) { doc.addPage(); y = M; }
        doc.setFillColor(i%2===0 ? 250:255, i%2===0 ? 245:255, i%2===0 ? 255:255);
        doc.rect(M, y, PW-2*M, 7, "F");
        doc.setTextColor(50,50,50);
        doc.setFontSize(8); doc.setFont("helvetica","normal");
        const desc = e.description.length > 38 ? e.description.slice(0,35)+"..." : e.description;
        doc.text(e.date,        cols[0], y+5);
        doc.text(desc,          cols[1], y+5);
        doc.text(e.category,    cols[2], y+5);
        doc.text(`Rs.${e.amount.toLocaleString("en-IN")}`, PW-M-2, y+5, {align:"right"});
        y += 7;
      });

      // Total row
      doc.setFillColor(245,243,255);
      doc.rect(M, y, PW-2*M, 8, "F");
      doc.setTextColor(124,58,237);
      doc.setFontSize(9); doc.setFont("helvetica","bold");
      doc.text("TOTAL", cols[1], y+5.5);
      doc.text(`Rs.${total.toLocaleString("en-IN")}`, PW-M-2, y+5.5, {align:"right"});
      y += 12;

      // Footer
      doc.setDrawColor(220,220,220);
      doc.line(M, y, PW-M, y);
      doc.setTextColor(160,160,160);
      doc.setFontSize(7); doc.setFont("helvetica","normal");
      doc.text("Generated by Kharcha AI", M, y+4);
      doc.text(new Date().toLocaleDateString("en-IN"), PW-M, y+4, {align:"right"});

      doc.save(`kharcha-ai-${globalMonth}.pdf`);
    } catch(e) { console.error(e); }
    setLoading(l => ({...l, pdf: false}));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" style={{fontFamily:"Plus Jakarta Sans"}}>{T.title}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{T.subtitle}</p>
      </div>

      {/* Month picker */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-700">{T.select}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(globalMonth+"-01").toLocaleString("en-IN",{month:"long",year:"numeric"})}
          </p>
        </div>
        <input type="month" value={globalMonth} onChange={e => setGlobalMonth(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white font-medium"/>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={downloadCSV} disabled={loading.csv}
          className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-green-300 hover:shadow-md transition-all group disabled:opacity-60">
          <div className="text-3xl mb-3">📊</div>
          <p className="font-bold text-gray-800 group-hover:text-green-600 text-sm">
            {loading.csv ? T.gen : T.csv}
          </p>
          <p className="text-xs text-gray-400 mt-1">{T.csvDesc}</p>
        </button>

        <button onClick={downloadPDF} disabled={loading.pdf}
          className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-purple-300 hover:shadow-md transition-all group disabled:opacity-60">
          <div className="text-3xl mb-3">📄</div>
          <p className="font-bold text-gray-800 group-hover:text-purple-600 text-sm">
            {loading.pdf ? T.gen : T.pdf}
          </p>
          <p className="text-xs text-gray-400 mt-1">{T.pdfDesc}</p>
        </button>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-purple-100 p-5"
        style={{background:"linear-gradient(135deg,#faf5ff,#eef2ff)"}}>
        <p className="text-sm font-bold text-purple-700 mb-2">ℹ️ {T.how}</p>
        <ul className="space-y-1.5 text-xs text-purple-600">
          <li>→ <strong>CSV</strong>: {T.csvDesc}</li>
          <li>→ <strong>PDF</strong>: {T.pdfDesc}</li>
        </ul>
      </div>
    </div>
  );
}

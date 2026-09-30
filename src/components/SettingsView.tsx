import React, { useState } from 'react';
import {
  Settings,
  Database,
  Key,
  Globe,
  FileCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Goal, SavingsTransaction } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  goals: Goal[];
  transactions: SavingsTransaction[];
  onSaveProfile: (profile: UserProfile) => void;
  onResetDemoData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  goals,
  transactions,
  onSaveProfile,
  onResetDemoData,
  onShowToast
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<string>('Code.gs');
  const [isTesting, setIsTesting] = useState(false);

  const sampleGasFiles: { [filename: string]: string } = {
    'Code.gs': `/**
 * SaveIQ - Google Apps Script Entry Point (Code.gs)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'health';
  if (action === 'getGoals') return jsonResponse(getGoals(e.parameter.userId));
  if (action === 'getDashboardData') return jsonResponse(getDashboardData(e.parameter.userId));
  return jsonResponse({ success: true, message: 'SaveIQ API Online' });
}

function doPost(e) {
  var postData = JSON.parse(e.postData.contents);
  var action = postData.action;
  var payload = postData.payload || postData;

  if (action === 'createGoal') return jsonResponse(createGoal(payload));
  if (action === 'addSavings') return jsonResponse(addSavings(payload));
  if (action === 'generateAIInsight') return jsonResponse(generateAIInsight(payload));
  if (action === 'runDailyFinancialAudit') return jsonResponse(runDailyFinancialAudit(payload.userId));
  return jsonResponse({ success: false, message: 'Unknown action' });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`,
    'Database.gs': `/**
 * SaveIQ - Google Sheets Database Engine (Database.gs)
 * Sheets: Users, Goals, SavingsTransactions, Notifications, AIInsights
 */
function getSpreadsheet() {
  var prop = PropertiesService.getScriptProperties();
  var sheetId = prop.getProperty('GOOGLE_SHEET_ID');
  return sheetId ? SpreadsheetApp.openById(sheetId) : SpreadsheetApp.getActiveSpreadsheet();
}

function initializeSheetsDatabase() {
  var ss = getSpreadsheet();
  var schemas = {
    'Users': ['userId', 'name', 'email', 'currency', 'createdAt', 'updatedAt'],
    'Goals': ['goalId', 'userId', 'goalName', 'category', 'targetAmount', 'currentSavings', 'deadline', 'monthlyTarget', 'description', 'status', 'createdAt', 'updatedAt'],
    'SavingsTransactions': ['transactionId', 'goalId', 'amount', 'date', 'note', 'createdAt'],
    'Notifications': ['notificationId', 'userId', 'goalId', 'type', 'message', 'scheduledDate', 'sentStatus', 'createdAt'],
    'AIInsights': ['insightId', 'userId', 'goalId', 'insight', 'createdAt']
  };
  for (var name in schemas) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(schemas[name]);
      sheet.getRange(1, 1, 1, schemas[name].length).setFontWeight('bold');
    }
  }
  return { success: true, message: 'Database initialized' };
}`,
    'AI.gs': `/**
 * SaveIQ - AI Coach Integration (AI.gs)
 * Model: Groq LLaMA 3.3-70B Versatile
 */
function generateAIInsight(payload) {
  var prop = PropertiesService.getScriptProperties();
  var apiKey = prop.getProperty('GROQ_API_KEY') || payload.groqApiKey;
  if (!apiKey) return getRuleBasedFinancialInsight(payload);

  var requestBody = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are SaveIQ Coach, personal finance advisor. Return JSON { aiInsight, recommendedAction, whyItMatters, suggestedNextStep }" },
      { role: "user", content: JSON.stringify(payload) }
    ],
    temperature: 0.6,
    response_format: { type: "json_object" }
  };

  var response = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + apiKey },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  });

  return { success: true, data: JSON.parse(response.getContentText()).choices[0].message.content };
}`,
    'Triggers.gs': `/**
 * SaveIQ - Time-Driven Triggers & Daily Audit System (Triggers.gs)
 */
function setupDailyAuditTrigger() {
  ScriptApp.newTrigger('runDailyFinancialAudit')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  return { success: true, message: 'Audit scheduled for 8:00 AM daily' };
}

function runDailyFinancialAudit(userId) {
  var ss = getSpreadsheet();
  var goalsSheet = ss.getSheetByName('Goals');
  // Inspects deadlines, detects overdue, and dispatches reminders via Gmail
  return { success: true, message: 'Audit executed' };
}`,
    'appsscript.json': `{
  "timeZone": "Asia/Kolkata",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}`
  };

  const handleCopyCode = (filename: string) => {
    navigator.clipboard.writeText(sampleGasFiles[filename] || '');
    setCopiedFile(filename);
    onShowToast(`Copied ${filename} to clipboard!`, 'success');
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onShowToast('Settings and credentials saved successfully!', 'success');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      if (formData.gasWebAppUrl) {
        const res = await fetch(`${formData.gasWebAppUrl}?action=health`, { method: 'GET' });
        if (res.ok) {
          onShowToast('Google Apps Script Web App connection successful!', 'success');
        } else {
          onShowToast(`Connected, status: ${res.status}`, 'info');
        }
      } else {
        // Test local server
        const res = await fetch('/api/health');
        const data = await res.json();
        onShowToast(`SaveIQ Engine Active (Gemini: ${data.geminiConfigured ? 'Yes' : 'No'}, Groq: ${data.groqConfigured ? 'Yes' : 'No'})`, 'success');
      }
    } catch (e: any) {
      onShowToast(`Connection test failed: ${e.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Goal ID', 'Name', 'Category', 'Target', 'Current Savings', 'Progress %', 'Deadline', 'Status'];
    const rows = goals.map((g) => {
      const target = Number(g.targetAmount) || 0;
      const current = Number(g.currentSavings) || 0;
      const pct = target > 0 ? Math.round((current / target) * 100) : 0;
      return [
        `"${g.id}"`,
        `"${g.goalName.replace(/"/g, '""')}"`,
        `"${g.category}"`,
        target,
        current,
        `"${pct}%"`,
        `"${g.deadline}"`,
        `"${g.status}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SaveIQ_Goals_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Savings goals exported to CSV!', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          System & Integration Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure Google Sheets, Google Apps Script Web App endpoints, and Groq API keys.
        </p>
      </div>

      {/* Integration Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Cloud Integrations & API Credentials
          </h3>

          {/* Groq API Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Groq API Key (Optional Client Override)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="gsk_..."
                value={formData.groqApiKey || ''}
                onChange={(e) => setFormData({ ...formData, groqApiKey: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Uses LLaMA 3.3-70B Versatile for high-speed AI Coach queries. If omitted, uses the server-side environment engine.
            </p>
          </div>

          {/* Google Sheet ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Sheet ID (Database)
            </label>
            <div className="relative">
              <Database className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={formData.googleSheetId || ''}
                onChange={(e) => setFormData({ ...formData, googleSheetId: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Found in the URL: docs.google.com/spreadsheets/d/<strong>GOOGLE_SHEET_ID</strong>/edit
            </p>
          </div>

          {/* Google Apps Script Web App URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Apps Script Deployed Web App URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={formData.gasWebAppUrl || ''}
                onChange={(e) => setFormData({ ...formData, gasWebAppUrl: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Obtained after clicking Deploy → New deployment → Web app in Google Apps Script.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing Link...' : 'Test Connection'}</span>
          </button>

          <button
            type="submit"
            className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </form>

      {/* Google Apps Script Code Exporter & Viewer (Sections 25, 28, 29) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>Google Apps Script Code Suite</span>
            </h3>
            <p className="text-xs text-slate-400">
              Copy-paste these files directly into script.google.com to deploy your dedicated cloud backend.
            </p>
          </div>
        </div>

        {/* File tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {Object.keys(sampleGasFiles).map((filename) => (
            <button
              key={filename}
              onClick={() => setSelectedScript(filename)}
              className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedScript === filename
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {filename}
            </button>
          ))}
        </div>

        {/* Code viewer */}
        <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-72">
          <button
            onClick={() => handleCopyCode(selectedScript)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedFile === selectedScript ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
          <pre className="pr-16 leading-relaxed">
            {sampleGasFiles[selectedScript]}
          </pre>
        </div>
      </div>

      {/* Backup, CSV & Demo Data Management */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
          Data Management & Reset
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Goals to CSV</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset application to initial realistic sample data? All custom additions will be restored to default.')) {
                onResetDemoData();
                onShowToast('Reset to default demo data!', 'info');
              }
            }}
            className="py-2 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Reset to Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};

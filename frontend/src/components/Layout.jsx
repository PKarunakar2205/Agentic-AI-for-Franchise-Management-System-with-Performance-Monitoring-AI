import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, clearAuthData, getOperationalAlerts, queryAiAssistant } from "../api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Boxes,
  TrendingUp,
  Users,
  Megaphone,
  Bell,
  FileBarChart,
  Settings,
  Search,
  Sparkles,
  Sun,
  Moon,
  Zap,
  X,
  Menu,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  ShieldCheck,
  Brain,
  Send,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function Layout({ children, dark, setDark }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // AI Assistant Drawer State
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your FranchiseOS AI Intelligence Assistant. Ask me anything about franchise health, underperforming outlets, low stock, audit compliance, or top management actions.",
    },
  ]);

  // Notifications State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getUser();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Fetch live operational alerts for notification dropdown
    getOperationalAlerts()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setAlerts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Outlet Performance Agent", icon: Store, path: "/outlet-performance" },
    { label: "Franchise Intelligence", icon: Brain, path: "/business-intelligence" },
    { label: "AI Audit Agent", icon: ShieldCheck, path: "/audit" },
    { label: "Inventory Agent", icon: Boxes, path: "/inventory" },
    { label: "Staff Agent", icon: Users, path: "/staff" },
    { label: "Marketing Agent", icon: Megaphone, path: "/marketing" },
    { label: "Notifications", icon: Bell, path: "#" },
    { label: "Reports", icon: FileBarChart, path: "/reports" },
    { label: "Settings", icon: Settings, path: "#" },
  ];

  const activePath = location.pathname;

  const handleAskAi = async (customPrompt) => {
    const queryText = customPrompt || aiPrompt;
    if (!queryText.trim()) return;

    setAiMessages((prev) => [...prev, { sender: "user", text: queryText }]);
    setAiPrompt("");
    setAiLoading(true);

    try {
      const res = await queryAiAssistant(queryText);
      if (res.success && res.data && res.data.answer) {
        setAiMessages((prev) => [...prev, { sender: "ai", text: res.data.answer }]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          { sender: "ai", text: "Unable to process AI query right now. Please try again." },
        ]);
      }
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        { sender: "ai", text: `Error: ${err.message || "Failed to reach AI Assistant"}` },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const presetQuestions = [
    "What is the overall franchise health?",
    "Which outlet needs immediate attention?",
    "Which products need reordering?",
    "Which outlets have audit risks?",
    "Which marketing campaign is performing poorly?",
    "What are the top 5 actions management should take?",
  ];

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex">
        
        {/* ============ SIDEBAR ============ */}
        <AnimatePresence>
          {(sidebarOpen || true) && (
            <motion.aside
              initial={false}
              className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex flex-col
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300`}
            >
              {/* BRAND HEADER */}
              <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-200/70 dark:border-slate-800">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4.5 h-4.5 text-white" size={18} />
                  </div>
                  <span className="font-semibold tracking-tight text-slate-900 dark:text-white text-lg">FranchiseOS</span>
                </Link>
                <button className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* NAVIGATION LINKS */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.path === "/"
                      ? (activePath === "/" || activePath === "/dashboard")
                      : activePath === item.path;

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group relative
                        ${isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/25 font-medium"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      <item.icon size={17} className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"} />
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-slate-800 px-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Authentication</p>
                  <Link
                    to="/login"
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activePath === "/login"
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <LogIn size={15} /> Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activePath === "/signup"
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <UserPlus size={15} /> Create Account
                  </Link>
                </div>
              </nav>

              {/* FOOTER BADGE */}
              <div className="p-4 border-t border-slate-200/70 dark:border-slate-800">
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                    <Zap size={14} /> AI Intelligence Active
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cross-module operational telemetry</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ============ MAIN CONTENT AREA ============ */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* TOP NAVBAR */}
          <header className="sticky top-0 z-20 h-16 border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex items-center gap-4 px-4 lg:px-8">
            <button className="lg:hidden text-slate-600 dark:text-slate-300" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>

            <div className="relative hidden md:block w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search outlets, inventory, insights..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="ml-auto flex items-center gap-2 lg:gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setAiAssistantOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md shadow-blue-500/25"
              >
                <Sparkles size={15} /> AI Assistant
              </motion.button>

              {/* NOTIFICATION BELL DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Bell size={18} />
                  {alerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-3 z-50 text-xs"
                    >
                      <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">Live Intelligence Alerts</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                          {alerts.length} Active
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {alerts.length === 0 ? (
                          <div className="p-4 text-center text-slate-400">No active alerts</div>
                        ) : (
                          alerts.map((a) => (
                            <div key={a.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                                {a.severity === "CRITICAL" ? (
                                  <AlertTriangle size={14} className="text-rose-500" />
                                ) : (
                                  <Info size={14} className="text-amber-500" />
                                )}
                                <span>{a.title}</span>
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 mt-1 leading-snug">{a.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setDark((d) => !d)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                title="Toggle Dark/Light Mode"
              >
                {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>

              <div className="hidden md:block text-right leading-tight px-2 border-l border-slate-200 dark:border-slate-800 ml-1 pl-3">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <p className="text-[11px] text-slate-400">
                  {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* USER PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-md">
                    RK
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white">{currentUser?.full_name || "Rajesh Kumar"}</p>
                        <p className="text-slate-400 text-[11px]">{currentUser?.role || "Regional Manager"}</p>
                      </div>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <LogIn size={14} /> Switch Account
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <UserPlus size={14} /> Add Manager
                      </Link>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                      <button
                        onClick={() => {
                          clearAuthData();
                          setUserDropdownOpen(false);
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 lg:px-8 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* ============ AI ASSISTANT DRAWER / MODAL ============ */}
      <AnimatePresence>
        {aiAssistantOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiAssistantOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Franchise AI Assistant</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Powered by PostgreSQL Intelligence Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiAssistantOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Preset Query Chips */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {presetQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskAi(q)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap shadow-xs"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-md shadow-blue-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50"
                      }`}
                    >
                      {msg.text.split("\n").map((line, i) => (
                        <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <Loader2 size={16} className="animate-spin" /> Querying PostgreSQL intelligence telemetry...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAi()}
                  placeholder="Ask intelligence assistant..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none text-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={() => handleAskAi()}
                  disabled={aiLoading}
                  className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

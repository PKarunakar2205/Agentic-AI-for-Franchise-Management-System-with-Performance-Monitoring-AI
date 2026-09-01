import React, { useState, useEffect } from "react";
import {
  getOperationalAlerts,
  markAlertAsReadApi,
  markAllAlertsAsReadApi,
  deleteAlertApi,
} from "../api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Search,
  CheckCheck,
  Trash2,
  Filter,
  Boxes,
  TrendingUp,
  ShieldCheck,
  Users,
  Megaphone,
  Server,
  RefreshCw,
} from "lucide-react";

const ICON_MAP = {
  Boxes,
  TrendingUp,
  ShieldAlert,
  Users,
  Megaphone,
  Server,
  ShieldCheck,
  AlertTriangle,
  Bell,
};

const getNotificationIcon = (notif) => {
  if (!notif) return Bell;
  if (typeof notif.icon === "function") return notif.icon;
  if (typeof notif.icon === "string" && ICON_MAP[notif.icon]) return ICON_MAP[notif.icon];
  if (notif.category === "Inventory") return Boxes;
  if (notif.category === "Sales") return TrendingUp;
  if (notif.category === "Audit") return ShieldAlert;
  if (notif.category === "Staff") return Users;
  if (notif.category === "Marketing") return Megaphone;
  if (notif.category === "System") return Server;
  return Bell;
};

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-01",
    title: "Low Inventory Alert — Cold Brew Beans",
    message: "Chennai T. Nagar Flagship stock cover for Cold Brew Beans dropped to 12 kg (below reorder threshold of 25 kg).",
    category: "Inventory",
    severity: "CRITICAL",
    timestamp: "10 mins ago",
    read: false,
    icon: "Boxes",
    color: "rose",
  },
  {
    id: "notif-02",
    title: "Weekend Sales Surge — Indiranagar Hub",
    message: "Bengaluru Indiranagar Hub surpassed daily sales target by 34%, hitting ₹1,85,400 gross revenue.",
    category: "Sales",
    severity: "SUCCESS",
    timestamp: "35 mins ago",
    read: false,
    icon: "TrendingUp",
    color: "emerald",
  },
  {
    id: "notif-03",
    title: "Audit Safety Violation Flagged",
    message: "Jubilee Hills outlet failed temperature compliance check on cold storage unit #3 during morning audit.",
    category: "Audit",
    severity: "WARNING",
    timestamp: "1 hour ago",
    read: false,
    icon: "ShieldAlert",
    color: "amber",
  },
  {
    id: "notif-04",
    title: "Staff Attendance Discrepancy",
    message: "3 shift workers clocked out 45 mins late at Bandra West outlet without supervisor override log.",
    category: "Staff",
    severity: "INFO",
    timestamp: "2 hours ago",
    read: true,
    icon: "Users",
    color: "indigo",
  },
  {
    id: "notif-05",
    title: "Monsoon BOGO Ad Campaign Scaling",
    message: "Meta Ad Campaign 'Monsoon Festive BOGO Blitz' achieved 5.38x ROAS. AI recommends allocating +₹50k budget.",
    category: "Marketing",
    severity: "SUCCESS",
    timestamp: "3 hours ago",
    read: true,
    icon: "Megaphone",
    color: "purple",
  },
  {
    id: "notif-06",
    title: "Database Backup Completed",
    message: "Automated daily telemetry snapshot for 49 franchise centers backed up to cloud vault cleanly.",
    category: "System",
    severity: "INFO",
    timestamp: "5 hours ago",
    read: true,
    icon: "Server",
    color: "blue",
  },
  {
    id: "notif-07",
    title: "Stock Reorder Auto-Approved",
    message: "Purchase order PO-9921 for 500 units Organic Milk Powder auto-routed to regional vendor Delhi NCR.",
    category: "Inventory",
    severity: "INFO",
    timestamp: "8 hours ago",
    read: true,
    icon: "Boxes",
    color: "blue",
  },
  {
    id: "notif-08",
    title: "Quarterly Compliance Certificate Issued",
    message: "Park Street Kolkata store successfully passed 100% of hygiene and safety parameters for Q3 audit.",
    category: "Audit",
    severity: "SUCCESS",
    timestamp: "12 hours ago",
    read: true,
    icon: "ShieldCheck",
    color: "emerald",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("franchise_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Sync state changes with localStorage and fire custom window event
  useEffect(() => {
    localStorage.setItem("franchise_notifications", JSON.stringify(notifications));
    window.dispatchEvent(new Event("notifications_updated"));
  }, [notifications]);

  // Load operational alerts from backend API on mount
  useEffect(() => {
    async function fetchBackendAlerts() {
      try {
        const res = await getOperationalAlerts();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mappedAlerts = res.data.map((item) => ({
            id: `db-notif-${item.id || item.notification_id || Math.random()}`,
            rawId: item.id || item.notification_id,
            title: `${item.type || "Operational"} Telemetry Alert`,
            message: item.message || "New operational telemetry alert detected across franchise network.",
            category: item.type || "System",
            severity: item.priority === "CRITICAL" ? "CRITICAL" : item.priority === "HIGH" ? "WARNING" : "INFO",
            timestamp: item.date ? String(item.date).split("T")[0] : "Just now",
            read: item.status === "Read",
            icon: item.priority === "CRITICAL" ? ShieldAlert : AlertTriangle,
            color: item.priority === "CRITICAL" ? "rose" : "amber",
          }));

          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newAlerts = mappedAlerts.filter((a) => !existingIds.has(a.id));
            return newAlerts.length > 0 ? [...newAlerts, ...prev] : prev;
          });
        }
      } catch (e) {
        console.warn("Backend alerts API fetch info:", e.message);
      }
    }
    fetchBackendAlerts();
  }, []);

  const categories = ["All", "Inventory", "Sales", "Audit", "Staff", "Marketing", "System"];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesCategory = activeCategory === "All" || n.category === activeCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAsRead = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (target && target.rawId) {
      markAlertAsReadApi(target.rawId).catch(() => {});
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    markAllAlertsAsReadApi().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read!");
  };

  const handleClearNotification = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (target && target.rawId) {
      deleteAlertApi(target.rawId).catch(() => {});
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Notification removed.");
  };

  const handleResetNotifications = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast("Notifications reset to default set.");
  };

  const getBadgeStyle = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "WARNING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3.5 bg-indigo-950/90 border border-indigo-500/50 rounded-xl text-indigo-200 text-xs font-semibold flex items-center justify-between shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {toastMessage}
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 backdrop-blur-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell size={16} /> Real-Time Telemetry Center
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Franchise Operational Alerts
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-md shadow-rose-500/30">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live anomaly detection, stock thresholds, sales surges, and compliance warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetNotifications}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Demo Notifications"
          >
            <RefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <CheckCheck size={16} /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const IconComp = getNotificationIcon(notif);
              const badgeStyle = getBadgeStyle(notif.severity);

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !notif.read
                      ? "bg-indigo-950/20 dark:bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                      : "bg-white/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${badgeStyle}`}>
                      <IconComp size={18} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badgeStyle}`}>
                          {notif.severity}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" title="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                        Category: {notif.category} • {notif.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleClearNotification(notif.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Clear Notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-slate-400 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              No notifications matching your filter cleanly!
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

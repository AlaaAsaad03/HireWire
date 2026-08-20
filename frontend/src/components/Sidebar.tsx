import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Sparkles,
  Settings,
  Moon,
  Sun,
  Command,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";
import Logo from "./ui/Logo";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "Alt+D" },
  { path: "/contacts", label: "Contacts", icon: Users, shortcut: "Alt+C" },
  { path: "/skills", label: "Skills", icon: Sparkles },
  { path: "/advanced-analytics", label: "Analytics", icon: BarChart3, shortcut: "Alt+A" },
  { path: "/settings", label: "Settings", icon: Settings, shortcut: "Alt+S" },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDark, setTheme, theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleTheme() {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const sidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full relative">
      {/* Logo */}
      <div className={`flex items-center h-14 ${collapsed && !isMobile ? "px-0 justify-center" : "px-4"} border-b border-sidebar-border flex-shrink-0 relative`}>
        <Link
          to="/dashboard"
          className="flex items-center hover:opacity-85 transition-opacity"
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <Logo size="sm" withText={!collapsed || isMobile} />
        </Link>
      </div>
      
      {/* Absolute Toggle Button */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-4 z-50 p-1.5 rounded-full bg-card border border-border shadow-soft text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-150 hidden md:flex"
        >
          {collapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Keyboard shortcut hint */}
      {(!collapsed || isMobile) && (
        <div className="px-4 pt-3.5 pb-1">
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
              document.dispatchEvent(event);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md border border-sidebar-border bg-card/55 text-xs text-muted-foreground hover:text-foreground hover:border-primary/25 transition-all duration-150"
          >
            <Command className="w-3.5 h-3.5 text-muted-foreground/80" />
            <span className="font-medium text-[11px]">Search...</span>
            <kbd className="ml-auto text-[9px] font-mono text-muted-foreground/60 border border-border bg-card rounded px-1.5 py-0.5 shadow-sm">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed && !isMobile ? "px-2" : "px-3"} py-4 space-y-1.5 overflow-y-auto`}>
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-2.5 px-3">
            Workspace
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${
                collapsed && !isMobile ? "justify-center px-0 mx-0" : "mx-1"
              } ${
                isActive
                  ? "bg-brand-soft text-primary shadow-soft font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary stroke-[2.2px]" : "text-muted-foreground/85"}`} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.shortcut}
                    </span>
                  )}
                </>
              )}
              {/* Left glow indicator for active tab */}
              {isActive && !collapsed && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`border-t border-sidebar-border ${collapsed && !isMobile ? "px-2" : "px-3"} py-3.5 space-y-1.5 flex-shrink-0`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors ${
            collapsed && !isMobile ? "justify-center px-0" : ""
          }`}
          title={collapsed && !isMobile ? "Toggle theme" : undefined}
        >
          {isDark ? <Sun className="w-4 h-4 flex-shrink-0 text-amber-500" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {(!collapsed || isMobile) && <span className="font-medium">{isDark ? "Light mode" : "Dark mode"}</span>}
        </button>

        {/* User Info */}
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-sidebar-border/50 my-2 pt-3">
            <div className="w-7 h-7 avatar-tile flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sidebar-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate font-mono">
                {user?.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center border-t border-sidebar-border/50 my-2 pt-3">
            <div className="w-7 h-7 avatar-tile flex items-center justify-center text-xs font-bold" title={`${user?.firstName} ${user?.lastName}`}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors ${
            collapsed && !isMobile ? "justify-center px-0" : ""
          }`}
          title={collapsed && !isMobile ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 p-2 rounded-md bg-card border border-border shadow-soft md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[260px] bg-sidebar border-r border-sidebar-border z-50 md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-muted"
              >
                <X className="w-4 h-4" />
              </button>
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 bg-sidebar/96 backdrop-blur-xl border-r border-sidebar-border z-30 transition-[width] duration-200 ease-in-out ${
          collapsed ? "w-[60px]" : "w-[240px]"
        }`}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}

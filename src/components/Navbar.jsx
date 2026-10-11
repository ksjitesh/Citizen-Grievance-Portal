import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  Settings,
  LogOut,
  ChevronDown,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  House,
  SearchCheck,
  PlusCircle,
  CircleHelp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const AUTHORITY_EMAIL = "ksjitesh17@gmail.com";

function ThemeButton({ mobile = false }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#D97706] hover:bg-orange-50 hover:text-[#B45309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-orange-900 dark:hover:bg-orange-950/20 dark:hover:text-[#F28C28] ${
        mobile ? "h-11 w-full px-4" : "h-10 w-10"
      }`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      {mobile && <span>{theme === "dark" ? "Light appearance" : "Dark appearance"}</span>}
    </button>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const lastScrollY = useRef(0);
  const { user, isAuthenticated, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Keep the account links aligned with the existing client-side role model.
  const isAuthority =
    user?.role === "authority" ||
    user?.email?.trim().toLowerCase() === AUTHORITY_EMAIL;

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (mobileOpen || accountOpen || currentY <= 24) {
        setIsVisible(true);
      } else if (currentY > lastScrollY.current + 3) {
        setIsVisible(false);
      } else if (currentY < lastScrollY.current - 3) {
        setIsVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen, accountOpen]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setAccountOpen(false);
        setMobileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMenus = () => {
    setAccountOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const result = await logout();
      if (!result?.success) {
        window.alert(result?.message || "Unable to sign out. Please try again.");
        return;
      }

      closeMenus();
      navigate("/login", { replace: true });
    } catch (error) {
      window.alert(error?.message || "Unable to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = () => {
    const fullName = user?.fullName?.trim();
    if (!fullName) return "U";
    const parts = fullName.split(/\s+/);
    return (parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0].slice(0, 2)
    ).toUpperCase();
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] ${
      isActive
        ? "bg-orange-50 text-[#B45309] dark:bg-orange-950/30 dark:text-[#F28C28]"
        : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A] dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] ${
      isActive
        ? "bg-orange-50 text-[#B45309] dark:bg-orange-950/30 dark:text-[#F28C28]"
        : "text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
    }`;

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out ${
        isVisible || mobileOpen || accountOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="h-[3px] bg-gradient-to-r from-[#0B1F3A] via-[#F28C28] to-[#15803D]" />
      <div className="border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl dark:border-neutral-800 dark:bg-black/95">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            onClick={closeMenus}
            className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] sm:gap-3"
            aria-label="CivicAI home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#0B1F3A] text-lg font-black text-white shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md dark:bg-white dark:text-[#0B1F3A] sm:h-11 sm:w-11">
              C<span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#F28C28]" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-extrabold leading-none tracking-tight text-[#0B1F3A] dark:text-white sm:text-xl">
                Civic<span className="text-[#D97706] dark:text-[#F28C28]">AI</span>
              </span>
              <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-neutral-500 sm:block">
                Citizen Service Portal
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={navLinkClass}>
              <House size={16} /> Home
            </NavLink>
            <NavLink to="/track-complaint" className={navLinkClass}>
              <SearchCheck size={16} /> Track Complaint
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/report-grievance" className={navLinkClass}>
                  <PlusCircle size={16} /> Report Issue
                </NavLink>
                <NavLink to="/my-grievances" className={navLinkClass}>
                  <FileText size={16} /> My Grievances
                </NavLink>
                {isAuthority && (
                  <NavLink to="/authority-dashboard" className={navLinkClass}>
                    <ShieldCheck size={16} /> Authority
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden sm:block"><ThemeButton /></div>

            {!isAuthenticated ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to="/login"
                  className="rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D97706] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#B45309] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black"
                >
                  Get Started <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border px-2 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] ${
                    accountOpen
                      ? "border-[#D97706] bg-orange-50 dark:border-[#F28C28] dark:bg-orange-950/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                  }`}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1F3A] text-xs font-extrabold text-white dark:bg-white dark:text-[#0B1F3A]">
                    {getInitials()}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#15803D] dark:border-neutral-950" />
                  </span>
                  <span className="max-w-28 truncate text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    {user?.fullName || "Account"}
                  </span>
                  <ChevronDown size={15} className={`text-slate-400 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/40" role="menu">
                    <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900/70">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F3A] text-sm font-extrabold text-white dark:bg-white dark:text-[#0B1F3A]">{getInitials()}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#0B1F3A] dark:text-white">{user?.fullName || "Account"}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-neutral-400">{user?.email}</p>
                          {isAuthority && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400"><ShieldCheck size={12} /> Authority account</span>}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      {isAuthority && <NavLink to="/authority-dashboard" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-green-50 dark:text-neutral-200 dark:hover:bg-green-950/20" role="menuitem"><LayoutDashboard size={17} /> Authority Dashboard</NavLink>}
                      <NavLink to="/settings" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 dark:text-neutral-200 dark:hover:bg-orange-950/20" role="menuitem"><Settings size={17} /> Account Settings</NavLink>
                      <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/20" role="menuitem">
                        <LogOut size={17} /> {isLoggingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#D97706] hover:text-[#B45309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 lg:hidden"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="civicai-mobile-navigation"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation panel */}
        {mobileOpen && (
          <div id="civicai-mobile-navigation" className="border-t border-slate-200 bg-white px-3 pb-4 pt-3 dark:border-neutral-800 dark:bg-black lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 sm:px-3">
              <NavLink to="/" end className={mobileLinkClass} onClick={closeMenus}><House size={18} /> Home</NavLink>
              <NavLink to="/track-complaint" className={mobileLinkClass} onClick={closeMenus}><SearchCheck size={18} /> Track Complaint</NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/report-grievance" className={mobileLinkClass} onClick={closeMenus}><PlusCircle size={18} /> Report a Grievance</NavLink>
                  <NavLink to="/my-grievances" className={mobileLinkClass} onClick={closeMenus}><FileText size={18} /> My Grievances</NavLink>
                  {isAuthority && <NavLink to="/authority-dashboard" className={mobileLinkClass} onClick={closeMenus}><ShieldCheck size={18} /> Authority Dashboard</NavLink>}
                  <NavLink to="/settings" className={mobileLinkClass} onClick={closeMenus}><Settings size={18} /> Account Settings</NavLink>
                  <div className="my-2 border-t border-slate-200 dark:border-neutral-800" />
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F3A] text-sm font-extrabold text-white dark:bg-white dark:text-[#0B1F3A]">{getInitials()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#0B1F3A] dark:text-white">{user?.fullName || "Account"}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-neutral-400">{user?.email}</p>
                    </div>
                    {isAuthority && <ShieldCheck size={18} className="shrink-0 text-green-600 dark:text-green-400" />}
                  </div>
                  <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/20"><LogOut size={18} /> {isLoggingOut ? "Signing out…" : "Sign out"}</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" onClick={closeMenus} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900">Log in</Link>
                  <Link to="/register" onClick={closeMenus} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#D97706] px-4 text-sm font-bold text-white transition hover:bg-[#B45309]">Get Started</Link>
                </div>
              )}
              <div className="pt-2 sm:hidden"><ThemeButton mobile /></div>
              <p className="flex items-center justify-center gap-1.5 pt-3 text-[10px] font-medium text-slate-400 dark:text-neutral-600"><CircleHelp size={12} /> CivicAI Citizen Service Portal</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

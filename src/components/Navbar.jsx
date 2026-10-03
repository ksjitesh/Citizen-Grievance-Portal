import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  LogOut,
  ChevronDown,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [accountOpen, setAccountOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isAuthority =
    user?.role === "authority";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
        setAccountOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  const getInitials = () => {
    if (!user?.fullName) {
      return "U";
    }

    const parts = user.fullName
      .trim()
      .split(/\s+/);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out dark:border-[#262626] dark:bg-black/95 ${
        isVisible
          ? "translate-y-0"
          : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* BRAND */}
        <Link
          to="/"
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-lg font-bold text-white shadow-sm transition duration-300 group-hover:bg-[#12355B] dark:bg-[#111111] dark:group-hover:bg-[#1A1A1A]">
            C
          </div>

          <div className="hidden sm:block">
            <p className="text-lg font-bold leading-none text-[#0B1F3A] dark:text-white">
              Civic
              <span className="text-[#D97706]">
                AI
              </span>
            </p>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-500">
              Citizen Service Portal
            </p>
          </div>
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="relative px-2 py-2 text-sm font-medium text-slate-600 transition hover:text-[#0B1F3A] dark:text-slate-300 dark:hover:text-white"
              >
                Login

                <span className="absolute bottom-0 left-2 h-0.5 w-0 bg-[#F28C28] transition-all duration-300" />
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-[#D97706] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#B45309] hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* MY GRIEVANCES */}
              <Link
                to="/my-grievances"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0B1F3A] transition duration-200 hover:border-[#D97706] hover:bg-orange-50 hover:text-[#D97706] dark:border-[#262626] dark:bg-[#0A0A0A] dark:text-white dark:hover:border-[#F28C28] dark:hover:bg-[#111111] dark:hover:text-[#F28C28]"
              >
                <FileText size={16} />

                <span className="hidden sm:inline">
                  My Grievances
                </span>
              </Link>

              {/* AUTHORITY DASHBOARD */}
              {isAuthority && (
                <Link
                  to="/authority-dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm font-semibold text-green-700 transition duration-200 hover:border-green-300 hover:bg-green-100 dark:border-green-900/60 dark:bg-green-950/20 dark:text-green-400 dark:hover:border-green-800 dark:hover:bg-green-950/40"
                >
                  <ShieldCheck size={16} />

                  <span className="hidden md:inline">
                    Authority
                  </span>
                </Link>
              )}

              {/* ACCOUNT */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setAccountOpen(
                      (current) => !current
                    )
                  }
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 transition hover:border-slate-300 hover:bg-slate-50 dark:border-[#262626] dark:bg-[#0A0A0A] dark:hover:border-[#404040] dark:hover:bg-[#111111]"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B1F3A] text-xs font-bold text-white dark:bg-[#111111]">
                    {getInitials()}
                  </span>

                  <span className="hidden max-w-32 truncate text-left text-sm font-semibold text-[#0B1F3A] sm:block dark:text-white">
                    {user?.fullName || "Account"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      accountOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#262626] dark:bg-[#0A0A0A]">
                    {/* ACCOUNT INFO */}
                    <div className="border-b border-slate-200 px-4 py-4 dark:border-[#262626]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A] text-sm font-bold text-white dark:bg-[#111111]">
                          {getInitials()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#0B1F3A] dark:text-white">
                            {user?.fullName}
                          </p>

                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user?.email}
                          </p>

                          {isAuthority && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                              <ShieldCheck size={11} />
                              Authority Account
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {/* MY GRIEVANCES */}
                      <Link
                        to="/my-grievances"
                        onClick={() =>
                          setAccountOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#0B1F3A] dark:text-slate-300 dark:hover:bg-[#151515] dark:hover:text-white"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#D97706] dark:bg-orange-950/20 dark:text-[#F28C28]">
                          <FileText size={17} />
                        </span>

                        <span>
                          <span className="block font-semibold">
                            My Grievances
                          </span>

                          <span className="mt-0.5 block text-xs text-slate-400">
                            View and track your complaints
                          </span>
                        </span>
                      </Link>

                      {/* AUTHORITY DASHBOARD */}
                      {isAuthority && (
                        <Link
                          to="/authority-dashboard"
                          onClick={() =>
                            setAccountOpen(false)
                          }
                          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-green-50 hover:text-green-700 dark:text-slate-300 dark:hover:bg-green-950/20 dark:hover:text-green-400"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400">
                            <ShieldCheck size={17} />
                          </span>

                          <span>
                            <span className="block font-semibold">
                              Authority Dashboard
                            </span>

                            <span className="mt-0.5 block text-xs text-slate-400">
                              Manage citizen grievances
                            </span>
                          </span>
                        </Link>
                      )}

                      {/* SETTINGS */}
                      <Link
                        to="/settings"
                        onClick={() =>
                          setAccountOpen(false)
                        }
                        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#0B1F3A] dark:text-slate-300 dark:hover:bg-[#151515] dark:hover:text-white"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-[#151515] dark:text-slate-300">
                          <Settings size={17} />
                        </span>

                        <span>
                          <span className="block font-semibold">
                            Account Settings
                          </span>

                          <span className="mt-0.5 block text-xs text-slate-400">
                            Profile, theme & account
                          </span>
                        </span>
                      </Link>

                      {/* LOGOUT */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20">
                          <LogOut size={17} />
                        </span>

                        <span>
                          <span className="block font-semibold">
                            Sign Out
                          </span>

                          <span className="mt-0.5 block text-xs text-red-400 dark:text-red-500">
                            End your current session
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
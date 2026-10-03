import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Settings,
  LogOut,
  ChevronDown,
  FileText,
  ShieldCheck,
  User,
  LayoutDashboard,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [isVisible, setIsVisible] =
    useState(true);

  const lastScrollY = useRef(0);

  const isAuthority =
    user?.role === "authority";

  /*
   * --------------------------------------------------
   * NAVBAR SCROLL BEHAVIOUR
   * --------------------------------------------------
   */

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY =
        window.scrollY;

      if (currentScrollY <= 20) {
        setIsVisible(true);
        lastScrollY.current =
          currentScrollY;

        return;
      }

      if (
        currentScrollY >
        lastScrollY.current
      ) {
        setIsVisible(false);
        setAccountOpen(false);
      } else if (
        currentScrollY <
        lastScrollY.current
      ) {
        setIsVisible(true);
      }

      lastScrollY.current =
        currentScrollY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * --------------------------------------------------
   * CLOSE ACCOUNT MENU ON OUTSIDE CLICK
   * --------------------------------------------------
   */

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        !event.target.closest(
          "[data-account-menu]"
        )
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * --------------------------------------------------
   * LOGOUT
   * --------------------------------------------------
   */

  const handleLogout = () => {
    logout();

    setAccountOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * --------------------------------------------------
   * USER INITIALS
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * NAVBAR
   * --------------------------------------------------
   */

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-[#262626] dark:bg-black/90 ${
        isVisible
          ? "translate-y-0"
          : "-translate-y-full"
      }`}
    >
      {/* TOP ACCENT LINE */}
      <div className="h-[2px] bg-gradient-to-r from-[#0B1F3A] via-[#F28C28] to-[#15803D] dark:from-[#111111] dark:via-[#F28C28] dark:to-[#15803D]" />

      <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
        {/* ==================================================
            BRAND
        ================================================== */}

        <Link
          to="/"
          onClick={() =>
            setAccountOpen(false)
          }
          className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
        >
          {/* LOGO */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1F3A] text-lg font-extrabold text-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md dark:bg-[#111111] dark:group-hover:bg-[#171717]">
            <span className="relative z-10">
              C
            </span>

            <span className="absolute bottom-0 left-0 h-1 w-full bg-[#F28C28]" />
          </div>

          {/* BRAND TEXT */}
          <div className="hidden min-w-0 sm:block">
            <p className="text-lg font-extrabold leading-none tracking-tight text-[#0B1F3A] dark:text-white">
              Civic
              <span className="text-[#D97706]">
                AI
              </span>
            </p>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-neutral-500">
              Citizen Service Portal
            </p>
          </div>
        </Link>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          {!isAuthenticated ? (
            <>
              {/* LOGIN */}
              <Link
                to="/login"
                className="group relative rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#0B1F3A] dark:text-slate-300 dark:hover:text-white sm:px-3"
              >
                Login

                <span className="absolute bottom-1 left-2.5 h-0.5 w-0 rounded-full bg-[#F28C28] transition-all duration-300 group-hover:w-[calc(100%-1.25rem)]" />
              </Link>

              {/* GET STARTED */}
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-[#D97706] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#B45309] hover:shadow-md sm:px-5 sm:text-sm"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* ==================================================
                  MY GRIEVANCES
              ================================================== */}

              <Link
                to="/my-grievances"
                onClick={() =>
                  setAccountOpen(false)
                }
                className="group inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D97706] hover:bg-orange-50 hover:text-[#D97706] hover:shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A] dark:text-white dark:hover:border-[#F28C28] dark:hover:bg-[#111111] dark:hover:text-[#F28C28] sm:h-11 sm:px-3.5"
                title="My Grievances"
              >
                <FileText
                  size={16}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                />

                <span className="hidden text-sm font-semibold sm:inline">
                  My Grievances
                </span>
              </Link>

              {/* ==================================================
                  AUTHORITY DASHBOARD
              ================================================== */}

              {isAuthority && (
                <Link
                  to="/authority-dashboard"
                  onClick={() =>
                    setAccountOpen(false)
                  }
                  className="group inline-flex h-10 items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-2.5 text-green-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-100 hover:shadow-sm dark:border-green-900/60 dark:bg-green-950/20 dark:text-green-400 dark:hover:border-green-800 dark:hover:bg-green-950/40 sm:h-11 sm:px-3.5"
                  title="Authority Dashboard"
                >
                  <ShieldCheck
                    size={16}
                    className="shrink-0"
                  />

                  <span className="hidden text-sm font-semibold md:inline">
                    Authority
                  </span>
                </Link>
              )}

              {/* ==================================================
                  ACCOUNT MENU
              ================================================== */}

              <div
                className="relative"
                data-account-menu
              >
                <button
                  type="button"
                  onClick={() =>
                    setAccountOpen(
                      (current) =>
                        !current
                    )
                  }
                  className={`flex h-10 items-center gap-2 rounded-xl border bg-white px-1.5 shadow-sm transition-all duration-200 dark:bg-[#0A0A0A] sm:h-11 sm:gap-2.5 sm:px-2 ${
                    accountOpen
                      ? "border-[#D97706] bg-orange-50 dark:border-[#F28C28] dark:bg-[#111111]"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-[#262626] dark:hover:border-[#404040] dark:hover:bg-[#111111]"
                  }`}
                  aria-expanded={
                    accountOpen
                  }
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                >
                  {/* AVATAR */}
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A] text-[11px] font-extrabold text-white dark:bg-[#111111] sm:h-9 sm:w-9">
                    {getInitials()}

                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#15803D] dark:border-[#0A0A0A]`}
                    />
                  </span>

                  {/* USER NAME */}
                  <span className="hidden max-w-32 truncate text-left text-sm font-semibold text-[#0B1F3A] dark:text-white sm:block">
                    {user?.fullName ||
                      "Account"}
                  </span>

                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform duration-200 ${
                      accountOpen
                        ? "rotate-180 text-[#D97706] dark:text-[#F28C28]"
                        : ""
                    }`}
                  />
                </button>

                {/* ==================================================
                    DROPDOWN
                ================================================== */}

                {accountOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-[calc(100vw-1.5rem)] max-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.15)] dark:border-[#262626] dark:bg-[#0A0A0A] dark:shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
                    {/* ACCOUNT HEADER */}
                    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4 dark:border-[#262626] dark:bg-[#111111]">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A] text-sm font-extrabold text-white dark:bg-[#171717]">
                          {getInitials()}

                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-50 bg-[#15803D] dark:border-[#111111]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#0B1F3A] dark:text-white">
                            {user?.fullName ||
                              "Account"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-neutral-500">
                            {user?.email}
                          </p>

                          {isAuthority && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-700 dark:bg-green-950/40 dark:text-green-400">
                              <ShieldCheck
                                size={10}
                              />
                              Authority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* MENU */}
                    <div className="p-2">
                      <Link
                        to="/my-grievances"
                        onClick={() =>
                          setAccountOpen(
                            false
                          )
                        }
                        className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-orange-50 hover:text-[#D97706] dark:text-neutral-300 dark:hover:bg-[#111111] dark:hover:text-[#F28C28]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-orange-100 group-hover:text-[#D97706] dark:bg-[#171717] dark:text-neutral-400 dark:group-hover:bg-orange-950/30 dark:group-hover:text-[#F28C28]">
                          <FileText
                            size={16}
                          />
                        </span>

                        <span>
                          My Grievances
                        </span>
                      </Link>

                      {isAuthority && (
                        <Link
                          to="/authority-dashboard"
                          onClick={() =>
                            setAccountOpen(
                              false
                            )
                          }
                          className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-green-50 hover:text-green-700 dark:text-neutral-300 dark:hover:bg-green-950/20 dark:hover:text-green-400"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                            <LayoutDashboard
                              size={16}
                            />
                          </span>

                          <span>
                            Authority Dashboard
                          </span>
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        onClick={() =>
                          setAccountOpen(
                            false
                          )
                        }
                        className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-orange-50 hover:text-[#D97706] dark:text-neutral-300 dark:hover:bg-[#111111] dark:hover:text-[#F28C28]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-orange-100 group-hover:text-[#D97706] dark:bg-[#171717] dark:text-neutral-400 dark:group-hover:bg-orange-950/30 dark:group-hover:text-[#F28C28]">
                          <Settings
                            size={16}
                          />
                        </span>

                        <span>
                          Settings
                        </span>
                      </Link>

                      <div className="my-1.5 border-t border-slate-100 dark:border-[#262626]" />

                      <button
                        type="button"
                        onClick={
                          handleLogout
                        }
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                          <LogOut
                            size={16}
                          />
                        </span>

                        <span>
                          Logout
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
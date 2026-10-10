import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Palette,
  Sun,
  Moon,
  LogOut,
  Trash2,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const navigate = useNavigate();

  const {
    user,
    logout,
    deleteAccount,
  } = useAuth();

  const {
    theme,
    setTheme,
  } = useTheme();

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteConfirm, setDeleteConfirm] =
    useState("");

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    const result = await logout();

    if (!result.success) {
      window.alert(result.message || "Unable to sign out. Please try again.");
      return;
    }

    navigate("/login", {
      replace: true,
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      return;
    }

    const result = await deleteAccount();

    if (!result.success) {
      window.alert(result.message || "Unable to delete the account. Please try again.");
      return;
    }

    setShowDeleteModal(false);
    setDeleteConfirm("");

    navigate("/register", {
      replace: true,
      state: {
        message:
          "Your CivicAI account has been deleted.",
      },
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
    <main className="min-h-screen bg-[#F8FAFC] pb-20 text-[#0B1F3A] dark:bg-black dark:text-white">

      {/* TOP ACCENT */}
      <div className="h-1 bg-[#F28C28]" />

      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8 lg:px-10">

        {/* BACK */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#D97706] dark:text-slate-400 dark:hover:bg-[#111111] dark:hover:text-[#F28C28]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A] dark:text-white sm:text-4xl">
            Account Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage your CivicAI profile, appearance and
            account preferences.
          </p>
        </div>

        <div className="space-y-6">

          {/* PROFILE */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A]">

            <div className="border-b border-slate-200 px-6 py-5 dark:border-[#262626]">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-[#151515] dark:text-slate-300">
                  <User size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-[#0B1F3A] dark:text-white">
                    Profile Information
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Your registered citizen information
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">

              <div className="mb-7 flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0B1F3A] text-lg font-bold text-white dark:bg-[#111111]">
                  {getInitials()}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-xl font-bold text-[#0B1F3A] dark:text-white">
                    {user?.fullName || "Citizen"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Citizen Account
                  </p>
                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#262626] dark:bg-[#111111]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Mail size={14} />
                    Email Address
                  </div>

                  <p className="mt-2 break-all text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    {user?.email || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#262626] dark:bg-[#111111]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Phone size={14} />
                    Mobile Number
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    {user?.phone || "Not available"}
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* APPEARANCE */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A]">

            <div className="border-b border-slate-200 px-6 py-5 dark:border-[#262626]">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-[#151515] dark:text-slate-300">
                  <Palette size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-[#0B1F3A] dark:text-white">
                    Appearance
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Choose how CivicAI looks for you
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                {/* LIGHT */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`rounded-2xl border p-5 text-left transition duration-200 ${
                    theme === "light"
                      ? "border-[#D97706] bg-orange-50 ring-2 ring-orange-100 dark:border-[#F28C28] dark:bg-orange-950/10 dark:ring-orange-950/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#262626] dark:bg-[#111111] dark:hover:border-[#404040]"
                  }`}
                >
                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#D97706] shadow-sm ring-1 ring-slate-200">
                      <Sun size={20} />
                    </div>

                    {theme === "light" && (
                      <CheckCircle2
                        size={20}
                        className="text-[#D97706]"
                      />
                    )}

                  </div>

                  <p className="mt-4 font-bold text-[#0B1F3A] dark:text-white">
                    Light
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Clean and bright interface for daytime use.
                  </p>
                </button>

                {/* DARK */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`rounded-2xl border p-5 text-left transition duration-200 ${
                    theme === "dark"
                      ? "border-[#F28C28] bg-[#111111] ring-2 ring-orange-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#262626] dark:bg-[#111111] dark:hover:border-[#404040]"
                  }`}
                >
                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-[#F28C28] ring-1 ring-[#262626]">
                      <Moon size={20} />
                    </div>

                    {theme === "dark" && (
                      <CheckCircle2
                        size={20}
                        className="text-[#F28C28]"
                      />
                    )}

                  </div>

                  <p className="mt-4 font-bold text-[#0B1F3A] dark:text-white">
                    Dark
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    True black interface designed for low-light use.
                  </p>
                </button>

              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A]">

            <div className="border-b border-slate-200 px-6 py-5 dark:border-[#262626]">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#15803D] dark:bg-green-950/20 dark:text-green-400">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-[#0B1F3A] dark:text-white">
                    Account & Security
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Manage your active session
                  </p>
                </div>

              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-[#262626]">

              {/* SIGN OUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50 dark:hover:bg-[#111111]"
              >
                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-[#151515] dark:text-slate-300">
                    <LogOut size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                      Sign Out
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Sign out from this device
                    </p>
                  </div>

                </div>

                <ChevronRight
                  size={18}
                  className="text-slate-400"
                />
              </button>

              {/* DELETE ACCOUNT */}
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirm("");
                  setShowDeleteModal(true);
                }}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-red-50 dark:hover:bg-red-950/10"
              >
                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                    <Trash2 size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      Delete Account
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Permanently remove your CivicAI account
                    </p>
                  </div>

                </div>

                <ChevronRight
                  size={18}
                  className="text-red-400"
                />
              </button>

            </div>
          </section>

        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          CivicAI Citizen Service Portal
        </p>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#262626] dark:bg-[#0A0A0A]">

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertTriangle size={21} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#151515] dark:hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            <h2 className="mt-5 text-xl font-bold text-[#0B1F3A] dark:text-white">
              Delete your account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This action will permanently remove your CivicAI
              account. This cannot be undone.
            </p>

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/10">
              <p className="text-xs font-medium leading-5 text-red-700 dark:text-red-400">
                Type{" "}
                <span className="font-bold">
                  DELETE
                </span>{" "}
                below to confirm.
              </p>
            </div>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(event) =>
                setDeleteConfirm(event.target.value)
              }
              placeholder="Type DELETE"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0B1F3A] outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/30"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#262626] dark:text-slate-300 dark:hover:bg-[#151515]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteConfirm !== "DELETE"}
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete Account
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}

export default Settings;
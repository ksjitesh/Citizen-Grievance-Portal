import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword(normalizedEmail);

      if (!result.success) {
        setError(result.message || "Unable to send the reset email. Please try again.");
        return;
      }

      setSuccess(result.message);
    } catch {
      setError("Unable to send the reset email right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-white">
      <div className="h-1 bg-[#F28C28]" />

      <div className="mx-auto grid min-h-[calc(100vh-4px)] max-w-7xl lg:grid-cols-2">
        <section className="hidden flex-col justify-center px-10 py-16 lg:flex xl:px-16">
          <div className="max-w-lg">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1F3A] text-white shadow-lg dark:bg-[#111111]">
              <LockKeyhole size={26} />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
              Account Recovery
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight text-[#0B1F3A] dark:text-white">
              Recover your
              <span className="block text-[#D97706]">CivicAI account.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              We will email you a secure link to reset your password. Your new password is set on Firebase's secure reset page, not stored by this website.
            </p>
            <div className="mt-10 flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#15803D] dark:bg-green-950/30">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-semibold text-[#0B1F3A] dark:text-white">Secure password reset</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Use the reset link sent to the email address registered with your account.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-xl">
            <div className="mb-8 lg:hidden">
              <Link to="/login" className="text-xl font-bold text-[#0B1F3A] dark:text-white">
                Civic<span className="text-[#D97706]">AI</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9 dark:border-[#262626] dark:bg-[#0A0A0A]">
              {!success ? (
                <>
                  <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97706]">Password Reset</p>
                    <h2 className="mt-2 text-3xl font-bold text-[#0B1F3A] dark:text-white">Forgot password?</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Enter your registered email address and we will send you a password-reset link.
                    </p>
                  </div>

                  {error && (
                    <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-white">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setError("");
                          }}
                          placeholder="you@example.com"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F28C28] dark:focus:ring-orange-950/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#12355B] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#F28C28] dark:text-black dark:hover:bg-[#fb9c42]"
                    >
                      {isSubmitting ? "Sending reset link..." : "Send reset link"}
                      {!isSubmitting && <ArrowRight size={17} />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-[#0B1F3A] dark:text-white">Check your email</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{success}</p>
                  <p className="mt-3 break-words text-sm font-semibold text-[#0B1F3A] dark:text-white">{email.trim().toLowerCase()}</p>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">If the email does not arrive, check your spam folder. The link may expire, so request a new one if needed.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess("");
                      setError("");
                    }}
                    className="mt-6 text-sm font-semibold text-[#D97706] transition hover:text-[#B45309] dark:text-[#F28C28]"
                  >
                    Try another email
                  </button>
                </div>
              )}

              <div className="mt-7 border-t border-slate-100 pt-6 dark:border-[#262626]">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#D97706] dark:text-slate-400 dark:hover:text-[#F28C28]">
                  <ArrowLeft size={16} /> Back to sign in
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
              CivicAI · Secure Citizen Grievance Portal
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;

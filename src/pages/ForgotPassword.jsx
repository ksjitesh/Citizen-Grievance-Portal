import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleEmailSubmit = (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    /*
     * resetPassword() performs the account lookup
     * during the password update step.
     *
     * Here we only move to the password creation step.
     */
    setFormData((current) => ({
      ...current,
      email,
    }));

    setStep(2);
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const newPassword = formData.newPassword;
    const confirmPassword = formData.confirmPassword;

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = resetPassword(
      email,
      newPassword
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess(
      "Your password has been updated successfully."
    );

    setStep(3);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-white">
      <div className="h-1 bg-[#F28C28]" />

      <div className="mx-auto grid min-h-[calc(100vh-4px)] max-w-7xl lg:grid-cols-2">

        {/* LEFT SIDE */}
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
              <span className="block text-[#D97706]">
                CivicAI account.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              Reset your password and regain access to your
              citizen account and grievance history.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#15803D] dark:bg-green-950/30">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    Account protection
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Your password is required to access your
                    citizen account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#D97706] dark:bg-orange-950/30">
                  <LockKeyhole size={18} />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    Set a new password
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Create a new password with at least 6
                    characters.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">

          <div className="w-full max-w-xl">

            {/* Mobile Logo */}
            <div className="mb-8 lg:hidden">
              <Link
                to="/login"
                className="text-xl font-bold text-[#0B1F3A] dark:text-white"
              >
                Civic<span className="text-[#D97706]">AI</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9 dark:border-[#262626] dark:bg-[#0A0A0A]">

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97706]">
                      Step 1
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-[#0B1F3A] dark:text-white">
                      Find your account
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Enter the email address associated with
                      your CivicAI account.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{error}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleEmailSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-white"
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F28C28] dark:focus:ring-orange-950/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] px-5 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#B45309] hover:shadow-lg"
                    >
                      Continue

                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97706]">
                      Step 2
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-[#0B1F3A] dark:text-white">
                      Create new password
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Set a new password for{" "}
                      <span className="font-semibold text-[#0B1F3A] dark:text-white">
                        {formData.email}
                      </span>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{error}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-5"
                  >

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-white"
                      >
                        New Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="newPassword"
                          name="newPassword"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F28C28] dark:focus:ring-orange-950/30"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (current) => !current
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#1A1A1A] dark:hover:text-white"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-white"
                      >
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F28C28] dark:focus:ring-orange-950/30"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (current) => !current
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#1A1A1A] dark:hover:text-white"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] px-5 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#B45309] hover:shadow-lg"
                    >
                      Reset Password

                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>

                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#D97706] dark:text-slate-400 dark:hover:text-[#F28C28]"
                  >
                    <ArrowLeft size={16} />
                    Change email
                  </button>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="py-6 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#15803D] dark:bg-green-950/30">
                    <CheckCircle2 size={34} />
                  </div>

                  <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[#15803D]">
                    Password Updated
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#0B1F3A] dark:text-white">
                    You're all set.
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {success ||
                      "Your password has been updated successfully."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/login", {
                        replace: true,
                      })
                    }
                    className="group mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D97706] px-6 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#B45309] hover:shadow-lg"
                  >
                    Go to Login

                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>

                </div>
              )}

              {/* Back to Login */}
              {step !== 3 && (
                <div className="mt-7 border-t border-slate-200 pt-6 text-center dark:border-[#262626]">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#D97706] dark:text-slate-400 dark:hover:text-[#F28C28]"
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </Link>
                </div>
              )}

            </div>

            <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
              CivicAI Citizen Service Portal
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
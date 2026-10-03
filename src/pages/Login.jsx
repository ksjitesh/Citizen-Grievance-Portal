import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
    loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  /*
   * If the user is already authenticated,
   * there is no reason to remain on Login.
   */
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", {
        replace: true,
      });
    }
  }, [loading, isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError(
        "Please enter your email address and password."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const result = login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-black">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#D97706] dark:border-[#262626] dark:border-t-[#F28C28]" />

          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            Checking your session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-white">
      <div className="h-1 bg-[#F28C28]" />

      <div className="mx-auto grid min-h-[calc(100vh-4px)] max-w-7xl lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="hidden flex-col justify-center px-10 py-16 lg:flex xl:px-16">
          <div className="max-w-lg">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1F3A] text-white shadow-lg dark:bg-[#111111]">
              <LogIn size={26} />
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
              Citizen Access
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight text-[#0B1F3A] dark:text-white">
              Welcome back to
              <span className="block text-[#D97706]">
                CivicAI.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              Sign in to report civic issues, track your
              grievances, and stay updated on their resolution.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#15803D] dark:bg-green-950/30">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    Secure citizen access
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Access your grievances and account information
                    from one place.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#D97706] dark:bg-orange-950/30">
                  <LogIn size={18} />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    Continue where you left off
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Track existing complaints and submit new
                    grievances.
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

              {/* Header */}
              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97706]">
                  Citizen Login
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#0B1F3A] dark:text-white">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Enter your registered email and password to
                  continue.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
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

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-[#0B1F3A] dark:text-white"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#D97706] transition hover:text-[#B45309] dark:text-[#F28C28] dark:hover:text-[#FDBA74]"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
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
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] px-5 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#B45309] hover:shadow-lg"
                >
                  Sign In

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

              </form>

              {/* Register */}
              <div className="mt-7 border-t border-slate-200 pt-6 text-center dark:border-[#262626]">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-bold text-[#D97706] hover:text-[#B45309] dark:text-[#F28C28] dark:hover:text-[#FDBA74]"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

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

export default Login;
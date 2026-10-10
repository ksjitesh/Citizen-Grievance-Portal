import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (!fullName || !email || !phone || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const userData = {
      fullName,
      email,
      phone,
      password: formData.password,
    };

    const result = await register(userData);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-white">
      <div className="h-1 bg-[#F28C28]" />

      <div className="mx-auto grid min-h-[calc(100vh-4px)] max-w-7xl lg:grid-cols-2">

        {/* LEFT SIDE */}

        <section className="hidden flex-col justify-center px-10 py-16 lg:flex xl:px-16">
          <div className="max-w-lg">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1F3A] text-white shadow-lg dark:bg-[#111111]">
              <UserPlus size={26} />
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
              Citizen Account
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight text-[#0B1F3A] dark:text-white">
              Create your
              <span className="block text-[#D97706]">
                CivicAI account.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              Create an account to report civic issues, track your
              grievances, and receive updates throughout the resolution
              process.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#15803D] dark:bg-green-950/30">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    Track your grievances
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Follow complaint progress using your reference ID.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#D97706] dark:bg-orange-950/30">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    Transparent service
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Stay informed about your grievance status.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-xl">

            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                className="text-xl font-bold text-[#0B1F3A] dark:text-white"
              >
                Civic<span className="text-[#D97706]">AI</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9 dark:border-[#262626] dark:bg-[#0A0A0A]">

              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97706]">
                  Get Started
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#0B1F3A] dark:text-white">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Enter your details to create a citizen account.
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
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* FULL NAME */}

                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:ring-orange-950/30"
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
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
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:ring-orange-950/30"
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
                  >
                    Mobile Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:ring-orange-950/30"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-12 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:ring-orange-950/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-[#0B1F3A] dark:hover:text-white"
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

                {/* CONFIRM PASSWORD */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock
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
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-12 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#333333] dark:bg-[#111111] dark:text-white dark:focus:ring-orange-950/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-[#0B1F3A] dark:hover:text-white"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-5 py-3.5 font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#12355B] hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-slate-200"
                >
                  Create Citizen Account

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

              </form>

              <div className="mt-7 border-t border-slate-200 pt-6 text-center dark:border-[#262626]">

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="mt-2 inline-flex font-semibold text-[#D97706] transition hover:text-[#B45309]"
                >
                  Sign in to CivicAI
                </Link>

              </div>

            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} />
              Your account is used for citizen grievance services.
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Register;
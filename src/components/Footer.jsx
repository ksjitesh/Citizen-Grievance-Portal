import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Settings,
} from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#0B1F3A] text-white">

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0B1F3A]">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-lg font-bold">
                Civic<span className="text-[#F28C28]">AI</span>
              </p>

              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Citizen Service Portal
              </p>
            </div>

          </div>

          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
            An AI-assisted platform designed to help citizens report, track,
            and manage civic grievances through a transparent digital workflow.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} className="text-[#F28C28]" />
            Built for transparent public service
          </div>

        </div>

        <div>

          <h3 className="font-semibold text-white">
            Citizen Services
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-slate-400">

            <li>
              <Link
                to="/report-grievance"
                className="transition hover:text-[#F28C28]"
              >
                Report a Grievance
              </Link>
            </li>

            <li>
              <span className="cursor-pointer transition hover:text-[#F28C28]">
                Track Complaint
              </span>
            </li>

            <li>
              <Link
                to="/register"
                className="transition hover:text-[#F28C28]"
              >
                Create Account
              </Link>
            </li>

            <li>
              <Link
                to="/login"
                className="transition hover:text-[#F28C28]"
              >
                Citizen Login
              </Link>
            </li>

          </ul>

        </div>

        <div>

          <h3 className="font-semibold text-white">
            Authority
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-slate-400">

            <li>Authority Dashboard</li>
            <li>Grievance Management</li>
            <li>Analytics & Reports</li>
            <li>Department Routing</li>

          </ul>

        </div>

        <div>

          <h3 className="font-semibold text-white">
            Support
          </h3>

          <div className="mt-5 space-y-4 text-sm text-slate-400">

            <div className="flex items-start gap-3">
              <Mail size={17} className="mt-0.5 shrink-0 text-[#F28C28]" />
              <span>support@civicai.in</span>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={17} className="mt-0.5 shrink-0 text-[#F28C28]" />
              <span>Citizen Support Centre</span>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-[#F28C28]" />
              <span>Public Service Digital Platform</span>
            </div>

            <Link
              to="/settings"
              className="flex items-center gap-3 pt-2 text-slate-400 transition hover:text-[#F28C28]"
            >
              <Settings size={17} />
              Settings
            </Link>

          </div>

        </div>

      </div>

      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 CivicAI. Prototype developed for BHARATH INNOVATE HACKATHON 2026.
          </p>

          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Accessibility</span>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
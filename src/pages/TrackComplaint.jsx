import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Search,
  FileText,
  MapPin,
  CalendarDays,
  Clock3,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
  Building2,
  Hash,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getComplaintByReference,
} from "../services/complaintService";

const statusConfig = {
  Submitted: {
    label: "Submitted",
    description:
      "Your grievance has been received and registered successfully.",
  },

  "In Progress": {
    label: "In Progress",
    description:
      "The concerned department is currently working on your grievance.",
  },

  Resolved: {
    label: "Resolved",
    description:
      "The grievance has been resolved by the concerned authority.",
  },

  Rejected: {
    label: "Rejected",
    description:
      "The grievance could not be processed further.",
  },

  Closed: {
    label: "Closed",
    description:
      "The grievance case has been closed.",
  },
};

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "Resolved":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900";

    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";

    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900";

    case "Closed":
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#151515] dark:text-slate-300 dark:border-[#2A2A2A]";

    default:
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
  }
}

function getTimelineIcon(status, isLatest) {
  if (status === "Resolved") {
    return (
      <CheckCircle2
        size={18}
        className="text-green-600 dark:text-green-400"
      />
    );
  }

  if (status === "Rejected") {
    return (
      <AlertCircle
        size={18}
        className="text-red-600 dark:text-red-400"
      />
    );
  }

  if (isLatest) {
    return (
      <CircleDot
        size={18}
        className="text-[#D97706] dark:text-[#F28C28]"
      />
    );
  }

  return (
    <CheckCircle2
      size={18}
      className="text-slate-400 dark:text-slate-500"
    />
  );
}

function TrackComplaint() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const { user } = useAuth();

  const [referenceId, setReferenceId] =
    useState("");

  const [complaint, setComplaint] =
    useState(null);

  const [error, setError] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const searchComplaint = (
    reference
  ) => {
    const cleanReferenceId =
      reference
        .trim()
        .toUpperCase();

    if (!cleanReferenceId) {
      setError(
        "Please enter your grievance reference ID."
      );

      setComplaint(null);

      return;
    }

    setSearching(true);
    setError("");

    const result =
      getComplaintByReference(
        cleanReferenceId
      );

    if (!result) {
      setComplaint(null);

      setError(
        "No grievance was found with this reference ID."
      );

      setSearching(false);

      return;
    }

    /*
     * Citizen privacy:
     * A logged-in citizen can only view
     * their own grievances.
     */
    if (
      result.citizenId &&
      result.citizenId !== user?.id
    ) {
      setComplaint(null);

      setError(
        "This grievance does not belong to your account."
      );

      setSearching(false);

      return;
    }

    setComplaint(result);

    setSearching(false);
  };

  /*
   * Automatically load complaint when
   * reference ID exists in URL.
   *
   * Example:
   * /track-complaint?reference=CIV-12345678-1234
   */
  useEffect(() => {
    const urlReference =
      searchParams.get("reference");

    if (!urlReference || !user?.id) {
      return;
    }

    setReferenceId(
      urlReference.toUpperCase()
    );

    searchComplaint(urlReference);
  }, [
    searchParams,
    user?.id,
  ]);

  /*
   * Live complaint update listener.
   *
   * When Authority Dashboard updates a complaint
   * in the same browser tab, complaintService
   * dispatches "civicai-complaints-updated".
   *
   * This refreshes the currently displayed complaint
   * without requiring the citizen to search again.
   *
   * The "storage" listener also handles updates
   * coming from another browser tab.
   */
  useEffect(() => {
    const handleComplaintUpdate = () => {
      const currentReference =
        searchParams.get("reference");

      if (!currentReference) {
        return;
      }

      const updatedComplaint =
        getComplaintByReference(
          currentReference
        );

      if (!updatedComplaint) {
        return;
      }

      if (
        updatedComplaint.citizenId &&
        updatedComplaint.citizenId !==
          user?.id
      ) {
        return;
      }

      setComplaint(
        updatedComplaint
      );
    };

    const handleStorageChange = () => {
      handleComplaintUpdate();
    };

    window.addEventListener(
      "civicai-complaints-updated",
      handleComplaintUpdate
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "civicai-complaints-updated",
        handleComplaintUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [
    searchParams,
    user?.id,
  ]);

  const handleSearch = (event) => {
    event.preventDefault();

    searchComplaint(referenceId);
  };

  const handleClear = () => {
    setReferenceId("");
    setComplaint(null);
    setError("");

    navigate("/track-complaint", {
      replace: true,
    });
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 transition-colors duration-300 dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#D97706] dark:text-slate-400 dark:hover:bg-[#111111] dark:hover:text-[#F28C28]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Header */}
        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D97706]/20 bg-[#D97706]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B45309] dark:border-[#F28C28]/20 dark:bg-[#F28C28]/10 dark:text-[#F28C28]">
            <ShieldCheck size={14} />
            Citizen Services
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Track Your Grievance
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Enter your grievance reference ID to view
            the latest status, department information,
            and complete progress history.
          </p>
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A] sm:p-7">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D97706]/10 text-[#D97706] dark:bg-[#F28C28]/10 dark:text-[#F28C28]">
              <Search size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Find your grievance
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use the reference ID provided after
                successful submission.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Hash
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={referenceId}
                onChange={(event) =>
                  setReferenceId(
                    event.target.value
                  )
                }
                placeholder="Example: CIV-12345678-1234"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/10 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#F28C28] dark:focus:ring-[#F28C28]/10"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-6 text-sm font-bold text-white transition hover:bg-[#12355B] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#F28C28] dark:text-black dark:hover:bg-[#FB923C]"
            >
              {searching ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Track Grievance
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Unable to find grievance
                </p>

                <p className="mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Empty State */}
        {!complaint && !error && (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-[#2A2A2A] dark:bg-[#0A0A0A]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-[#151515] dark:text-slate-400">
              <FileText size={25} />
            </div>

            <h3 className="mt-5 text-lg font-bold">
              No grievance selected
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Enter the reference ID of a grievance
              submitted from your account to view its
              current progress.
            </p>
          </section>
        )}

        {/* Complaint Result */}
        {complaint && (
          <section className="mt-8 space-y-6">

            {/* Result Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A] sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Grievance Reference
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black tracking-tight text-[#0B1F3A] dark:text-white">
                      {complaint.referenceId}
                    </h2>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {statusConfig[
                      complaint.status
                    ]?.description ||
                      "Your grievance is being processed."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-[#2A2A2A] dark:text-slate-300 dark:hover:bg-[#151515]"
                >
                  <RefreshCw size={16} />
                  New Search
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A] sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F3A]/10 text-[#0B1F3A] dark:bg-[#F28C28]/10 dark:text-[#F28C28]">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Grievance Details
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Information submitted with your complaint
                    </p>
                  </div>
                </div>

                <div className="space-y-5">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Complaint Title
                    </p>

                    <p className="mt-1 text-base font-semibold">
                      {complaint.title ||
                        "Untitled grievance"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {complaint.description ||
                        "No description available."}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-[#202020] dark:bg-[#111111]">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Category
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {complaint.category ||
                          complaint.aiCategory ||
                          "Other"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-[#202020] dark:bg-[#111111]">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Department
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {complaint.department ||
                          "General Administration"}
                      </p>
                    </div>

                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-[#202020] dark:bg-[#111111]">
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-[#D97706] dark:text-[#F28C28]"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Complaint Location
                        </p>

                        <p className="mt-1 text-sm font-semibold leading-6">
                          {[
                            complaint.address,
                            complaint.landmark,
                            complaint.locality,
                            complaint.ward,
                            complaint.city,
                            complaint.state,
                            complaint.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                            "Location not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Case Information */}
              <div className="space-y-6">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A] sm:p-7">
                  <h3 className="font-bold">
                    Case Information
                  </h3>

                  <div className="mt-5 space-y-4">

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Submitted On
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatDateTime(
                            complaint.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3
                        size={18}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Last Updated
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatDateTime(
                            complaint.updatedAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Priority
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {complaint.priority ||
                            "Medium"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building2
                        size={18}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {complaint.department ||
                            "General Administration"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="rounded-2xl border border-[#D97706]/20 bg-[#D97706]/5 p-5 dark:border-[#F28C28]/20 dark:bg-[#F28C28]/5 sm:p-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D97706]/10 text-[#D97706] dark:bg-[#F28C28]/10 dark:text-[#F28C28]">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">
                        Citizen Privacy
                      </h3>

                      <p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-400">
                        Complaint information is displayed
                        only for the account that submitted
                        the grievance.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A] sm:p-7">
              <div className="mb-7">
                <h3 className="text-lg font-bold">
                  Complaint Timeline
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Track every recorded status change for
                  this grievance.
                </p>
              </div>

              <div className="space-y-0">
                {(complaint.statusHistory || [])
                  .map(
                    (
                      entry,
                      index,
                      history
                    ) => {
                      const isLatest =
                        index ===
                        history.length - 1;

                      return (
                        <div
                          key={`${entry.timestamp}-${index}`}
                          className="relative flex gap-4"
                        >
                          {index <
                            history.length - 1 && (
                            <div className="absolute left-[8px] top-7 h-full w-px bg-slate-200 dark:bg-[#2A2A2A]" />
                          )}

                          <div
                            className={`relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#0A0A0A] ${
                              isLatest
                                ? "ring-4 ring-[#D97706]/10 dark:ring-[#F28C28]/10"
                                : ""
                            }`}
                          >
                            {getTimelineIcon(
                              entry.status,
                              isLatest
                            )}
                          </div>

                          <div
                            className={`pb-7 ${
                              isLatest
                                ? ""
                                : "opacity-80"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold">
                                {entry.status}
                              </h4>

                              {isLatest && (
                                <span className="rounded-full bg-[#D97706]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B45309] dark:bg-[#F28C28]/10 dark:text-[#F28C28]">
                                  Current
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {formatDateTime(
                                entry.timestamp
                              )}
                            </p>

                            {entry.note && (
                              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}

                {(!complaint.statusHistory ||
                  complaint.statusHistory
                    .length === 0) && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No status history is available yet.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                />

                <div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">
                    Your grievance is registered
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-700 dark:text-green-400/80">
                    Keep your reference ID safe for future
                    tracking and communication.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-green-700/70 dark:text-green-400/60">
                  Reference ID
                </p>

                <p className="mt-1 font-mono text-sm font-bold text-green-800 dark:text-green-300">
                  {complaint.referenceId}
                </p>
              </div>
            </div>

          </section>
        )}
      </div>
    </main>
  );
}

export default TrackComplaint;
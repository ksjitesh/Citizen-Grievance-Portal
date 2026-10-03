import { useState } from "react";

import {
  MapPin,
  Upload,
  Send,
  FileText,
  AlertCircle,
  Sparkles,
  X,
  CheckCircle2,
  Copy,
  ArrowRight,
  Navigation,
  Building2,
  MapPinned,
  Hash,
  ShieldCheck,
  LoaderCircle,
  Printer,
  BrainCircuit,
  LocateFixed,
  Map,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  createComplaint,
  getAllComplaints,
} from "../services/complaintService";

import {
  analyzeComplaint,
  findPossibleDuplicates,
} from "../services/aiService";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const ALL_LOCATIONS = [
  ...INDIAN_STATES,
  ...UNION_TERRITORIES,
].sort((a, b) => a.localeCompare(b));

function ReportGrievance() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    landmark: "",
    locality: "",
    ward: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  const [grievanceId, setGrievanceId] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [pinLoading, setPinLoading] =
    useState(false);

  const [pinError, setPinError] =
    useState("");

  const [pinSuccess, setPinSuccess] =
    useState("");

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [locationSuccess, setLocationSuccess] =
    useState("");

  const [coordinates, setCoordinates] =
    useState({
      latitude: null,
      longitude: null,
      accuracy: null,
    });

  const [aiResult, setAiResult] =
    useState(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [duplicateWarnings, setDuplicateWarnings] =
    useState([]);

  /*
   * --------------------------------------------------
   * FORM CHANGE
   * --------------------------------------------------
   */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "pincode") {
      setPinError("");
      setPinSuccess("");
    }

    if (
      name === "title" ||
      name === "description"
    ) {
      setAiResult(null);
      setDuplicateWarnings([]);
    }
  };

  /*
   * --------------------------------------------------
   * PINCODE LOOKUP
   * --------------------------------------------------
   */

  const lookupPincode = async () => {
    const cleanPin =
      formData.pincode.replace(
        /\D/g,
        ""
      );

    if (cleanPin.length !== 6) {
      setPinError(
        "Enter a valid 6-digit PIN code."
      );

      return;
    }

    setPinLoading(true);
    setPinError("");
    setPinSuccess("");

    try {
      const response =
        await fetch(
          `https://api.pincodeapi.in/api/v1/pincode/${cleanPin}`
        );

      if (!response.ok) {
        throw new Error(
          "PIN lookup failed."
        );
      }

      const result =
        await response.json();

      const postOffices =
        result?.data?.post_offices ||
        [];

      if (
        !result?.success ||
        postOffices.length === 0
      ) {
        throw new Error(
          "PIN not found."
        );
      }

      const firstOffice =
        postOffices[0];

      const city =
        firstOffice?.district ||
        firstOffice?.office_name ||
        "";

      const state =
        firstOffice?.state ||
        "";

      setFormData((previous) => ({
        ...previous,
        pincode: cleanPin,
        city,
        state,
      }));

      setPinSuccess(
        `${city}${
          state
            ? `, ${state}`
            : ""
        } found for PIN ${cleanPin}.`
      );
    } catch {
      setPinError(
        "PIN code could not be found. Please check the 6-digit PIN or enter the city and state manually."
      );
    } finally {
      setPinLoading(false);
    }
  };

  const handlePincodeKeyDown =
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        lookupPincode();
      }
    };

  /*
   * --------------------------------------------------
   * USE CURRENT LOCATION
   * --------------------------------------------------
   */

  const useCurrentLocation = () => {
    setLocationError("");
    setLocationSuccess("");

    if (
      !navigator.geolocation
    ) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        setCoordinates({
          latitude,
          longitude,
          accuracy,
        });

        setLocationSuccess(
          `Location captured with approximately ${Math.round(
            accuracy
          )}m accuracy.`
        );

        setLocationLoading(false);
      },
      (error) => {
        let message =
          "Unable to access your location.";

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          message =
            "Your current location could not be determined.";
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          message =
            "Location request timed out. Please try again.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /*
   * --------------------------------------------------
   * FILE UPLOAD
   * --------------------------------------------------
   */

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Only JPG, PNG or PDF files are allowed."
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "File size must be 5 MB or less."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  /*
   * --------------------------------------------------
   * AI ANALYSIS
   * --------------------------------------------------
   */

  const runAIAnalysis = () => {
    const title =
      formData.title.trim();

    const description =
      formData.description.trim();

    if (!title && !description) {
      alert(
        "Enter a complaint title or description before running AI analysis."
      );

      return;
    }

    setAnalyzing(true);
    setDuplicateWarnings([]);

    setTimeout(() => {
      const result =
        analyzeComplaint({
          title,
          description,
        });

      setAiResult(result);

      const duplicates =
        findPossibleDuplicates(
          {
            title,
            description,
          },
          getAllComplaints()
        );

      setDuplicateWarnings(
        duplicates
      );

      setAnalyzing(false);
    }, 700);
  };

  /*
   * --------------------------------------------------
   * COPY REFERENCE ID
   * --------------------------------------------------
   */

  const copyGrievanceId =
    async () => {
      if (!grievanceId) {
        return;
      }

      try {
        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator.clipboard.writeText(
            grievanceId
          );
        } else {
          const textArea =
            document.createElement(
              "textarea"
            );

          textArea.value =
            grievanceId;

          textArea.style.position =
            "fixed";

          textArea.style.left =
            "-999999px";

          textArea.style.top =
            "-999999px";

          document.body.appendChild(
            textArea
          );

          textArea.focus();
          textArea.select();

          document.execCommand(
            "copy"
          );

          document.body.removeChild(
            textArea
          );
        }

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        alert(
          "Unable to copy the reference ID. Please copy it manually."
        );
      }
    };

  /*
   * --------------------------------------------------
   * SUBMIT
   * --------------------------------------------------
   */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.locality.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      alert(
        "Please complete all required fields before submitting."
      );

      return;
    }

    if (
      !/^\d{6}$/.test(
        formData.pincode
      )
    ) {
      alert(
        "Please enter a valid 6-digit PIN code."
      );

      return;
    }

    /*
     * AI automatically runs during submission
     * if the user did not manually analyze.
     */

    const finalAIResult =
      aiResult ||
      analyzeComplaint({
        title:
          formData.title.trim(),

        description:
          formData.description.trim(),
      });

    const existingComplaints =
      getAllComplaints();

    const possibleDuplicates =
      duplicateWarnings.length > 0
        ? duplicateWarnings
        : findPossibleDuplicates(
            {
              title:
                formData.title.trim(),

              description:
                formData.description.trim(),
            },
            existingComplaints
          );

    const complaint =
      createComplaint({
        citizenId:
          user?.id || null,

        citizenName:
          user?.fullName || "",

        citizenEmail:
          user?.email || "",

        citizenPhone:
          user?.phone || "",

        category:
          formData.category ||
          finalAIResult.category,

        title:
          formData.title.trim(),

        description:
          formData.description.trim(),

        /*
         * Complete address is intentionally
         * not collected anymore.
         */

        address: "",

        landmark:
          formData.landmark.trim(),

        locality:
          formData.locality.trim(),

        ward:
          formData.ward.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        pincode:
          formData.pincode.trim(),

        department:
          finalAIResult.department,

        priority:
          finalAIResult.priority,

        aiCategory:
          finalAIResult.category,

        aiSummary:
          finalAIResult.summary,

        aiConfidence:
          finalAIResult.confidence,

        duplicateOf:
          possibleDuplicates[0]
            ?.referenceId ||
          null,

        status:
          "Submitted",

        attachments:
          selectedFile
            ? [
                {
                  name:
                    selectedFile.name,

                  type:
                    selectedFile.type,

                  size:
                    selectedFile.size,
                },
              ]
            : [],

        latitude:
          coordinates.latitude,

        longitude:
          coordinates.longitude,

        locationAccuracy:
          coordinates.accuracy,
      });

    setAiResult(
      finalAIResult
    );

    setDuplicateWarnings(
      possibleDuplicates
    );

    setGrievanceId(
      complaint.referenceId
    );

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  };

  /*
   * --------------------------------------------------
   * PRINT
   * --------------------------------------------------
   */

  const printReceipt = () => {
    window.print();
  };

  /*
   * --------------------------------------------------
   * RESET
   * --------------------------------------------------
   */

  const resetForm = () => {
    setSubmitted(false);
    setGrievanceId("");
    setCopied(false);
    setSelectedFile(null);

    setPinError("");
    setPinSuccess("");

    setLocationError("");
    setLocationSuccess("");

    setLocationLoading(false);

    setCoordinates({
      latitude: null,
      longitude: null,
      accuracy: null,
    });

    setAiResult(null);
    setAnalyzing(false);
    setDuplicateWarnings([]);

    setFormData({
      category: "",
      title: "",
      description: "",
      landmark: "",
      locality: "",
      ward: "",
      city: "",
      state: "",
      pincode: "",
    });

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  };

  /*
   * ==================================================
   * SUCCESS RECEIPT
   * ==================================================
   */

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-slate-100">
        <div className="h-1 bg-[#F28C28] print:hidden" />

        <header className="border-b border-slate-200 bg-white dark:border-[#262626] dark:bg-[#0A0A0A] print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-white dark:bg-[#111111]">
                <ShieldCheck size={20} />
              </div>

              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-extrabold text-[#0B1F3A] dark:text-white">
                    Civic
                  </span>

                  <span className="text-lg font-extrabold text-[#D97706]">
                    AI
                  </span>
                </div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Citizen Service Portal
                </p>
              </div>
            </Link>

            <Link
              to="/"
              className="text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A] dark:text-slate-400 dark:hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 py-10 md:py-12">
          <div className="text-center print:hidden">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#15803D] dark:bg-green-950/30">
              <CheckCircle2 size={34} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#15803D]">
              Submission Successful
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white">
              Grievance Registered
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your grievance has been successfully
              recorded. Keep the reference number
              for future tracking.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-[#262626] dark:bg-[#0A0A0A]">
            <div className="border-b border-slate-200 px-6 py-5 dark:border-[#262626]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97706]">
                    CivicAI
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#0B1F3A] dark:text-white">
                    Grievance Acknowledgement
                  </h2>
                </div>

                <div className="rounded-xl bg-green-50 px-4 py-3 text-center dark:bg-green-950/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#15803D]">
                    Submitted
                  </p>
                </div>
              </div>
            </div>

            {/* REFERENCE */}
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-[#262626] dark:bg-[#111111]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Reference Number
                  </p>

                  <p className="mt-1 text-xl font-extrabold tracking-wider text-[#0B1F3A] dark:text-white">
                    {grievanceId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    copyGrievanceId
                  }
                  className={`print:hidden flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${
                    copied
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
                      : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-[#D97706] dark:border-[#262626] dark:bg-[#0A0A0A] dark:text-slate-300 dark:hover:border-[#F28C28] dark:hover:text-[#F28C28]"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2
                        size={15}
                      />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* COMPLAINT + LOCATION */}
            <div className="grid md:grid-cols-2">
              <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r dark:border-[#262626]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#0B1F3A] dark:bg-[#151515] dark:text-slate-200">
                    <FileText size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                      Complaint Details
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Submitted information
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#0B1F3A] dark:text-slate-200">
                      {formData.category ||
                        aiResult?.category ||
                        "Other"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Complaint Title
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-5 text-[#0B1F3A] dark:text-slate-200">
                      {formData.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {formData.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#D97706] dark:bg-orange-950/30">
                    <MapPinned size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                      Incident Location
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Reported problem location
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.landmark && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Landmark
                      </p>

                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {formData.landmark}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Locality / Area
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#0B1F3A] dark:text-slate-200">
                      {formData.locality}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ward / Zone
                      </p>

                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {formData.ward ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        PIN Code
                      </p>

                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {formData.pincode}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      City / District
                    </p>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {formData.city}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      State / UT
                    </p>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {formData.state}
                    </p>
                  </div>

                  {coordinates.latitude !==
                    null &&
                    coordinates.longitude !==
                      null && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-950/20">
                        <div className="flex items-center gap-2">
                          <LocateFixed
                            size={15}
                            className="text-green-600 dark:text-green-400"
                          />

                          <p className="text-xs font-bold text-green-700 dark:text-green-400">
                            GPS location captured
                          </p>
                        </div>

                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          {coordinates.latitude.toFixed(
                            6
                          )}
                          ,{" "}
                          {coordinates.longitude.toFixed(
                            6
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* AI RESULT */}
            {aiResult && (
              <div className="border-t border-orange-200 bg-orange-50/70 p-6 dark:border-orange-900/40 dark:bg-orange-950/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#D97706] dark:bg-[#0D0D0D]">
                    <BrainCircuit size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                      AI-Assisted Processing
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      CivicAI analyzed the grievance
                      and generated the following
                      processing signals.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Category
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#0B1F3A] dark:text-white">
                          {aiResult.category}
                        </p>
                      </div>

                      <div className="rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Department
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#0B1F3A] dark:text-white">
                          {aiResult.department}
                        </p>
                      </div>

                      <div className="rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Priority
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#D97706] dark:text-[#F28C28]">
                          {aiResult.priority}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Confidence
                        </p>

                        <span className="text-xs font-bold text-green-700 dark:text-green-400">
                          {Math.round(
                            aiResult.confidence *
                              100
                          )}
                          %
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#15803D]"
                          style={{
                            width: `${Math.round(
                              aiResult.confidence *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Summary
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        {aiResult.summary}
                      </p>
                    </div>

                    {duplicateWarnings.length >
                      0 && (
                      <div className="mt-3 rounded-lg border border-orange-300 bg-orange-100/70 p-3 dark:border-orange-900/50 dark:bg-orange-950/30">
                        <p className="text-xs font-bold text-[#B45309] dark:text-[#F28C28]">
                          Possible Similar Grievance
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                          Existing case{" "}
                          <strong>
                            {
                              duplicateWarnings[0]
                                .referenceId
                            }
                          </strong>{" "}
                          has approximately{" "}
                          <strong>
                            {
                              duplicateWarnings[0]
                                .similarity
                            }
                            %
                          </strong>{" "}
                          text similarity.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 px-6 py-4 dark:border-[#262626]">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck
                  size={14}
                  className="text-[#15803D]"
                />

                Keep this acknowledgement for
                future reference.
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3 print:hidden">
            <button
              type="button"
              onClick={printReceipt}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#D97706] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B45309]"
            >
              <Printer size={17} />
              Print Receipt
            </button>

            <Link
              to={`/track-complaint?reference=${encodeURIComponent(
                grievanceId
              )}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#D97706] hover:bg-orange-50 dark:border-[#262626] dark:bg-[#0A0A0A] dark:text-slate-200"
            >
              Track Complaint
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12355B]"
            >
              Submit Another
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==================================================
   * REPORT FORM
   * ==================================================
   */

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-slate-100">
      <div className="h-1 bg-[#F28C28]" />

      <header className="border-b border-slate-200 bg-white dark:border-[#262626] dark:bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-white dark:bg-[#111111]">
              <FileText size={21} />
            </div>

            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-extrabold text-[#0B1F3A] dark:text-white">
                  Civic
                </span>

                <span className="text-lg font-extrabold text-[#D97706]">
                  AI
                </span>
              </div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Citizen Service Portal
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (
                window.history.length >
                1
              ) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A] dark:text-slate-400 dark:hover:text-white"
          >
            Back
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
            Citizen Service
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white md:text-4xl">
            Report a Grievance
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
            Tell us about a civic problem in your
            area. CivicAI will analyze the complaint,
            identify the responsible department and
            help prioritize the grievance.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A] md:p-8"
        >
          {/* CATEGORY */}
          <div>
            <label
              htmlFor="category"
              className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
            >
              Grievance Category

              <span className="ml-2 text-xs font-normal text-slate-400">
                Optional — CivicAI can suggest
              </span>
            </label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
            >
              <option value="">
                Let CivicAI suggest
              </option>

              <option value="Road & Potholes">
                Road & Potholes
              </option>

              <option value="Garbage & Sanitation">
                Garbage & Sanitation
              </option>

              <option value="Streetlight">
                Streetlight
              </option>

              <option value="Water Supply">
                Water Supply
              </option>

              <option value="Drainage">
                Drainage
              </option>

              <option value="Traffic & Transport">
                Traffic & Transport
              </option>

              <option value="Public Safety">
                Public Safety
              </option>

              <option value="Public Health">
                Public Health
              </option>

              <option value="Environment">
                Environment
              </option>

              <option value="Public Infrastructure">
                Public Infrastructure
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* TITLE */}
          <div className="mt-6">
            <label
              htmlFor="title"
              className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
            >
              Complaint Title
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Example: Large pothole near main road"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
            >
              Describe the Problem
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <textarea
              id="description"
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue, how long it has existed, its impact, and any other useful information..."
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
            />

            {/* AI BUTTON */}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">
                CivicAI can analyze your complaint
                before submission.
              </p>

              <button
                type="button"
                onClick={
                  runAIAnalysis
                }
                disabled={analyzing}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D97706] px-4 py-2.5 text-xs font-bold text-[#D97706] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#F28C28] dark:text-[#F28C28] dark:hover:bg-orange-950/20"
              >
                {analyzing ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Analyze Complaint
                  </>
                )}
              </button>
            </div>

            {/* AI RESULT */}
            {aiResult && (
              <div className="mt-5 overflow-hidden rounded-xl border border-orange-200 bg-orange-50/70 dark:border-orange-900/40 dark:bg-orange-950/10">
                <div className="p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#D97706] shadow-sm dark:bg-[#0D0D0D]">
                      <BrainCircuit size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                          AI Assessment
                        </p>

                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                          {Math.round(
                            aiResult.confidence *
                              100
                          )}
                          % confidence
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Classification
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#0B1F3A] dark:text-white">
                            {aiResult.category}
                          </p>
                        </div>

                        <div className="rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Department
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#0B1F3A] dark:text-white">
                            {aiResult.department}
                          </p>
                        </div>

                        <div className="rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Priority
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#D97706] dark:text-[#F28C28]">
                            {aiResult.priority}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-[#0D0D0D]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          AI Summary
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                          {aiResult.summary}
                        </p>
                      </div>

                      {aiResult.keywords?.length >
                        0 && (
                        <div className="mt-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Detected Signals
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {aiResult.keywords.map(
                              (keyword) => (
                                <span
                                  key={
                                    keyword
                                  }
                                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-[#111111] dark:text-slate-400"
                                >
                                  {keyword}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {duplicateWarnings.length >
                        0 && (
                        <div className="mt-4 rounded-lg border border-orange-300 bg-orange-100/70 p-3 dark:border-orange-900/50 dark:bg-orange-950/30">
                          <p className="text-xs font-bold text-[#B45309] dark:text-[#F28C28]">
                            Possible similar grievance detected
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                            Existing case{" "}
                            <strong>
                              {
                                duplicateWarnings[0]
                                  .referenceId
                              }
                            </strong>{" "}
                            has approximately{" "}
                            <strong>
                              {
                                duplicateWarnings[0]
                                  .similarity
                              }
                              %
                            </strong>{" "}
                            text similarity.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LOCATION */}
          <div className="mt-9 border-t border-slate-200 pt-7 dark:border-[#262626]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#D97706] dark:bg-orange-950/30">
                <MapPinned size={19} />
              </div>

              <div>
                <h2 className="font-bold text-[#0B1F3A] dark:text-white">
                  Incident Location
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the area details or use your
                  current location.
                </p>
              </div>
            </div>
          </div>

          {/* USE LOCATION */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#262626] dark:bg-[#111111]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#0B1F3A] shadow-sm dark:bg-[#0A0A0A] dark:text-white">
                  <LocateFixed size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                    Use My Location
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Capture your current GPS coordinates
                    for more accurate grievance location.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  useCurrentLocation
                }
                disabled={
                  locationLoading
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#12355B] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#F28C28] dark:text-black dark:hover:bg-[#FB923C]"
              >
                {locationLoading ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                    Locating...
                  </>
                ) : (
                  <>
                    <Navigation size={15} />
                    Use My Location
                  </>
                )}
              </button>
            </div>

            {locationSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2
                  size={15}
                />
                {locationSuccess}
              </div>
            )}

            {locationError && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0"
                />
                {locationError}
              </div>
            )}

            {coordinates.latitude !==
              null &&
              coordinates.longitude !==
                null && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#262626] dark:bg-[#0A0A0A]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Latitude
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#0B1F3A] dark:text-white">
                      {coordinates.latitude.toFixed(
                        6
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#262626] dark:bg-[#0A0A0A]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Longitude
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#0B1F3A] dark:text-white">
                      {coordinates.longitude.toFixed(
                        6
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#262626] dark:bg-[#0A0A0A]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Accuracy
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#0B1F3A] dark:text-white">
                      ±
                      {Math.round(
                        coordinates.accuracy
                      )}
                      m
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* LANDMARK + LOCALITY */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="landmark"
                className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
              >
                Nearby Landmark
              </label>

              <div className="relative mt-2">
                <Navigation
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="landmark"
                  name="landmark"
                  type="text"
                  value={
                    formData.landmark
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Near school, market, hospital..."
                  className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="locality"
                className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
              >
                Locality / Area
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative mt-2">
                <MapPinned
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="locality"
                  name="locality"
                  type="text"
                  value={
                    formData.locality
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Gomti Nagar"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* WARD + PIN */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="ward"
                className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
              >
                Ward / Zone
              </label>

              <div className="relative mt-2">
                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="ward"
                  name="ward"
                  type="text"
                  value={formData.ward}
                  onChange={
                    handleChange
                  }
                  placeholder="Ward number or zone"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="pincode"
                className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
              >
                PIN Code
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative mt-2">
                <Hash
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={
                    formData.pincode
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          6
                        );

                    setFormData(
                      (previous) => ({
                        ...previous,
                        pincode:
                          value,
                      })
                    );

                    setPinError("");
                    setPinSuccess("");
                  }}
                  onKeyDown={
                    handlePincodeKeyDown
                  }
                  placeholder="Enter 6-digit PIN"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-24 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
                />

                <button
                  type="button"
                  onClick={
                    lookupPincode
                  }
                  disabled={
                    pinLoading ||
                    formData.pincode
                      .length !== 6
                  }
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-[#0B1F3A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#12355B] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#111111]"
                >
                  {pinLoading ? (
                    <>
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                      />
                      Finding
                    </>
                  ) : (
                    "Find"
                  )}
                </button>
              </div>

              {pinError && (
                <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                  {pinError}
                </p>
              )}

              {pinSuccess && (
                <p className="mt-2 text-xs font-medium text-[#15803D] dark:text-green-400">
                  ✓ {pinSuccess}
                </p>
              )}
            </div>
          </div>

          {/* CITY + STATE */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
              >
                City / District
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={
                  handleChange
                }
                placeholder="Auto-filled from PIN"
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200"
              >
                State / Union Territory
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={
                  handleChange
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#D97706] focus:ring-2 focus:ring-orange-100 dark:border-[#262626] dark:bg-[#111111] dark:text-slate-200"
              >
                <option value="">
                  Select State / UT
                </option>

                {ALL_LOCATIONS.map(
                  (location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* MAP INFORMATION */}
          {coordinates.latitude !==
            null &&
            coordinates.longitude !==
              null && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
                <Map
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                />

                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">
                    Location ready
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Your GPS coordinates will be
                    attached to this grievance. The
                    authority dashboard can later use
                    these coordinates for map-based
                    case management.
                  </p>
                </div>
              </div>
            )}

          {/* EVIDENCE */}
          <div className="mt-9 border-t border-slate-200 pt-7 dark:border-[#262626]">
            <label className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-200">
              Supporting Evidence
            </label>

            <label
              htmlFor="evidence"
              className="mt-2 block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-orange-300 hover:bg-orange-50/50 dark:border-[#262626] dark:bg-[#111111]"
            >
              <Upload
                size={28}
                className="mx-auto text-[#D97706]"
              />

              <p className="mt-3 text-sm font-semibold text-[#0B1F3A] dark:text-white">
                Upload an image or document
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG or PDF • Maximum 5 MB
              </p>

              <input
                id="evidence"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={
                  handleFileChange
                }
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#262626] dark:bg-[#111111]">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText
                    size={18}
                    className="shrink-0 text-[#0B1F3A] dark:text-slate-200"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                      {selectedFile.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    removeFile
                  }
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-red-600 dark:hover:bg-[#1A1A1A]"
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </div>

          {/* AI INFO */}
          <div className="mt-7 overflow-hidden rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20">
            <div className="flex gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#D97706] shadow-sm dark:bg-[#0D0D0D]">
                <Sparkles size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                  AI-Assisted Grievance Analysis
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  CivicAI analyzes the complaint,
                  identifies its category, detects priority
                  signals, recommends the relevant department
                  and checks for potentially similar grievances.
                </p>
              </div>
            </div>

            <div className="grid border-t border-orange-200 dark:border-orange-900/40 sm:grid-cols-3">
              <div className="border-orange-200 px-4 py-3 text-center sm:border-r dark:border-orange-900/40">
                <p className="text-xs font-semibold text-[#0B1F3A] dark:text-white">
                  Classification
                </p>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Identify issue type
                </p>
              </div>

              <div className="border-orange-200 px-4 py-3 text-center sm:border-r dark:border-orange-900/40">
                <p className="text-xs font-semibold text-[#0B1F3A] dark:text-white">
                  Smart Routing
                </p>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Suggest department
                </p>
              </div>

              <div className="px-4 py-3 text-center">
                <p className="text-xs font-semibold text-[#0B1F3A] dark:text-white">
                  Priority
                </p>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Detect urgency
                </p>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-6 py-3.5 font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#12355B] hover:shadow-lg dark:bg-[#F28C28] dark:text-black dark:hover:bg-[#FB923C]"
          >
            <Send size={18} />
            Submit Grievance
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <AlertCircle size={14} />

            A unique grievance reference number will
            be generated after submission.
          </div>
        </form>
      </div>
    </main>
  );
}

export default ReportGrievance;
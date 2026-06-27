import React, { useContext, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  User,
  Sparkles,
} from "lucide-react";
import { AppContext } from "../contexts/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const STEPS = {
  PHONE: 0,
  NAME: 1,
  WELCOME: 2,
};

export default function Signinv2() {
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const persistSession = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Go back to previous step
  const handleGoBack = () => {
    setError("");
    if (step === STEPS.NAME) {
      setStep(STEPS.PHONE);
    } else if (step === STEPS.WELCOME) {
      // If returning user, go back to phone. If new user, go back to name
      if (isReturningUser) {
        setStep(STEPS.PHONE);
      } else {
        setStep(STEPS.NAME);
      }
    }
  };

  // STEP 1: Check phone → if exists, sign in and go to WELCOME
  //                      → if not, go to NAME step
  const handlePhoneNext = async (e) => {
    e.preventDefault();
    setError("");

    if (phone.length < 9 || phone.length > 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const checkResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-phone`,
        { phone },
      );

      if (checkResponse.data.exists) {
        // Existing user → sign in directly
        const signinResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`,
          { phone },
        );
        const { user, token } = signinResponse.data;
        persistSession(user, token);
        setDisplayName(user.name);
        setIsReturningUser(true);
        setStep(STEPS.WELCOME);
      } else {
        // New user → collect name first
        setStep(STEPS.NAME);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Register new user with name + phone → go to WELCOME
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      // Single call: signup creates the user and returns token
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`,
        { phone, name: name.trim() },
      );
      const { user, token } = response.data;
      persistSession(user, token);
      setDisplayName(user.name);
      setIsReturningUser(false);
      setStep(STEPS.WELCOME);
    } catch {
      setError("Unable to complete signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const redirect = searchParams.get("redirect");
    navigate(redirect && redirect.startsWith("/") ? redirect : "/");
  };

  // Progress bar: for returning users skip NAME dot (jump straight to WELCOME=2)
  const activeProgress = step === STEPS.WELCOME && isReturningUser ? 2 : step;

  const stepLabels = ["Phone", "Name", "Welcome"];

  return (
    <div className="min-h-screen w-full flex flex-col bg-x-bg">
      {/* Back button + Progress bar */}
      <div className="px-8 pt-12 pb-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Progress bar */}
          <div className="flex items-center justify-center gap-2">
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i <= activeProgress
                        ? "w-10 bg-x-primary"
                        : "w-6 bg-x-border"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                      i <= activeProgress ? "text-x-text" : "text-x-border"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`h-px w-6 mb-4 transition-colors duration-500 ${
                      i < activeProgress ? "bg-x-text-secondary" : "bg-x-border"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Spacer to balance back button */}
          <div className="w-12"></div>
        </div>
      </div>

      {/* Sliding panels — overflow hidden only on the track wrapper */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto px">
        <div className="overflow-hidden w-full">
          <div
            className="flex w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${step * 100}%)` }}
          >
            {/* Step 0 — Phone */}
            <div className="min-w-full shrink-0 flex flex-col justify-center min-h-[420px] px-1">
              <div className="mb-10">
                {/* <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white mb-6">
                  <Phone size={24} strokeWidth={1.75} />
                </div> */}
                <h1 className="text-3xl font-bold text-x-text tracking-tight">
                  What's your number?
                </h1>
                <p className="text-x-text-secondary mt-2 text-[15px] leading-relaxed">
                  Enter your mobile number and tap Next to continue.
                </p>
              </div>

              <form onSubmit={handlePhoneNext} className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center px-4 py-3.5 rounded-full bg-x-bg-secondary text-x-text-secondary text-sm font-medium border border-x-border">
                    +977
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className="flex-1 px-5 py-3.5 rounded-full x-input"
                    autoFocus
                  />
                </div>

                {error && step === STEPS.PHONE && (
                  <p className="text-red-500 text-sm px-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full x-btn x-btn-primary x-btn-full py-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Next <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Step 1 — Name (new users only) */}
            <div className="min-w-full shrink-0 flex flex-col justify-center min-h-[420px] px-1">
              <div className="mb-10">
                {/* <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white mb-6">
                  <User size={24} strokeWidth={1.75} />
                </div> */}
                <h1 className="text-3xl font-bold text-x-text tracking-tight">
                  What should we call you?
                </h1>
                <p className="text-x-text-secondary mt-2 text-[15px] leading-relaxed">
                  Enter your name to get started.
                </p>
              </div>

              <form onSubmit={handleNameSubmit} className="space-y-5">
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full x-input"
                />

                {error && step === STEPS.NAME && (
                  <p className="text-red-500 text-sm px-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full x-btn x-btn-primary x-btn-full py-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Create account <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className={`mt-2 w-full x-btn x-btn-secondary py-4 ${
                  step === STEPS.PHONE
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <ArrowLeft size={16} strokeWidth={2} />
                Go Back
              </button>
            </div>

            {/* Step 2 — Welcome */}
            <div className="min-w-full shrink-0 flex flex-col justify-center min-h-[420px] px-1">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-6">
                  <Sparkles size={28} strokeWidth={1.75} />
                </div>
                <h1 className="text-3xl font-bold text-x-text tracking-tight">
                  {isReturningUser ? "Welcome back," : "Welcome,"}
                </h1>
                {displayName && (
                  <p className="text-2xl font-bold text-x-text mt-2">
                    {displayName}
                  </p>
                )}
                <p className="text-x-text-secondary mt-4 text-[15px] leading-relaxed max-w-xs mx-auto">
                  You're all set. Continue to explore and report civic issues in
                  your community.
                </p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full x-btn x-btn-primary x-btn-full py-4"
              >
                Continue to home
                <ArrowRight size={18} />
              </button>
              
            </div>
          </div>
        </div>
      </div>

      <div className="pb-10 pt-4 text-center">
        <p className="text-xs text-x-text-secondary tracking-wide">
          CivicReport · Report. Track. Improve.
        </p>
      </div>
    </div>
  );
}

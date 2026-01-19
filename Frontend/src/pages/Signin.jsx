import React, { useContext, useState, useEffect } from "react";
import { auth } from "../contexts/Firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from "axios";
import { ArrowRight, Loader2, X, Phone, ShieldCheck } from "lucide-react";
import { AppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

export default function PhoneAuth() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = popup ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [popup]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  };

  const sendOtp = async () => {
    try {
      if (phone.length < 9) {
        setPopup("Enter a valid phone number");
        return;
      }

      setLoading(true);
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+977${phone}`,
        appVerifier
      );

      setConfirmation(confirmationResult);
      setPopup("OTP sent successfully");
    } catch (err) {
      setPopup("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (otp.length < 6) {
        setPopup("Enter a valid OTP");
        return;
      }

      setLoading(true);
      const result = await confirmation.confirm(otp);
      const firebaseUser = result.user;
      await firebaseUser.getIdToken();

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`,
        { phone }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      setIsAuthenticated(true);

      navigate(response.data.user.verified ? "/" : "/signup");
    } catch (err) {
      setPopup("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="w-full   ">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-3">
            {confirmation ? <ShieldCheck /> : <Phone />}
          </div>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">
            {confirmation
              ? "Enter the OTP sent to your phone"
              : "We will send an OTP to verify your number"}
          </p>
        </div>

        {!confirmation ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <input
                disabled
                value="+977"
                className="w-20 rounded-xl border px-3 py-2 text-sm bg-gray-100"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Continue <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyOtp();
            }}
            className="space-y-4"
          >
            <input
              type="number"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />

            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Verify OTP <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div id="recaptcha-container" />
      </div>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setPopup(null)}
          />
          <div className="relative bg-white rounded-xl shadow-lg p-5 w-80 text-center animate-fadeIn">
            <button
              onClick={() => setPopup(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
            <p className="text-gray-800 text-sm">{popup}</p>
          </div>
        </div>
      )}
    </div>
  );
}
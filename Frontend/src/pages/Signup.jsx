import React, { useContext, useState } from "react";

import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react";
import { AppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
const PhoneAuth = () => {
  const [loading, setLoading] = useState(false);
  const { user, setUser, setIsAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        { name: user?.name, phone: user?.phone_number }
      );
      if (response.status === 200 && response.data.user.verified) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);
        navigate("/");
      } else {
      }
    } catch (error) {
      console.error(error);
      // alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-sm  ">
        <span className="flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold text-center ">
            Enter your details
          </h2>
          {/* <p></p> */}
          <p className="text-gray-500 text-sm mb-2">
            We will use this information to create your account
          </p>
        </span>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex  gap-2">
            <input
              type="text"
              placeholder="Enter your name"
              value={user?.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="
            w-full
            px-4
            py-3
            mb-4
            border
            border-gray-300
            rounded-xl
            text-sm
            outline-none
            focus:border-black
            hover:border-black
            transition
          "
            />
          </div>
          {loading ? (
            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-2xl font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              <Loader2 className="animate-spin" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-2xl font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PhoneAuth;

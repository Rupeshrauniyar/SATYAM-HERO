import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { AppContext } from "../contexts/AppContext";

const Signup = () => {
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://messageadministrative.onrender.com/api/signup",
        formData
      );

      if (response.data.success) {
        const { token, user } = response.data;

        // save token & user
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // update context
        setUser(user);
        setIsAuthenticated(true);

        toast.success("Account created successfully");
        if (user.role === "admin") {
          navigate("/admin");
        }
        navigate("/");
      } else {
        toast.error(response.data.error || "Signup failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <ToastContainer />

      <form
        onSubmit={handleSubmit}
        className="w-96 p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white text-center">
          Create Account
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/90 outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/90 outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/90 outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <span className="flex gap-1 text-gray-200">
          <p>Already have an account?</p>
          <Link
            to="/signin"
            className="text-blue-400"
          >
            Signin
          </Link>
        </span>
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/40 active:scale-95 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;

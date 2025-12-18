import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { AppContext } from "../contexts/AppContext";

const Signin = () => {
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
        "https://messageadministrative.onrender.com/api/signin",
        formData
      );

      if (response.data.success) {
        const { token, user } = response.data;

        // save token
        localStorage.setItem("token", token);
        localStorage.setItem("user", user);
        // update context
        setUser(user);
        setIsAuthenticated(true);

        toast.success("Login successful");
        if (user.role === "admin") {
          navigate("/admin");
        }
        navigate("/");
      } else {
        toast.error(response.data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Invalid email or password");
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
          Sign In
        </h2>

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
          <p>Dont have an account?</p>
          <Link
            to="/signup"
            className="text-blue-400"
          >
            Signup
          </Link>
        </span>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/40 active:scale-95 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Signin;

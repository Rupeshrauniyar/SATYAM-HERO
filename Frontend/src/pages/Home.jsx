import React, { useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
const Home = () => {
  const [message, setMessage] = useState("");
  const { user } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/api/send", {
        message: message,
        userId: user._id,
      });
      if (response.status === 200 && response.data.success) {
        setLoading(false);
        toast.success("Message sent");
        setMessage("")
      } else {
        setLoading(false);

        toast.error("Unable to send message");
      }
    } catch (error) {
      setLoading(false);

      toast.error("Unable to send message");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ToastContainer />
      <div className="flex gap-3 p-5 rounded-2xl bg-white/10 backdrop-blur-lg shadow-2xl">
        <input
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          placeholder="Type your message..."
          className="w-64 px-4 py-3 rounded-xl text-sm outline-none bg-white/90 focus:ring-2 focus:ring-cyan-400 transition"
        />
        {loading ? (
          <>
            <button className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/40 active:scale-95 transition">
              ...
            </button>
          </>
        ) : (
          <button
            className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/40 active:scale-95 transition"
            onClick={handleSend}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;

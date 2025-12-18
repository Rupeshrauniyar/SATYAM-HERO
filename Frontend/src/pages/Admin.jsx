import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          "https://messageadministrative.onrender.com/api/messages"
        );
        setMessages(res.data.messages);
      } catch (err) {
        setError("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading messages...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mt-16 p-2">
      <h1 className="text-3xl font-bold mb-6 text-gray-200">Messages</h1>
      {messages.length === 0 ? (
        <p className="text-gray-300">No messages found.</p>
      ) : (
        <ul className="space-y-4 max-w-3xl mx-auto">
          {messages.slice().reverse().map((msg) => (
            <li
              key={msg._id || msg.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-900">
                  {msg.userId.name || "Anonymous"}
                </p>
                <span className="text-sm text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {msg.text || msg.message || "No content"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Admin;

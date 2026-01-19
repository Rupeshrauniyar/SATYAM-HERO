import React, { useState, useEffect } from "react";
import axios from "axios";

const GovSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // for confirmation

  const token = localStorage.getItem("token");

  // Debounced search
  useEffect(() => {
    if (!searchTerm) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/gov/user?name=${searchTerm}`,
        { token },
      );
      if (response.status === 200) setUsers(response.data.users);
    } catch (err) {
      console.error(err);
      alert("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
  };

  const confirmRoleChange = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/gov/user/update`,
        { role: "gov", update: selectedUser._id, token },
      );
      // Update UI immediately
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, role: "gov" } : u,
        ),
      );
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  const cancelRoleChange = () => setSelectedUser(null);

  return (
    <div className="min-h-screen  flex flex-col gap-6">
      {/* Header */}
      {selectedUser && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 text-center shadow-lg animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-black">
              Confirm Role Change
            </h3>
            <p className="mb-6 text-zinc-700">
              Are you sure you want to change{" "}
              <span className="font-semibold">{selectedUser.name}</span>’s role
              to <span className="font-semibold">Gov</span>?
            </p>
            <div className="flex justify-around gap-4">
              <button
                onClick={cancelRoleChange}
                className="px-4 py-2 bg-zinc-300 rounded-md hover:bg-zinc-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-900 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-3xl font-bold text-black">Search Users</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Find users and promote them to government role
        </p>
      </div>

      {/* Search bar */}
      <div className="w-full max-w-xl shadow-md">
        <input
          type="text"
          placeholder="Enter user name"
          className="w-full p-3 rounded-md border border-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading / No results */}
      {loading && <p className="text-zinc-500 mt-2">Loading...</p>}
      {!loading && users.length === 0 && searchTerm && (
        <p className="text-zinc-500 mt-2">No users found.</p>
      )}

      {/* Users list */}
      <div className="w-full max-w-xl flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
          >
            <div>
              <p className="font-semibold text-black">{user.name}</p>
              <p className="text-sm text-zinc-500">Role: {user.role}</p>
            </div>
            {user.role === "user" && (
              <button
                onClick={() => handleRoleChange(user)}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-900 transition"
              >
                Promote to Gov
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
    </div>
  );
};

export default GovSearch;

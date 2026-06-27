import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Search as SearchIcon } from "lucide-react";

const GovSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!searchTerm) {
      setUsers([]);
      return;
    }
    const timer = setTimeout(() => searchUsers(), 500);
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
    } finally {
      setLoading(false);
    }
  };

  const confirmRoleChange = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/gov/user/update`,
        { role: "gov", update: selectedUser._id, token },
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, role: "gov" } : u,
        ),
      );
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="x-page-header">
        <h1>Search Users</h1>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-x-bg rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
            <h3 className="text-lg font-bold mb-2">Promote to Government?</h3>
            <p className="text-sm text-x-text-secondary mb-6">
              Change <strong>{selectedUser.name}</strong>&apos;s role to Government Official?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSelectedUser(null)} className="x-btn x-btn-secondary flex-1">Cancel</button>
              <button onClick={confirmRoleChange} className="x-btn x-btn-primary flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <p className="text-x-text-secondary text-sm mb-4">
          Find users and promote them to government role.
        </p>

        <div className="relative mb-4">
          <SearchIcon size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-x-text-secondary" />
          <input
            type="text"
            placeholder="Search by name..."
            className="x-input "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-x-accent" size={24} />
          </div>
        )}

        {!loading && users.length === 0 && searchTerm && (
          <p className="text-x-text-secondary text-sm text-center py-8">No users found.</p>
        )}

        <div className="divide-y divide-x-border">
          {users.map((user) => (
            <div key={user._id} className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="x-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-xs text-x-text-secondary capitalize">{user.role}</p>
                </div>
              </div>
              {user.role === "user" && (
                <button onClick={() => setSelectedUser(user)} className="x-btn x-btn-primary x-btn-sm">
                  Promote
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovSearch;

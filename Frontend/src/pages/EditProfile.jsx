import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import Avatar from "../components/Avatar";
import { ImagePlus, Loader2, ArrowLeft } from "lucide-react";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "CivicReportUnsignedSecurePreset");
  formData.append("folder", "profile_pics");

  const response = await fetch("https://api.cloudinary.com/v1_1/dpr75yj54/image/upload", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  return result.secure_url;
};

export default function EditProfile() {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setProfilePicture(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      let pictureUrl = user?.profilePicture || "";
      if (file) {
        pictureUrl = await uploadToCloudinary(file);
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/update`,
        { name: name.trim(), profilePicture: pictureUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200 && response.data.success) {
        setUser(response.data.user);
        navigate("/profile");
      } else {
        setError("Unable to update profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-6">
      <div className="x-page-header flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="x-btn x-btn-ghost">
          <ArrowLeft size={18} />
        </button>
        <h1>Edit Profile</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="x-panel p-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar src={profilePicture} label={name || user?.name || "User"} className="x-avatar x-avatar-2xl w-28 h-28" />
            <label className="x-btn x-btn-secondary cursor-pointer">
              <ImagePlus size={16} /> Upload photo
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-sm text-x-text-secondary">Use a clear profile picture to personalize your account.</p>
          </div>
        </div>

        <div className="x-panel p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="x-input mt-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Phone number</label>
            <input value={user?.phone_number || ""} disabled className="x-input mt-2 bg-x-bg-secondary" />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-2xl">{error}</div>}

        <button onClick={handleSave} className="x-btn x-btn-primary x-btn-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

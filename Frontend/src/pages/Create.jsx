import React, { useContext, useState } from "react";
import axios from "axios";
import { ImagePlus, X, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";

export default function CreateIssue() {
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ward: "",
    category: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5)); // max 5 images
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.ward || !formData.category) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const uploadedUrls = [];

      for (const img of images) {
        const compressed = await imageCompression(img, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const imgData = new FormData();
        imgData.append("file", compressed);
        imgData.append("upload_preset", "CivicReportUnsignedSecurePreset");
        imgData.append("folder", "reports");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dpr75yj54/image/upload",
          { method: "POST", body: imgData },
        );

        const data = await res.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/create`,
        { formData, token, media: uploadedUrls },
      );

      if (response.status === 200) {
        setUser((prev) => ({
          ...prev,
          reports: [...prev.reports, response.data.newReport._id],
        }));
        navigate("/");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  ">
      <h2 className="text-2xl font-bold mb-1">Report an Issue</h2>
      <p className="text-sm text-gray-500 mb-6">
        Help authorities by reporting problems in your area.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Short summary of the issue"
            className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the issue in detail"
            className="mt-1 w-full rounded-xl border px-3 py-2 resize-none focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Ward *</label>
            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            >
              <option value="">Select</option>
              <option>Road</option>
              <option>Water</option>
              <option>Electricity</option>
              <option>Waste</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Images (max 5)</label>
          <label className="mt-2 flex items-center gap-2 text-sm cursor-pointer text-gray-600">
            <ImagePlus size={18} /> Add images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          {loading ? "Reporting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

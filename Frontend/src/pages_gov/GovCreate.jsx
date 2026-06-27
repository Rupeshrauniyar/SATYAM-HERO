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
    setImages((prev) => [...prev, ...files].slice(0, 5));
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="x-page-header">
        <h1>Create an Update</h1>
      </div>

      <div className="p-4">
        <p className="text-x-text-secondary text-sm mb-6">
          Help by updating the public.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-x-text">Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Short summary of the issue"
              className="x-input mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-x-text">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue in detail"
              className="x-textarea mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-x-text">Ward *</label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="x-select mt-1.5"
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                  <option key={w} value={w}>
                    Ward {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-x-text">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="x-select mt-1.5"
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
            <label className="text-sm font-bold text-x-text">Images (max 5)</label>
            <label className="mt-2 flex items-center gap-2 text-sm cursor-pointer text-x-accent font-semibold hover:underline">
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
                      className="w-20 h-20 rounded-2xl object-cover border border-x-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1.5 -right-1.5 bg-x-primary text-white rounded-full p-1"
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
            className="x-btn x-btn-primary x-btn-full py-3"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

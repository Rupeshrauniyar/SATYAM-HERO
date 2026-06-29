import React, { useContext, useState } from "react";
import axios from "axios";
import { ImagePlus, X, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";

export default function CreateIssue() {
  const { user, setUser, resolvedTheme } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ward: "",
    category: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");
  const [duplicateReport, setDuplicateReport] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);

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
      const token = localStorage.getItem("token");

      const previewResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/check-duplicate`,
        { formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (previewResponse.status === 200 && previewResponse.data.duplicate) {
        setPendingPayload({ formData: { ...formData }, media: images });
        setDuplicateReport(previewResponse.data.duplicateReport);
        return;
      }

      await submitReport({ formData, images, token });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (selectedImages) => {
    const uploadedUrls = [];

    for (const img of selectedImages) {
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

    return uploadedUrls;
  };

  const submitReport = async ({ formData, images, token, forceCreate = false }) => {
    try {
      setLoading(true);
      const uploadedUrls = await uploadImages(images);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/create`,
        { formData, media: uploadedUrls, forceCreate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200 && response.data.newReport) {
        setUser((prev) => ({
          ...prev,
          reports: [...(prev.reports || []), response.data.newReport._id],
        }));
        navigate("/");
      } else if (response.status === 200 && response.data.duplicate) {
        setPendingPayload({ formData: { ...formData }, media: images });
        setDuplicateReport(response.data.duplicateReport);
      } else {
        setError("Could not create report. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnyway = async () => {
    if (!pendingPayload) return;
    setModalLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await submitReport({ formData: pendingPayload.formData, images: pendingPayload.media, token, forceCreate: true });
      setDuplicateReport(null);
      setPendingPayload(null);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEndorseReport = async () => {
    if (!duplicateReport) return;
    setModalLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
        {
          reportId: duplicateReport._id,
          method: "push",
          resourceType: "report",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        if (response.data.user) {
          setUser((prev) => ({ ...(prev || {}), ...response.data.user }));
        }
        navigate("/");
      } else {
        setError("Could not endorse this report. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not endorse this report. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const isDarkMode = resolvedTheme === "dark";
  const isDuplicateMine = duplicateReport?.user?._id?.toString() === user?._id?.toString();

  return (
    <div>
      <div className="x-page-header">
        <h1>Report an Issue</h1>
      </div>

      <div className="p-4">
        <p className="text-x-text-secondary text-sm mb-6">
          Help authorities by reporting problems in your area.
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25].map((w) => (
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
                      className="absolute -top-1.5 -right-1.5 bg-x-primary text-x-text-on-primary rounded-full p-1"
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

      {duplicateReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDuplicateReport(null)}
          />
          <div className="relative w-full max-w-lg rounded-[1.75rem] border border-x-border bg-x-bg-elevated p-6 shadow-2xl shadow-black/20 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${resolvedTheme === "dark" ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
                <ImagePlus size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-x-text">
                  {isDuplicateMine ? "You already reported this issue" : "This issue already exists"}
                </h2>
                <p className="mt-1 text-sm text-x-text-secondary">
                  {isDuplicateMine
                    ? "A similar report was already created by you in this ward. Submit a new report only if this is a different issue."
                    : `A similar report was already filed for ward ${duplicateReport.ward_number}. You can endorse it or continue creating a new report.`}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-x-border bg-x-bg p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-x-text">{duplicateReport.title}</p>
                  <p className="mt-2 text-sm text-x-text-secondary line-clamp-3">{duplicateReport.description || "No description provided."}</p>
                </div>
                <span className="rounded-full bg-x-bg-secondary px-3 py-1 text-xs font-semibold text-x-text-secondary">
                  {new Date(duplicateReport.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-x-text-secondary">
                <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-3">
                  <p className="font-semibold text-x-text">{duplicateReport.upvotes || 0}</p>
                  <p>Upvotes</p>
                </div>
                <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-3">
                  <p className="font-semibold text-x-text">{duplicateReport.comments || 0}</p>
                  <p>Comments</p>
                </div>
                <div className="rounded-2xl border border-x-border bg-x-bg-secondary p-3">
                  <p className="font-semibold text-x-text">{duplicateReport.downvotes || 0}</p>
                  <p>Downvotes</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {!isDuplicateMine && (
                <button
                  type="button"
                  onClick={handleEndorseReport}
                  disabled={modalLoading}
                  className="x-btn x-btn-primary x-btn-full py-3"
                >
                  {modalLoading && <Loader2 className="animate-spin" size={16} />}
                  {modalLoading ? "Endorsing..." : "Endorse existing report"}
                </button>
              )}
              <button
                type="button"
                onClick={handleCreateAnyway}
                disabled={modalLoading}
                className="x-btn x-btn-secondary x-btn-full py-3"
              >
                {modalLoading && <Loader2 className="animate-spin" size={16} />}
                {modalLoading ? "Creating..." : "Create new report anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

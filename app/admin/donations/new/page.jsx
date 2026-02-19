"use client";
import { useState, useEffect } from "react";
import { graphqlRequest } from "@/lib/api"; 
import { Camera, Save, X, ImageIcon } from "lucide-react";

const GET_CATEGORIES_AUTH = `
  query { 
    getCategories { id title is_active } 
  }
`;

export default function AddDonationProgram() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // State for the preview
  const [formData, setFormData] = useState({
    categoryId: "",
    description: "",
    image: null,
    isComingSoon: false,
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await graphqlRequest(GET_CATEGORIES_AUTH);
        if (res?.getCategories) {
          setCategories(res.getCategories.filter((c) => c.is_active));
        }
      } catch (err) {
        console.error("Auth Category Fetch Error:", err);
      }
    };
    fetchCats();
  }, []);

  // Handle image change and create preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      // Create a temporary URL for the preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Clean up the object URL to avoid memory leaks
  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting Donation Program:", formData);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Donation Program
          </h2>
          <p className="text-gray-500 text-sm">
            The selected category title will be used as the heading.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Banner Image Upload & Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Banner Image
            </label>
            
            {!previewUrl ? (
              <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-12 transition-all hover:border-[#009cd6] hover:bg-blue-50/30 flex flex-col items-center">
                <Camera
                  className="text-gray-400 group-hover:text-[#009cd6] mb-2"
                  size={40}
                />
                <span className="text-sm text-gray-500 font-medium">
                  Click to upload banner (JPEG, PNG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    title="Remove Image"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm p-3 flex items-center gap-2">
                  <ImageIcon size={16} className="text-white" />
                  <span className="text-white text-xs font-medium truncate">
                    {formData.image?.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Program Category (Heading)
            </label>
            <select
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009cd6] focus:border-transparent outline-none transition-all"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="">Choose a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the impact of this program..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009cd6] outline-none transition-all"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#009cd6] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#0088bd] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? "Creating..." : "Publish Donation Program"}
          </button>
        </form>
      </div>
    </div>
  );
}
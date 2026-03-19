"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, X, Loader2, PlusCircle, 
  Power, ImageIcon, Camera, Save, AlertCircle, Trash2 
} from "lucide-react";
import Link from "next/link";
import { graphqlRequest } from "../../../../lib/api";

// --- GraphQL Queries & Mutations ---
const GET_CATEGORIES_AUTH = `query { getCategories { id title is_active } }`;

const GET_DONATIONS = `
  query { 
    donations { 
      id 
      description 
      image 
      is_active 
      category { 
        id 
        title 
        is_active 
      } 
    } 
  }
`;

const TOGGLE_DONATION_STATUS = `
  mutation UpdateDontationStatus($id: Int!, $active: Boolean!) { 
    updateDontationStatus(id: $id, is_active: $active) { 
      id 
      is_active 
    } 
  }
`;

const DELETE_DONATION_MUTATION = `
  mutation DeleteDonation($id: Int!) {
    deleteDonation(id: $id) {
      message
    }
  }
`;

const CREATE_DONATION_MUTATION = `
  mutation CreateDonation($categoryId: Int!, $description: String!, $file: Upload!) {
    createDonation(category_id: $categoryId, description: $description, File: $file) {
      id image is_active category { title }
    }
  }
`;

// --- Add Donation Modal Component ---
const AddDonationModal = ({ isOpen, onClose, onRefresh }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({ categoryId: "", description: "", image: null });

  useEffect(() => {
    if (isOpen) {
      const fetchCats = async () => {
        try {
          const res = await graphqlRequest(GET_CATEGORIES_AUTH);
          if (res?.getCategories) {
            setCategories(res.getCategories.filter((c) => c.is_active));
          }
        } catch (err) { console.error("Category Fetch Error:", err); }
      };
      fetchCats();
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload a banner image.");
    setLoading(true);

    try {
      const result = await graphqlRequest(CREATE_DONATION_MUTATION, {
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        file: formData.image,
      });

      if (result?.createDonation) {
        alert("Program added successfully!");
        setFormData({ categoryId: "", description: "", image: null });
        setPreviewUrl(null);
        onRefresh(); 
        onClose();   
      }
    } catch (err) {
      alert("Failed to add: " + err.message);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">New Donation Program</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image</label>
            {!previewUrl ? (
              <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-8 transition-all hover:border-[#009cd6] hover:bg-blue-50/30 flex flex-col items-center">
                <Camera className="text-gray-400 group-hover:text-[#009cd6] mb-2" size={32} />
                <span className="text-xs text-gray-500 font-medium">Upload JPEG/PNG</span>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                <button type="button" onClick={() => {setPreviewUrl(null); setFormData({...formData, image: null})}} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><X size={16} /></button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category (Heading)</label>
            <select required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#009cd6]" 
              value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
              <option value="">Choose a category...</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea required rows={3} placeholder="Describe the impact..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#009cd6]" 
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#009cd6] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#0088bd] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Publishing..." : "Publish Donation Program"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main List Component ---
export default function DonationProgram() {
  const [donations, setDonations] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDonations = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await graphqlRequest(GET_DONATIONS);
      if (response?.donations) setDonations(response.donations);
    } catch (err) { console.error("Fetch error:", err); }
    finally { setIsFetching(false); }
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await graphqlRequest(TOGGLE_DONATION_STATUS, { 
        id: parseInt(id), 
        active: !currentStatus 
      });
      if (res?.updateDontationStatus) fetchDonations();
    } catch (err) { alert("Status toggle failed: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this program? This action cannot be undone.")) return;
    
    try {
      const res = await graphqlRequest(DELETE_DONATION_MUTATION, { id: parseInt(id) });
      if (res?.deleteDonation) {
        alert("Program deleted successfully.");
        fetchDonations();
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AddDonationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchDonations} />

      <div className="mb-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[#009cd6] hover:text-[#0088bd] mb-4">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Donation Program Management</h2>
            <p className="text-gray-600">Activate or Pause Donation Programs appearing on the website</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#009cd6] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#0088bd] transition-all shadow-sm"
          >
            <PlusCircle size={20} /> Add New Program
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isFetching ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2 text-[#009cd6]" /> Loading...</td></tr>
            ) : donations.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No programs found.</td></tr>
            ) : (
              donations.map((item) => {
                const isParentInactive = item.category?.is_active === false;
                
                return (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${isParentInactive ? "bg-red-50/30" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{item.category.title}</div>
                      {isParentInactive && (
                        <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-wider mt-1">
                          <AlertCircle size={10} /> Hidden (Category Inactive)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 line-clamp-1">{item.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active && !isParentInactive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.is_active && !isParentInactive ? "Live" : isParentInactive ? "Forced Off" : "Paused"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(item.id, item.is_active)} 
                        className={`p-2 rounded-lg transition-all ${
                          item.is_active 
                          ? "text-green-600 bg-green-50 hover:bg-green-100" 
                          : "text-gray-400 bg-gray-50 hover:bg-gray-100"
                        }`}
                        title="Toggle Status"
                      >
                        <Power size={18} />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Program"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
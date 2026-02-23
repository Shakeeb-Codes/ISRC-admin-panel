"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, Save, X, Loader2, PlusCircle, 
  Edit2, Check, Power, Trash2 
} from "lucide-react";
import Link from "next/link";
import { graphqlRequest } from "../../../../lib/api";
import { title } from "process";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // State for Inline Editing
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // --- 1. Fetch All Categories ---
  const fetchCategories = useCallback(async () => {
    try {
      const query = `query { 
        getCategories { id title is_active } 
      }`;
      const response = await graphqlRequest(query);
      if (response?.getCategories) {
        setCategories(response.getCategories);
      }
      console.log(response)
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- 2. Create Category ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsLoading(true);
    const CREATE_MUTATION = `
      mutation CreateCategory($title: String!) {
        createCategory(title: $title) { id title }
      }
    `;

    try {
      const result = await graphqlRequest(CREATE_MUTATION, { title: newCategory });
      if (result?.createCategory) {
        setNewCategory("");
        await fetchCategories();
        alert(`"${result.createCategory.title}" added successfully!`);
      }
    } catch (err) {
      alert("Failed to add: " + err.message);
    } finally {
      setIsLoading(true);
      setIsLoading(false);
    }
  };

  // --- 3. Update Title (Inline Edit) ---
  const handleUpdateTitle = async (id) => {
    if (!editTitle.trim()) return setEditingId(null);

    const UPDATE_MUTATION = `
      mutation UpdateCategory($id: Int!, $title: String!) {
        updateCategory(id: $id, title: $title) { id title }
      }
    `;

    try {
      await graphqlRequest(UPDATE_MUTATION, { id: parseInt(id), title: editTitle });
      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  // --- 4. Toggle Status (Active/Inactive) ---
  const handleToggleStatus = async (id, currentStatus) => {
    const STATUS_MUTATION = `
      mutation ToggleStatus($id: Int!, $active: Boolean!) {
        updateCategoryStatus(id: $id, is_active: $active) { id is_active }
      }
    `;

    try {
      await graphqlRequest(STATUS_MUTATION, { 
        id: parseInt(id), 
        active: !currentStatus 
      });
      await fetchCategories();
    } catch (err) {
      alert("Status toggle failed: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[#009cd6] hover:text-[#0088bd] mb-4">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Category Management</h2>
        <p className="text-gray-600">Create, edit, and manage post categories</p>
      </div>

      {/* --- Add New Category Section --- */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">New Category Name</label>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009cd6] outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !newCategory.trim()}
            className="px-6 py-3 bg-[#009cd6] text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
            Add Category
          </button>
        </form>
      </div>

      {/* --- Categories List Table --- */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isFetching ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  <Loader2 className="animate-spin mx-auto mb-2" /> Loading Categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No categories found.</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="border-b-2 border-[#009cd6] outline-none px-1 py-1"
                        />
                        <button onClick={() => handleUpdateTitle(cat.id)} className="text-green-600"><Check size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="text-red-500"><X size={18} /></button>
                      </div>
                    ) : (
                      <span>{cat.title}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {cat.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => { setEditingId(cat.id); setEditTitle(cat.title); }}
                        className="text-gray-400 hover:text-[#009cd6] transition-colors"
                        title="Edit Name"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(cat.id, cat.is_active)}
                        className={`${cat.is_active ? "text-gray-400" : "text-green-500"} hover:text-[#009cd6] transition-colors`}
                        title={cat.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
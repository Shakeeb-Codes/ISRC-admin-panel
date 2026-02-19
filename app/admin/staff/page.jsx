"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, X, User, Search, Save, Loader2, Lock } from "lucide-react";
import { graphqlRequest } from "../../../lib/api";

export default function StaffManagementPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // --- SECURE ROUTE GUARD ---
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/admin/dashboard");
    } else {
      setAuthorized(true);
      loadStaff();
    }
  }, [router]);

  const loadStaff = async () => {
    setLoading(true);
    const GET_USERS = `
      query {
        users {
          id
          first_name
          last_name
          email
          role
          phone
          createdAt
          is_active
        }
      }
    `;

    try {
      const data = await graphqlRequest(GET_USERS);
      if (data?.users) {
        const formattedStaff = data.users.map((user) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
            ? new Date(parseInt(user.createdAt)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          status: user.is_active,
        }));
        setStaff(formattedStaff);
      }
    } catch (error) {
      console.error("Load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.fullName.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  const openEditModal = (member) => {
    setEditingUser(member);
    setFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "staff",
      password: "", 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const REGISTER_MUTATION = `
      mutation Register($first_name: String!, $last_name: String!, $email: String!, $password: String!, $phone: String!, $role: StaffRole!) {
        staffRegister(first_name: $first_name, last_name: $last_name, email: $email, password: $password, phone: $phone, role: $role) {
          user { id }
        }
      }
    `;

    const UPDATE_USER_MUTATION = `
      mutation UpdateUser($id: Int!, $first_name: String, $last_name: String, $email: String, $phone: String) {
        updateUser(id: $id, first_name: $first_name, last_name: $last_name, email: $email, phone: $phone) {
          id
        }
      }
    `;

    try {
      if (editingUser) {
        const variables = { id: parseInt(editingUser.id) };
        
        if (formData.first_name !== editingUser.first_name) variables.first_name = formData.first_name;
        if (formData.last_name !== editingUser.last_name) variables.last_name = formData.last_name;
        if (formData.email !== editingUser.email) variables.email = formData.email;
        if (formData.phone !== editingUser.phone) variables.phone = formData.phone;

        if (Object.keys(variables).length === 1) {
           closeModal();
           return;
        }

        await graphqlRequest(UPDATE_USER_MUTATION, variables);
        alert("User Details Updated Successfully!");
      } else {
        await graphqlRequest(REGISTER_MUTATION, formData);
        alert("User Created Successfully!");
      }
      closeModal();
      loadStaff();
    } catch (error) {
      if (error.message.includes("unique constraint") || error.message.includes("exists")) {
        alert("This email is already registered to another user.");
      } else {
        alert(error.message || "An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setTogglingId(id);
    const TOGGLE_STATUS_MUTATION = `
      mutation UpdateStatus($id: Int!, $isActive: Boolean!) {
        updateUserStatus(id: $id, is_active: $isActive) {
          id
          is_active
        }
      }
    `;
    try {
      const result = await graphqlRequest(TOGGLE_STATUS_MUTATION, {
        id: parseInt(id),
        isActive: !currentStatus,
      });
      if (result?.updateUserStatus) await loadStaff();
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      first_name: "", last_name: "", email: "", password: "", phone: "", role: "staff",
    });
  };

  // --- RENDER GUARD ---
  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#009cd6]" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Management</h2>
            <p className="text-gray-600">Manage your staff members and permissions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors font-semibold shadow-md"
          >
            <Plus size={20} /> Add New Staff
          </button>
        </div>

        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009cd6] transition-all bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Staff Member</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4 bg-gray-50/50 h-16"></td>
                  </tr>
                ))
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{member.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4 text-gray-600">{member.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(member.id, member.status)}
                        disabled={togglingId === member.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${member.status ? "bg-green-400" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${member.status ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Remains the same structure as your provided code */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingUser ? "Edit Staff Member" : "Add New User"}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className={`p-4 rounded-xl border ${editingUser ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-100'}`}>
                  <label className="block text-xs font-black uppercase mb-2 text-blue-700">Account Type</label>
                  <select
                    value={formData.role}
                    disabled={!!editingUser}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-transparent font-bold text-lg outline-none"
                  >
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="px-4 py-2.5 border rounded-lg" required />
                  <input type="text" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="px-4 py-2.5 border rounded-lg" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="px-4 py-2.5 border rounded-lg" required />
                  <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="px-4 py-2.5 border rounded-lg" required />
                </div>

                {!editingUser && (
                  <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" required minLength={6} />
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-bold">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-[#009cd6] text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {editingUser ? "Update User" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, User } from 'lucide-react';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    profilePic: null
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load staff from localStorage or API
    loadStaff();
  }, []);

  const loadStaff = () => {
    // TODO: Replace with API call
    // const response = await fetch('/api/staff');
    // const data = await response.json();
    
    // For now, load from localStorage
    const savedStaff = localStorage.getItem('staffList');
    if (savedStaff) {
      setStaff(JSON.parse(savedStaff));
    } 
    // else {
    //   // Demo data
    //   const demoStaff = [
    //     {
    //       id: 1,
    //       fullName: 'John Doe',
    //       email: 'john@isrclanka.org',
    //       profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    //       createdAt: '2025-01-15',
    //       status: 'active'
    //     },
    //     {
    //       id: 2,
    //       fullName: 'Sarah Smith',
    //       email: 'sarah@isrclanka.org',
    //       profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    //       createdAt: '2025-01-20',
    //       status: 'active'
    //     }
    //   ];
    //   setStaff(demoStaff);
    //   localStorage.setItem('staffList', JSON.stringify(demoStaff));
    // }
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
      setFormData({ ...formData, profilePic: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      alert('Please enter full name');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    // TODO: Replace with API call
    // const response = await fetch('/api/staff', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });

    // Simulate API call
    setTimeout(() => {
      const newStaff = {
        id: Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        profilePic: formData.profilePic || 'https://via.placeholder.com/100',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      const updatedStaff = [...staff, newStaff];
      setStaff(updatedStaff);
      localStorage.setItem('staffList', JSON.stringify(updatedStaff));
      
      // Also save credentials for login (demo only)
      const staffCredentials = JSON.parse(localStorage.getItem('staffCredentials') || '[]');
      staffCredentials.push({
        email: formData.email,
        password: formData.password,
        role: 'staff',
        name: formData.fullName
      });
      localStorage.setItem('staffCredentials', JSON.stringify(staffCredentials));

      alert('Staff member created successfully!');
      setShowCreateModal(false);
      resetForm();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      // TODO: Replace with API call
      // await fetch(`/api/staff/${id}`, { method: 'DELETE' });

      const updatedStaff = staff.filter(s => s.id !== id);
      setStaff(updatedStaff);
      localStorage.setItem('staffList', JSON.stringify(updatedStaff));
      alert('Staff member deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      profilePic: null
    });
    setProfilePreview(null);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Management</h2>
            <p className="text-gray-600">Manage your staff members</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add New Staff
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm">
        {staff.length === 0 ? (
          <div className="p-12 text-center">
            <User size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No staff members yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors"
            >
              <Plus size={20} />
              Add Your First Staff Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Staff Member</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.profilePic}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-semibold text-gray-800">{member.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4 text-gray-600">{member.createdAt}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => alert('Edit feature coming soon!')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, member.fullName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Add New Staff</h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                        id="profile-pic-upload"
                      />
                      <label
                        htmlFor="profile-pic-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Upload size={18} />
                        Upload Photo
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Max 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Staff will use this to login</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Staff'}
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
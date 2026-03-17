'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Edit, Trash2, Plus, X, Save, Loader2, ExternalLink 
} from 'lucide-react';
// import { graphqlRequest } from '../../../lib/api';

// --- Queries & Mutations ---
// const GET_VIDEOS_QUERY = `
//   query {
//     getVideos { id title youtube_url createdAt }
//   }
// `;

// const CREATE_VIDEO_MUTATION = `
//   mutation CreateVideo($title: String!, $youtube_url: String!) {
//     createVideo(title: $title, youtube_url: $youtube_url) { id title }
//   }
// `;

// const DELETE_VIDEO_MUTATION = `
//   mutation DeleteVideo($id: Int!) {
//     deleteVideo(id: $id) { message }
//   }
// `;

// --- Create/Edit Modal ---
const VideoModal = ({ isOpen, onClose, onRefresh, editData }) => {
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editData) setFormData({ title: editData.title, url: editData.youtube_url });
    else setFormData({ title: '', url: '' });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.title || !formData.url) return alert("Please fill all fields");
    setIsSaving(true);
    try {
      // Note: You can add an Update mutation here if your backend supports it
    //   await graphqlRequest(CREATE_VIDEO_MUTATION, { 
    //     title: formData.title, 
    //     youtube_url: formData.url 
    //   });
      onRefresh();
      onClose();
    } catch (error) {
      alert("Error saving video: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col transition-all">
        <div className="px-10 py-8 border-b flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800">{editData ? 'Edit Video' : 'Add New Video'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Video Title</label>
            <input 
              type="text" 
              placeholder="Enter the video title" 
              className="w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#009cd6]"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">YouTube URL</label>
            <input 
              type="text" 
              placeholder="Paste the youtube URL" 
              className="w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#009cd6]"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
            />
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full bg-[#009cd6] text-white rounded-2xl font-black py-5 shadow-lg flex items-center justify-center gap-2 hover:bg-[#0088bd] transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
            {editData ? 'Update Video' : 'Publish Video'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Admin Page ---
export default function VideoAdminPage() {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
    //   const result = await graphqlRequest(GET_VIDEOS_QUERY);
    //   if (result?.getVideos) setVideos(result.getVideos);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this video from the gallery?")) return;
    try {
    //   await graphqlRequest(DELETE_VIDEO_MUTATION, { id: parseInt(id) });
      loadVideos();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <VideoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onRefresh={loadVideos} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Video Gallery</h2>
          <p className="text-gray-500 text-sm">Manage YouTube videos shown on the website</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-xl hover:bg-[#0088bd] font-bold shadow-lg transition-all"
        >
          <Plus size={20} /> Add Video
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-xl px-4 py-3 mb-6 border border-gray-100 shadow-sm focus-within:border-[#009cd6] transition-all">
        <Search size={18} className="text-gray-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search videos by title..." 
          className="bg-transparent outline-none w-full text-gray-700 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Video Title</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Link</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="3" className="p-6 bg-gray-50/50 h-16"></td></tr>)
            ) : filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{video.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Added on {new Date(parseInt(video.createdAt)).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={video.youtube_url} 
                      target="_blank" 
                      className="text-[#009cd6] text-sm flex items-center gap-1 hover:underline font-medium"
                    >
                      <ExternalLink size={14} /> Open Link
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(video.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-400 font-medium">No videos found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
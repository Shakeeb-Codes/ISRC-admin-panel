'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Edit, Trash2, Eye, Plus, Image as ImageIcon, X, 
  Save, Loader2, ImagePlus, ChevronLeft, ChevronRight, Check, ArrowLeft 
} from 'lucide-react';
import { graphqlRequest } from '../../../lib/api';

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
const BASE_DOMAIN = API_URL.replace('/graphql', ''); 
const IMAGE_BASE_URL = `${BASE_DOMAIN}/uploads/posts/`;

// --- Queries & Mutations ---
const GET_ALL_POSTS_QUERY = `
  query {
    getCategories {
      id title is_active
      posts {
        id title content status banner_image galleries createdAt
      }
    }
  }
`;

const CREATE_POST_MUTATION = `
  mutation CreatePost($title: String!, $content: String!, $category_id: Int!, $staff_id: Int!, $status: PostStatus!) {
    createPost(title: $title, content: $content, category_id: $category_id, staff_id: $staff_id, status: $status) {
      id title status
    }
  }
`;

const UPDATE_POST_MUTATION = `
  mutation UpdatePost($id: Int!, $title: String!, $content: String!, $category_id: Int!) {
    updatePost(id: $id, title: $title, content: $content, category_id: $category_id) { id title }
  }
`;

const UPDATE_POST_STATUS_MUTATION = `
  mutation UpdatePostStatus($id: Int!, $status: PostStatus!) {
    updatePostStatus(id: $id, status: $status) { id status }
  }
`;

const UPLOAD_BANNER_MUTATION = `
  mutation UploadBanner($post_id: Int!, $file: Upload!) {
    uploadPostBanner(post_id: $post_id, file: $file) { id banner_image }
  }
`;

const UPLOAD_GALLERY_MUTATION = `
  mutation UploadGallery($post_id: Int!, $files: [Upload!]!) {
    uploadPostGalleries(post_id: $post_id, files: $files) { id galleries }
  }
`;

const DELETE_POST_MUTATION = `
  mutation DeletePost($id: Int!) {
    deletePost(id: $id) { message }
  }
`;

// --- Updated CreatePostModal with Fixed Grid and Proper Sizing ---
const CreatePostModal = ({ isOpen, onClose, categories, onRefresh }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [postId, setPostId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  if (!isOpen) return null;

  const handleFeaturedImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      id: Math.random(),
      file: file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryFiles((prev) => [...prev, ...newItems]);
  };

  const savePost = async (targetStatus) => {
    if (!formData.title || !formData.description || !formData.categoryId) {
      alert('Please fill in Title, Content, and Category.');
      return;
    }
    setIsSaving(true);
    setUploadStatus("Saving post content...");
    const staffId = parseInt(localStorage.getItem('userId') || '1');

    try {
      const result = await graphqlRequest(CREATE_POST_MUTATION, {
        title: formData.title,
        content: formData.description,
        category_id: parseInt(formData.categoryId),
        staff_id: staffId,
        status: targetStatus,
      });

      if (result?.createPost) {
        setPostId(result.createPost.id);
        if (targetStatus === 'published') { setStep(2); } 
        else { onRefresh(); onClose(); resetModal(); }
      }
    } catch (error) { alert('Error: ' + error.message); } 
    finally { setIsSaving(false); setUploadStatus(""); }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      if (featuredFile) {
        setUploadStatus("Uploading banner...");
        await graphqlRequest(UPLOAD_BANNER_MUTATION, { post_id: parseInt(postId), file: featuredFile });
      }
      if (galleryFiles.length > 0) {
        setUploadStatus("Uploading gallery...");
        await graphqlRequest(UPLOAD_GALLERY_MUTATION, { post_id: parseInt(postId), files: galleryFiles.map(i => i.file) });
      }
      setUploadStatus("done");
      setTimeout(() => { onRefresh(); onClose(); resetModal(); }, 1500);
    } catch (error) { alert("Upload failed: " + error.message); setIsSaving(false); }
  };

  const resetModal = () => {
    setStep(1); setPostId(null); setUploadStatus("");
    setFormData({ title: '', description: '', categoryId: '', date: new Date().toISOString().split('T')[0] });
    setFeaturedFile(null); setFeaturedPreview(null); setGalleryFiles([]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col transition-all">
        
        {/* Header */}
        <div className="px-10 py-8 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Create New Post</h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Modal Body */}
        <div className="p-10 overflow-y-auto max-h-[75vh]">
          {step === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <input type="text" placeholder="Enter Title..." className="w-full px-6 py-5 bg-gray-50 border-1 rounded-2xl outline-none focus:ring-2 focus:ring-[#009cd6] text-xl font-bold" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                <textarea placeholder="Write post content..." className="w-full px-6 py-5 bg-gray-50 border-1 rounded-2xl min-h-[300px] outline-none focus:ring-2 focus:ring-[#009cd6] resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Post Settings</label>
                  <select className="w-full px-4 py-4 bg-white border-none rounded-xl outline-none shadow-sm" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map((cat) => ( <option key={cat.id} value={cat.id}>{cat.title}</option> ))}
                  </select>
                  <input type="date" className="w-full px-4 py-4 bg-white border-none rounded-xl outline-none shadow-sm" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <button onClick={() => savePost('published')} className="w-full bg-[#009cd6] text-white rounded-2xl font-black py-5 shadow-lg shadow-[#009cd6]/20 hover:scale-[1.02] transition-all">Next: Upload Media</button>
              </div>
            </div>
          ) : (
            /* STEP 2: Media Upload - FIXED GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Side: Banner */}
              <div className="flex flex-col">
                <label className="text-sm font-black text-gray-700 mb-4 ml-2">Main Banner Image</label>
                <div className="relative w-full aspect-video rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group">
                  {featuredPreview ? (
                    <div className="w-full h-full relative">
                      <img src={featuredPreview} className="w-full h-full object-cover" />
                      <button onClick={() => setFeaturedPreview(null)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20}/></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="w-16 h-16 bg-[#009cd6]/10 rounded-full flex items-center justify-center text-[#009cd6] mb-4"><ImagePlus size={28}/></div>
                      <p className="font-bold text-gray-800">Upload Banner</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Recommended: 1200 x 630px</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFeaturedImage} />
                    </label>
                  )}
                </div>
              </div>

              {/* Right Side: Gallery */}
              <div className="flex flex-col">
                <label className="text-sm font-black text-gray-700 mb-4 ml-2">Gallery Images ({galleryFiles.length})</label>
                <div className="w-full min-h-[220px] max-h-[300px] overflow-y-auto bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <div className="grid grid-cols-3 gap-4">
                    {galleryFiles.map(file => (
                      <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
                        <img src={file.preview} className="w-full h-full object-cover" />
                        <button onClick={() => setGalleryFiles(p => p.filter(i => i.id !== file.id))} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={12}/></button>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors text-gray-400">
                      <Plus size={24} />
                      <input type="file" className="hidden" multiple accept="image/*" onChange={handleGalleryUpload} />
                    </label>
                  </div>
                </div>
                
                {/* Finish Button pinned to Right Column */}
                <button onClick={handleFinish} className="mt-6 w-full bg-gray-900 text-white rounded-2xl font-black py-5 shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                  Finish & Publish Post <Check size={20}/>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isSaving && (
          <div className="absolute inset-0 bg-white/95 z-[70] flex flex-col items-center justify-center animate-in fade-in">
             <div className="w-20 h-20 border-4 border-[#009cd6] border-t-transparent rounded-full animate-spin mb-6" />
             <h3 className="text-xl font-black text-gray-800 uppercase tracking-widest">{uploadStatus || "Processing..."}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function PostsPage() {
  const router = useRouter();

  // State Management
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editContentModal, setEditContentModal] = useState(null);
  const [editImagesModal, setEditImagesModal] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const [editFormData, setEditFormData] = useState({
    title: '', description: '', categoryId: '', status: 'draft'
  });
  
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [featuredFile, setFeaturedFile] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  useEffect(() => { loadPosts(); }, []);
  useEffect(() => { filterPosts(); }, [searchQuery, filterStatus, posts]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const timestamp = isNaN(dateString) ? dateString : parseInt(dateString);
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const parseGallerySafely = (data) => {
    try {
      if (Array.isArray(data)) return data;
      if (typeof data === 'string' && data.trim() !== '') return JSON.parse(data);
    } catch (e) { console.error("Gallery JSON Parse Error", e); }
    return [];
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const result = await graphqlRequest(GET_ALL_POSTS_QUERY);
      if (result?.getCategories) {
        setCategories(result.getCategories.filter(cat => cat.is_active));
        const allPosts = result.getCategories.flatMap(category => 
          (category.posts || []).map(post => ({
            ...post,
            categoryId: category.id,
            categoryName: category.title,
            displayImage: post.banner_image ? `${IMAGE_BASE_URL}${post.banner_image}` : 'https://via.placeholder.com/400x200?text=No+Image',
            description: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) : ''
          }))
        );
        setPosts(allPosts);
      }
    } catch (error) { console.error("Failed to load posts:", error); }
    finally { setLoading(false); }
  };

  const filterPosts = () => {
    let filtered = [...posts];
    if (searchQuery) filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus !== 'all') filtered = filtered.filter(p => p.status.toLowerCase() === filterStatus.toLowerCase());
    filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentItems = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeletePost = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await graphqlRequest(DELETE_POST_MUTATION, { id: parseInt(id) });
      alert("Post deleted successfully");
      loadPosts();
    } catch (error) { alert("Delete failed: " + error.message); }
  };

  const openEditContent = (post) => {
    setEditFormData({ title: post.title, description: post.content, categoryId: post.categoryId, status: post.status });
    setEditContentModal(post);
  };

  const openEditImages = (post) => {
    setFeaturedPreview(post.banner_image ? `${IMAGE_BASE_URL}${post.banner_image}` : null);
    setFeaturedFile(null);
    const galleries = parseGallerySafely(post.galleries).map((filename, i) => ({
      id: `existing-${i}`, url: `${IMAGE_BASE_URL}${filename}`, file: null, isExisting: true
    }));
    setGalleryPreviews(galleries);
    setEditImagesModal(post);
  };

  const saveEditedContent = async () => {
    setIsSaving(true);
    try {
      await graphqlRequest(UPDATE_POST_MUTATION, { id: parseInt(editContentModal.id), title: editFormData.title.trim(), content: editFormData.description, category_id: parseInt(editFormData.categoryId) });
      await graphqlRequest(UPDATE_POST_STATUS_MUTATION, { id: parseInt(editContentModal.id), status: editFormData.status });
      alert('Post updated successfully!');
      setEditContentModal(null);
      loadPosts();
    } catch (error) { alert('Failed to update: ' + error.message); }
    finally { setIsSaving(false); }
  };

  const saveEditedImages = async () => {
    setIsSaving(true);
    const postId = parseInt(editImagesModal.id);
    try {
      if (featuredFile) await graphqlRequest(UPLOAD_BANNER_MUTATION, { post_id: postId, file: featuredFile });
      const newFiles = galleryPreviews.filter(item => !item.isExisting && item.file).map(item => item.file);
      if (newFiles.length > 0) await graphqlRequest(UPLOAD_GALLERY_MUTATION, { post_id: postId, files: newFiles });
      alert('Media updated successfully!');
      setEditImagesModal(null);
      loadPosts();
    } catch (error) { alert('Error updating media: ' + error.message); }
    finally { setIsSaving(false); }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, { id: `new-${Math.random()}`, url: reader.result, file: file, isExisting: false }]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Create Modal Wrapper */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        categories={categories}
        onRefresh={loadPosts}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Blog Posts</h2>
          <p className="text-gray-500 text-sm">View and manage your categorized content</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-xl hover:bg-[#0088bd] font-bold shadow-lg transition-all"
        >
          <Plus size={20} /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 flex-1 border border-gray-200 focus-within:border-[#009cd6] transition-colors">
          <Search size={18} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Search by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent outline-none w-full text-gray-700 text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm outline-none focus:border-[#009cd6]">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="h-44 relative bg-gray-200 overflow-hidden">
                  <img src={post.displayImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white ${post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {post.status}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] text-[#009cd6] font-extrabold uppercase tracking-widest">{post.categoryName}</span>
                     <p className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(post.createdAt)}</p>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">{post.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-5">{post.description}...</p>
                  
                  <div className="space-y-2">
                    <button onClick={() => setSelectedPost(post)} className="w-full py-2.5 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-[#009cd6] hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-semibold"><Eye size={16} /> View</button>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => openEditContent(post)} className="py-2 text-blue-400 rounded-lg border border-blue-200 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-semibold flex items-center justify-center gap-1"><Edit size={12} /> Content</button>
                      <button onClick={() => openEditImages(post)} className="py-2 text-blue-400 rounded-lg border border-blue-200 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-semibold flex items-center justify-center gap-1"><ImageIcon size={12} /> Media</button>
                      <button onClick={() => handleDeletePost(post.id, post.title)} className="py-2 text-red-500 rounded-lg border border-red-200 hover:bg-red-600 hover:text-white transition-all text-[10px] font-semibold flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-gray-50"><ChevronLeft size={20} /></button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => paginate(i + 1)} className={`w-10 h-10 rounded-lg font-bold text-sm ${currentPage === i + 1 ? 'bg-[#009cd6] text-white' : 'bg-white text-gray-600 border'}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-gray-50"><ChevronRight size={20} /></button>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-[#009cd6] to-[#0088bd] text-white">
              <h2 className="text-2xl font-bold truncate">{selectedPost.title}</h2>
              <button onClick={() => setSelectedPost(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <img src={selectedPost.displayImage} className="w-full h-96 object-cover rounded-xl shadow-lg" alt="" />
              <div className="bg-gray-50 rounded-xl p-6">
                <h1 className="text-xl font-bold text-gray-700 uppercase mb-3">{selectedPost.title}</h1>
                <p className="mt-1 mb-3 text-sm text-gray-500">Date : {formatDate(selectedPost.createdAt)}</p>
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {parseGallerySafely(selectedPost.galleries).map((filename, i) => (
                    <img key={i} src={`${IMAGE_BASE_URL}${filename}`} className="w-full aspect-square object-cover rounded-lg shadow" alt="" onError={(e) => e.target.src='https://via.placeholder.com/150'} />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-center">
              <button onClick={() => setSelectedPost(null)} className="px-8 py-3 bg-[#009cd6] text-white rounded-xl font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 flex justify-between items-center bg-blue-400 text-white">
              <h2 className="text-2xl font-bold">Edit Content</h2>
              <button onClick={() => setEditContentModal(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-4 py-3 border rounded-lg" placeholder="Title" />
              <textarea className="w-full px-4 py-3 border rounded-lg min-h-[300px]" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select value={editFormData.categoryId} onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})} className="w-full px-4 py-3 border rounded-lg">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                </select>
                <select value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})} className="w-full px-4 py-3 border rounded-lg">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button onClick={() => setEditContentModal(null)} className="px-6 py-3 border rounded-lg">Cancel</button>
              <button onClick={saveEditedContent} disabled={isSaving} className="flex-1 bg-blue-400 text-white rounded-lg font-bold py-3 flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Images Modal */}
      {editImagesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 flex justify-between items-center bg-blue-400 text-white">
              <h2 className="text-2xl font-bold">Update Media</h2>
              <button onClick={() => setEditImagesModal(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {featuredPreview ? (
                <div className="relative group"><img src={featuredPreview} className="w-full h-64 object-cover rounded-lg" /><button onClick={() => {setFeaturedPreview(null); setFeaturedFile(null)}} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"><X size={18}/></button></div>
              ) : (
                <label className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center cursor-pointer hover:bg-gray-50">
                  <ImagePlus size={40} className="text-gray-300" /><span className="mt-2 text-sm text-gray-500">Banner</span>
                  <input type="file" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file){ setFeaturedFile(file); setFeaturedPreview(URL.createObjectURL(file)); }}} />
                </label>
              )}
              <div className="grid grid-cols-4 gap-4">
                {galleryPreviews.map(img => (
                  <div key={img.id} className="relative aspect-square"><img src={img.url} className="w-full h-full object-cover rounded-lg" /><button onClick={() => setGalleryPreviews(prev => prev.filter(i => i.id !== img.id))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"><X size={14} /></button></div>
                ))}
                <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Plus size={24} className="text-gray-400" /><input type="file" className="hidden" multiple onChange={handleGalleryUpload} />
                </label>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button onClick={() => setEditImagesModal(null)} className="px-6 py-3 border rounded-lg">Cancel</button>
              <button onClick={saveEditedImages} disabled={isSaving} className="flex-1 bg-blue-400 text-white rounded-lg font-bold py-3 flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Update Media
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
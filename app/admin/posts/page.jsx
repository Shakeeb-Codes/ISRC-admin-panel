'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Added Chevron icons for pagination
import { Search, Edit, Trash2, Eye, Plus, Image as ImageIcon, X, Save, Loader2, ImagePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { graphqlRequest } from '../../../lib/api';

// Configuration from .env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
const BASE_DOMAIN = API_URL.replace('/graphql', ''); 
const IMAGE_BASE_URL = `${BASE_DOMAIN}/uploads/posts/`;

// Queries & Mutations
const GET_ALL_POSTS_QUERY = `
  query {
    getCategories {
      id
      title
      is_active
      posts {
        id
        title
        content
        status
        banner_image
        galleries
        createdAt
      }
    }
  }
`;

const UPDATE_POST_MUTATION = `
  mutation UpdatePost($id: Int!, $title: String!, $content: String!, $category_id: Int!) {
    updatePost(id: $id, title: $title, content: $content, category_id: $category_id) {
      id
      title
    }
  }
`;

const UPDATE_POST_STATUS_MUTATION = `
  mutation UpdatePostStatus($id: Int!, $status: PostStatus!) {
    updatePostStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const UPLOAD_BANNER_MUTATION = `
  mutation UploadBanner($post_id: Int!, $file: Upload!) {
    uploadPostBanner(post_id: $post_id, file: $file) {
      id
      banner_image
    }
  }
`;

const UPLOAD_GALLERY_MUTATION = `
  mutation UploadGallery($post_id: Int!, $files: [Upload!]!) {
    uploadPostGalleries(post_id: $post_id, files: $files) {
      id
      galleries
    }
  }
`;

const DELETE_POST_MUTATION = `
  mutation DeletePost($id: Int!) {
    deletePost(id: $id) {
      message
    }
  }
`;

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
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    status: 'draft'
  });
  
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [featuredFile, setFeaturedFile] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // --- INITIAL DATA LOAD (No Restriction) ---
  useEffect(() => {
    loadPosts();
  }, []);

  // Effect for filtering
  useEffect(() => { 
    filterPosts(); 
  }, [searchQuery, filterStatus, posts]);

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const timestamp = isNaN(dateString) ? dateString : parseInt(dateString);
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const parseGallerySafely = (data) => {
    try {
      if (Array.isArray(data)) return data;
      if (typeof data === 'string' && data.trim() !== '') {
        let str = data.trim();
        if (!str.endsWith(']')) {
          const lastQuote = str.lastIndexOf('"');
          str = lastQuote !== -1 ? str.substring(0, lastQuote + 1) + ']' : str + '"]';
        }
        return JSON.parse(str);
      }
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
            displayImage: post.banner_image 
              ? `${IMAGE_BASE_URL}${post.banner_image}` 
              : 'https://via.placeholder.com/400x200?text=No+Image',
            description: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) : ''
          }))
        );
        setPosts(allPosts);
      }
    } catch (error) { console.error("Failed to load posts:", error); }
    finally { setLoading(false); }
  };

  const filterPosts = () => {
    let filtered = [...posts]; // Use spread to avoid mutating original
    if (searchQuery) filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus !== 'all') filtered = filtered.filter(p => p.status.toLowerCase() === filterStatus.toLowerCase());
    
    // Sort descending by ID
    filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    
    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to page 1 on filter
  };

  // --- Pagination Logic ---
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
    setEditFormData({
      title: post.title,
      description: post.content,
      categoryId: post.categoryId,
      status: post.status
    });
    setEditContentModal(post);
  };

  const openEditImages = (post) => {
    setFeaturedPreview(post.banner_image ? `${IMAGE_BASE_URL}${post.banner_image}` : null);
    setFeaturedFile(null);
    const galleries = parseGallerySafely(post.galleries).map((filename, i) => ({
      id: `existing-${i}`,
      url: `${IMAGE_BASE_URL}${filename}`,
      file: null,
      isExisting: true
    }));
    setGalleryPreviews(galleries);
    setEditImagesModal(post);
  };

  const saveEditedContent = async () => {
    setIsSaving(true);
    try {
      await graphqlRequest(UPDATE_POST_MUTATION, {
        id: parseInt(editContentModal.id),
        title: editFormData.title.trim(),
        content: editFormData.description,
        category_id: parseInt(editFormData.categoryId),
      });
      await graphqlRequest(UPDATE_POST_STATUS_MUTATION, {
        id: parseInt(editContentModal.id),
        status: editFormData.status 
      });
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
      if (featuredFile) {
        await graphqlRequest(UPLOAD_BANNER_MUTATION, { post_id: postId, file: featuredFile });
      }
      const newFiles = galleryPreviews.filter(item => !item.isExisting && item.file).map(item => item.file);
      if (newFiles.length > 0) {
        await graphqlRequest(UPLOAD_GALLERY_MUTATION, { post_id: postId, files: newFiles });
      }
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
        setGalleryPreviews(prev => [...prev, {
          id: `new-${Math.random()}`,
          url: reader.result,
          file: file,
          isExisting: false
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Blog Posts</h2>
          <p className="text-gray-500 text-sm">View and manage your categorized content</p>
        </div>
        <Link href="/admin/posts/new" className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-xl hover:bg-[#0088bd] font-bold shadow-lg transition-all">
          <Plus size={20} /> New Post
        </Link>
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
                    <button onClick={() => setSelectedPost(post)} className="w-full py-2.5 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-[#009cd6] hover:text-white hover:border-[#009cd6] transition-all flex items-center justify-center gap-2 text-sm font-semibold"><Eye size={16} /> View</button>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => openEditContent(post)} className="py-2 text-blue-400 rounded-lg border border-blue-200 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-1 text-[10px] font-semibold"><Edit size={12} /> Content</button>
                      <button onClick={() => openEditImages(post)} className="py-2 text-blue-400 rounded-lg border border-blue-200 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-1 text-[10px] font-semibold"><ImageIcon size={12} /> Media</button>
                      <button onClick={() => handleDeletePost(post.id, post.title)} className="py-2 text-red-500 rounded-lg border border-red-200 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1 text-[10px] font-semibold"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                      currentPage === i + 1 
                        ? 'bg-[#009cd6] text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#009cd6]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-[#009cd6] to-[#0088bd]">
              <h2 className="text-2xl font-bold text-white truncate mr-4">{selectedPost.title}</h2>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"><X size={24} /></button>
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
              <h2 className="text-2xl font-bold">Edit Post Content</h2>
              <button onClick={() => setEditContentModal(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Content (Plain Text) *</label>
                <textarea className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[300px] resize-y" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <select value={editFormData.categoryId} onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})} className="w-full px-4 py-3 border rounded-lg outline-none">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})} className="w-full px-4 py-3 border rounded-lg outline-none">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
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
              <div>
                <label className="block font-bold mb-3">Featured Image</label>
                {featuredPreview ? (
                  <div className="relative group">
                    <img src={featuredPreview} className="w-full h-64 object-cover rounded-lg" alt="" />
                    <button onClick={() => { setFeaturedPreview(null); setFeaturedFile(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <ImagePlus size={40} className="text-gray-300" />
                    <span className="mt-2 text-sm text-gray-500 font-medium">Click to upload banner</span>
                    <input type="file" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFeaturedFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setFeaturedPreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>
              <div>
                <label className="block font-bold mb-3">Gallery</label>
                <div className="grid grid-cols-4 gap-4">
                  {galleryPreviews.map(img => (
                    <div key={img.id} className="relative aspect-square">
                      <img src={img.url} className="w-full h-full object-cover rounded-lg" alt="" />
                      <button onClick={() => setGalleryPreviews(prev => prev.filter(i => i.id !== img.id))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm"><X size={14} /></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Plus size={24} className="text-gray-400" />
                    <input type="file" className="hidden" multiple onChange={handleGalleryUpload} />
                  </label>
                </div>
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
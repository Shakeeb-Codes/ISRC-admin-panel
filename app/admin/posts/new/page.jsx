'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, ImagePlus, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { graphqlRequest } from '../../../../lib/api';

const CREATE_POST_MUTATION = `
  mutation CreatePost($title: String!, $content: String!, $category_id: Int!, $staff_id: Int!, $status: PostStatus!) {
    createPost(title: $title, content: $content, category_id: $category_id, staff_id: $staff_id, status: $status) {
      id
      title
      status
    }
  }
`;

const UPLOAD_BANNER_MUTATION = `
  mutation UploadBanner($postId: Int!, $file: Upload!) {
    uploadPostBanner(post_id: $postId, file: $file) {
      id
      banner_image
    }
  }
`;

const UPLOAD_GALLERY_MUTATION = `
  mutation UploadGallery($postId: Int!, $files: [Upload!]!) {
    uploadPostGalleries(post_id: $postId, files: $files) {
      id
      galleries
    }
  }
`;

export default function NewPostPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [postId, setPostId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
  });

  // --- Image States ---
  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]); // Array of {id, file, preview}

  const loadCategories = useCallback(async () => {
    setIsLoadingCats(true);
    try {
      const query = `query { getCategories { id title is_active } }`;
      const response = await graphqlRequest(query);
      if (response?.getCategories) {
        setCategories(response.getCategories.filter((cat) => cat.is_active));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoadingCats(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // --- Image Handlers ---
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
    const storedId = localStorage.getItem('userId');
    const staffId = storedId ? parseInt(storedId) : 1;

    try {
      const result = await graphqlRequest(CREATE_POST_MUTATION, {
        title: formData.title,
        content: formData.description,
        category_id: parseInt(formData.categoryId),
        staff_id: staffId,
        status: targetStatus,
      });

      const postData = result?.createPost;
      if (postData) {
        setPostId(postData.id);
        if (targetStatus === 'published') {
          setStep(2);
        } else {
          router.push('/admin/posts');
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSaving(false);
      setUploadStatus("");
    }
  };

const handleFinish = async () => {
  setIsSaving(true);
  
  try {
    // 1. Upload Banner
    if (featuredFile) {
      setUploadStatus("Uploading banner image...");
      await graphqlRequest(UPLOAD_BANNER_MUTATION, {
        postId: parseInt(postId),
        file: featuredFile,
      });
    }

    // 2. Upload Gallery
    if (galleryFiles.length > 0) {
      setUploadStatus("Uploading gallery images...");
      const filesToUpload = galleryFiles.map(item => item.file);
      
      await graphqlRequest(UPLOAD_GALLERY_MUTATION, {
        postId: parseInt(postId),
        files: filesToUpload,
      });
    }

    // 3. Show success status
    setUploadStatus("done");
    
    // 4. Show success alert after brief delay
    setTimeout(() => {
      alert("🎉 Post created successfully! Your post has been published.");
      router.push("/admin/posts");
    }, 1000);
    
  } catch (error) {
    console.error('Upload error:', error);
    alert("Upload failed: " + error.message);
    setUploadStatus("");
    setIsSaving(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {isSaving && uploadStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full animate-in zoom-in duration-300">
            {uploadStatus === "done" ? (
              <>
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-gray-800">Success!</h3>
                <p className="text-gray-500 text-center mt-2">Post and media have been saved.</p>
              </>
            ) : (
              <>
                <Loader2 className="animate-spin text-[#009cd6] mb-6" size={56} />
                <h3 className="text-xl font-bold text-gray-800">Please Wait</h3>
                <p className="text-gray-500 text-center mt-2 font-medium">{uploadStatus}</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mb-8">
        <Link href="/admin/posts" className="inline-flex items-center gap-2 text-[#009cd6] hover:underline mb-4 font-semibold">
          <ArrowLeft size={20} /> Back to Posts
        </Link>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Create New Post</h2>
      </div>

      <div className="mb-12 flex items-center justify-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= 1 ? 'bg-[#009cd6] text-white shadow-lg shadow-blue-100' : 'bg-gray-200 text-gray-400'}`}>
          {step > 1 ? <Check size={24} /> : '1'}
        </div>
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full bg-[#009cd6] transition-all duration-700 ease-out ${step === 2 ? 'w-full' : 'w-0'}`} />
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step === 2 ? 'bg-[#009cd6] text-white shadow-lg shadow-blue-100' : 'bg-gray-200 text-gray-400'}`}>2</div>
      </div>

      {step === 1 ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Post Title *</label>
            <input type="text" placeholder="Enter the title..." className="w-full px-5 py-4 border-2 border-gray-50 rounded-xl outline-none focus:border-[#009cd6] transition-all text-lg" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Content *</label>
            <textarea placeholder="Write your post content here..." className="w-full px-5 py-4 border-2 border-gray-50 rounded-xl min-h-[250px] outline-none focus:border-[#009cd6] transition-all text-lg leading-relaxed" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Category *</label>
              <select className="w-full px-5 py-4 border-2 border-gray-50 rounded-xl outline-none focus:border-[#009cd6] appearance-none bg-white cursor-pointer" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map((cat) => ( <option key={cat.id} value={cat.id}>{cat.title}</option> ))}
              </select>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Date</label>
              <input type="date" className="w-full px-5 py-4 border-2 border-gray-50 rounded-xl outline-none focus:border-[#009cd6]" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button onClick={() => savePost('draft')} disabled={isSaving} className="px-8 py-4 border-2 border-gray-100 rounded-xl font-black text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <Save size={20} /> Save Draft
            </button>
            <button onClick={() => savePost('published')} disabled={isSaving} className="flex-1 bg-[#009cd6] text-white rounded-xl font-black text-lg py-4 flex items-center justify-center gap-3 hover:bg-[#008bc0] transition-transform active:scale-[0.98] shadow-lg shadow-blue-100">
              <Check size={24} /> Next: Upload Media
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">Featured Image</h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main Banner</span>
            </div>
            {featuredPreview ? (
              <div className="relative group overflow-hidden rounded-2xl shadow-inner bg-gray-50">
                <img src={featuredPreview} className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" alt="Featured" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => { setFeaturedPreview(null); setFeaturedFile(null); }} className="bg-white/90 text-red-600 px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-white transition-all">
                    <X size={20} /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-4 border-dashed border-gray-50 rounded-2xl p-20 flex flex-col items-center cursor-pointer hover:border-[#009cd6] hover:bg-blue-50/30 transition-all group">
                <div className="w-16 h-16 bg-blue-50 text-[#009cd6] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImagePlus size={32} />
                </div>
                <span className="text-lg font-bold text-gray-700">Select Banner Image</span>
                <span className="text-sm text-gray-400 mt-1 italic">Best size: 1200x600px</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFeaturedImage} />
              </label>
            )}
          </div>

          {/* Gallery Section */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">Gallery Collection</h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{galleryFiles.length} Images Added</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {galleryFiles.map((item) => (
                <div key={item.id} className="relative aspect-square group rounded-xl overflow-hidden shadow-sm">
                  <img src={item.preview} className="w-full h-full object-cover" alt="Gallery" />
                  <button onClick={() => setGalleryFiles((prev) => prev.filter((i) => i.id !== item.id))} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-4 border-dashed border-gray-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#009cd6] hover:bg-blue-50/30 transition-all">
                <ImagePlus size={28} className="text-gray-300" />
                <span className="text-[10px] font-black uppercase text-gray-400 mt-2">Add More</span>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleGalleryUpload} />
              </label>
            </div>
          </div>

          <div className="flex gap-6 pt-4">
            <button onClick={() => router.push('/admin/posts')} className="px-10 py-4 bg-gray-50 rounded-xl font-black text-gray-500 hover:bg-gray-100 transition-colors">Skip media</button>
            <button onClick={handleFinish} disabled={isSaving} className="flex-1 bg-gray-900 text-white rounded-xl font-black text-xl py-4 flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-[0.98]">
              {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} /> Complete & Finish</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
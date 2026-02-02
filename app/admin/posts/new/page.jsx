'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, ImagePlus, X } from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    featuredImage: null,
    galleryImages: []
  });
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleFeaturedImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFeaturedPreview(reader.result);
      setFormData({ ...formData, featuredImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = [];
    const newImages = [];
    let processedCount = 0;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Must be less than 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          id: Date.now() + Math.random(),
          name: file.name,
          url: reader.result
        });
        newImages.push(reader.result);
        processedCount++;

        if (processedCount === files.length) {
          setGalleryPreviews([...galleryPreviews, ...newPreviews]);
          setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...newImages] });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (id) => {
    const updatedPreviews = galleryPreviews.filter(img => img.id !== id);
    setGalleryPreviews(updatedPreviews);
    setFormData({ ...formData, galleryImages: updatedPreviews.map(img => img.url) });
  };

  const removeFeaturedImage = () => {
    setFeaturedPreview(null);
    setFormData({ ...formData, featuredImage: null });
  };

  const handleSubmit = async (status) => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter content');
      return;
    }

    if (!formData.featuredImage) {
      alert('Please upload a featured image');
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      alert(`Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      router.push('/admin/posts');
    }, 1000);
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/admin/posts" className="inline-flex items-center gap-2 text-[#009cd6] hover:text-[#0088bd] mb-4">
          <ArrowLeft size={20} />
          Back to Posts
        </Link>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Post</h2>
        <p className="text-gray-600">Write and publish your new article</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Featured Image (Main Image) *
            </label>
            <p className="text-xs text-gray-600 mb-4">Large image displayed at the top of the post</p>
            
            {featuredPreview ? (
              <div className="relative">
                <img src={featuredPreview} alt="Featured" className="w-full h-64 object-cover rounded-lg" />
                <button type="button" onClick={removeFeaturedImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#009cd6] transition-colors">
                <ImagePlus size={48} className="mx-auto text-gray-400 mb-4" />
                <input type="file" accept="image/*" onChange={handleFeaturedImageUpload} className="hidden" id="featured-upload" />
                <label htmlFor="featured-upload" className="cursor-pointer inline-block px-6 py-3 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors">
                  Choose Featured Image
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Post Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Empowering Livelihoods - Fishing Community" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] text-lg" maxLength={200} />
            <p className="text-xs text-gray-500 mt-2">{formData.title.length}/200</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Post Content *</label>
            <RichTextEditor content={formData.description} onChange={(html) => setFormData({ ...formData, description: html })} />
            <p className="text-xs text-gray-500 mt-2">{formData.description.replace(/<[^>]*>/g, '').length} characters</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images (Optional)</label>
            <p className="text-xs text-gray-600 mb-4">Additional images shown at the bottom</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#009cd6] transition-colors">
              {galleryPreviews.length > 0 ? (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {galleryPreviews.map((image) => (
                      <div key={image.id} className="relative group">
                        <img src={image.url} alt={image.name} className="w-full h-32 object-cover rounded-lg" />
                        <button type="button" onClick={() => removeGalleryImage(image.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryImagesUpload} className="hidden" id="gallery-upload-more" />
                  <label htmlFor="gallery-upload-more" className="cursor-pointer inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Add More Images</label>
                </div>
              ) : (
                <div>
                  <ImagePlus size={48} className="mx-auto text-gray-400 mb-4" />
                  <input type="file" accept="image/*" multiple onChange={handleGalleryImagesUpload} className="hidden" id="gallery-upload" />
                  <label htmlFor="gallery-upload" className="cursor-pointer inline-block px-6 py-3 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors">Choose Gallery Images</label>
                  <p className="text-sm text-gray-500 mt-2">Select multiple images (PNG, JPG up to 5MB each)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Publish</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button type="button" onClick={() => handleSubmit('draft')} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50">
                  <Save size={20} />Save Draft
                </button>
                <button type="button" onClick={() => handleSubmit('published')} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors font-semibold disabled:opacity-50">
                  <Eye size={20} />{isSaving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category *</h3>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]">
              <option value="">Select Category</option>
              <option value="Economic Development">Economic Development</option>
              <option value="Emergency Relief">Emergency Relief</option>
              <option value="Peace Building & Social Harmony">Peace Building & Social Harmony</option>
              <option value="Education">Education</option>
              <option value="Orphan Care">Orphan Care</option>
              <option value="Health & Nutrition">Health & Nutrition</option>
              <option value="Shelter">Shelter</option>
              <option value="Wash">Wash</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Post Date</h3>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]" />
          </div>
        </div>
      </div>
    </>
  );
}
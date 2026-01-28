'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const newPreviews = [];
    const newImages = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. File size must be less than 5MB`);
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

        // Update state after all files are processed
        if (newPreviews.length === files.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
          setFormData({ ...formData, images: [...formData.images, ...newImages] });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    const updatedPreviews = imagePreviews.filter(img => img.id !== id);
    setImagePreviews(updatedPreviews);
    setFormData({ ...formData, images: updatedPreviews.map(img => img.url) });
  };

  const handleSubmit = async (status) => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    setIsSaving(true);

    // TODO: Replace with actual API call
    // await fetch('/api/posts', { method: 'POST', body: JSON.stringify({ ...formData, status }) });

    setTimeout(() => {
      alert(`Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      router.push('/admin/posts');
    }, 1000);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 text-[#009cd6] hover:text-[#0088bd] mb-4"
        >
          <ArrowLeft size={20} />
          Back to Posts
        </Link>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Post</h2>
        <p className="text-gray-600">Write and publish your new article</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter post title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] text-lg"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-2">{formData.title.length}/200</p>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              content={formData.description}
              onChange={(html) => setFormData({ ...formData, description: html })}
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.description.replace(/<[^>]*>/g, '').length} characters
            </p>
          </div>

          {/* Featured Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Featured Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#009cd6] transition-colors">
              {imagePreviews.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-more"
                  />
                  <label
                    htmlFor="image-upload-more"
                    className="cursor-pointer inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Add More Images
                  </label>
                </div>
              ) : (
                <div>
                  <ImagePlus size={48} className="mx-auto text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-block px-6 py-3 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors"
                  >
                    Choose Images
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB (Multiple images allowed)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Publish</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                >
                  <Save size={20} />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors font-semibold disabled:opacity-50"
                >
                  <Eye size={20} />
                  Publish
                </button>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category</h3>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6]"
            >
              <option value="">Select Category</option>
              <option value="events">Events</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="environment">Environment</option>
              <option value="community">Community</option>
            </select>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Writing Tips</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Use a clear, descriptive title</li>
              <li>• Add relevant images to engage readers</li>
              <li>• Break content into paragraphs</li>
              <li>• Use headings to organize content</li>
              <li>• Proofread before publishing</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
'use client';

import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function QuickPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    setIsPublishing(true);

    // TODO: Replace with actual API call when backend is ready
    // Example: await fetch('/api/posts', { method: 'POST', body: JSON.stringify({ title, description, image: uploadedImage }) });
    
    // Simulate API call
    setTimeout(() => {
      alert('Post published successfully!');
      setTitle('');
      setDescription('');
      setUploadedImage(null);
      setIsPublishing(false);
    }, 1000);
  };

  const handleSaveDraft = () => {
    if (!title.trim() && !description.trim()) {
      alert('Please enter at least a title or description');
      return;
    }

    // TODO: Add draft save logic
    alert('Draft saved successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Post</h2>

      <div className="space-y-4">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Enter post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] focus:border-transparent"
          maxLength={200}
        />

        {/* Rich Text Editor */}
        <div>
          <RichTextEditor
            content={description}
            onChange={setDescription}
          />
          <p className="text-xs text-gray-500 mt-2">
            {description.replace(/<[^>]*>/g, '').length} characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <ImagePlus size={20} />
            <span>Upload Image</span>
          </label>

          {uploadedImage && (
            <div className="mt-4 relative inline-block">
              <img
                src={uploadedImage}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
              <p className="text-sm text-gray-600 mt-2">Image preview</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 bg-[#009cd6] text-white py-3 rounded-lg font-semibold hover:bg-[#0088bd] transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isPublishing}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
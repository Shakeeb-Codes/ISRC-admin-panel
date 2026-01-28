'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Grid, List, Trash2, Download, X } from 'lucide-react';

export default function MediaPage() {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [searchQuery, media]);

  const loadMedia = async () => {
    setLoading(true);
    // Start with empty array - user will upload images
    setMedia([]);
    setFilteredMedia([]);
    setLoading(false);
  };

  const filterMedia = () => {
    if (searchQuery.trim()) {
      const filtered = media.filter(item =>
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedia(filtered);
    } else {
      setFilteredMedia(media);
    }
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newMedia = {
          id: Date.now() + Math.random(),
          filename: file.name,
          url: reader.result,
          type: file.type,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          uploadedBy: 'Admin User',
          uploadedAt: 'Just now',
          usedIn: [],
          alt: file.name.split('.')[0]
        };

        console.log('Uploaded image:', newMedia); // Debug log
        setMedia(prevMedia => [newMedia, ...prevMedia]);
        alert(`${file.name} uploaded successfully!`);
      };

      reader.onerror = () => {
        alert(`Failed to read ${file.name}`);
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleDelete = (mediaId, filename) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      setMedia(media.filter(item => item.id !== mediaId));
      setSelectedMedia(null);
      alert('Media deleted successfully!');
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Media Library</h2>
            <p className="text-gray-600">Manage your images and media files</p>
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors font-semibold shadow-md hover:shadow-lg cursor-pointer"
            >
              <Upload size={20} />
              Upload Media
            </label>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-1">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-700"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-4'}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={viewMode === 'grid' ? 'aspect-square bg-gray-200 rounded-lg animate-pulse' : 'h-20 bg-gray-200 rounded-lg animate-pulse'}></div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <Upload size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery ? 'No media found matching your search' : 'No media files yet. Start uploading!'}
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="media-upload-empty"
          />
          <label
            htmlFor="media-upload-empty"
            className="inline-flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors cursor-pointer"
          >
            <Upload size={20} />
            Upload Your First Media
          </label>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="rounded-lg overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-[#009cd6] transition-all group relative bg-gray-100"
              style={{ paddingBottom: '100%', position: 'relative' }}
            >
              <img
                src={item.url}
                alt={item.alt || item.filename}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.error('Image failed to load:', item.url);
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#666;font-size:12px;padding:8px;text-align:center;">Failed to load<br/>Click to see details</div>';
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', item.filename);
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center truncate w-full">
                  {item.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.alt || item.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">Failed</div>';
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{item.filename}</h3>
                  <p className="text-sm text-gray-600">
                    {item.size} • Uploaded by {item.uploadedBy} • {item.uploadedAt}
                  </p>
                  {item.usedIn && item.usedIn.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Used in: {item.usedIn.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(item.url, item.filename)}
                    className="p-2 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.filename)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{selectedMedia.filename}</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt}
                  className="max-w-full max-h-[500px] rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-red-500 p-4">Failed to load image. The image data may be corrupted.</div>';
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="font-semibold">{selectedMedia.size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Uploaded By</p>
                  <p className="font-semibold">{selectedMedia.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upload Date</p>
                  <p className="font-semibold">{selectedMedia.uploadedAt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold">{selectedMedia.type}</p>
                </div>
              </div>

              {selectedMedia.usedIn && selectedMedia.usedIn.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Used In</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedia.usedIn.map((post, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {post}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedMedia.url, selectedMedia.filename)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors"
                >
                  <Download size={20} />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(selectedMedia.id, selectedMedia.filename)}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={20} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
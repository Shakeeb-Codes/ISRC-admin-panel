'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MediaGrid({ limit = 6, showHeader = true }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    // Start with empty array - images will be added when user uploads
    // When you get API endpoints, replace this with: const data = await fetch('/api/media');
    setMedia([]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        {showHeader && (
          <h2 className="text-xl font-bold text-gray-800 mb-6">Media Library</h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {showHeader && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Media Library</h2>
          <Link
            href="/admin/media"
            className="px-6 py-2 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors font-semibold"
          >
            View All →
          </Link>
        </div>
      )}

      {media.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No media files yet.</p>
          <Link
            href="/admin/media"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors"
          >
            Upload Media
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden hover:opacity-75 transition-opacity cursor-pointer border-2 border-transparent hover:border-[#009cd6] group relative bg-gray-100"
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
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                  {item.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
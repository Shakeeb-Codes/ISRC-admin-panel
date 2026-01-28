'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { getRecentPosts } from '@/lib/dummyData';

export default function RecentPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getRecentPosts(5);
    setPosts(data);
    setLoading(false);
  };

  const handleEdit = (postId) => {
    // TODO: Navigate to edit page or open edit modal
    window.location.href = `/admin/posts/${postId}/edit`;
  };

  const handleDelete = (postId, postTitle) => {
    if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      // TODO: Add delete API call
      setPosts(posts.filter(post => post.id !== postId));
      alert('Post deleted successfully!');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Posts</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Posts</h2>
        <Link 
          href="/admin/posts"
          className="text-[#009cd6] hover:text-[#0088bd] font-semibold text-sm"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No posts yet. Create your first post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#009cd6] transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Post Image */}
                {post.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Post Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {post.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-4">
                    <span>{post.createdAt}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(post.id)}
                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
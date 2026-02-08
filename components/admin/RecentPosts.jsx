'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { getRecentPosts } from '@/lib/dummyData';

export default function RecentPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('staff');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadPosts();
    
    // Get user role and email
    const role = localStorage.getItem('userRole') || 'staff';
    const email = localStorage.getItem('userEmail') || '';
    setUserRole(role);
    setUserEmail(email);
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getRecentPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleDelete = (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      // TODO: Replace with API call
      // await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      
      setPosts(posts.filter((post) => post.id !== id));
      alert('Post deleted successfully!');
    }
  };

  // Check if user can edit/delete this post
  const canModifyPost = (post) => {
    // Admin can modify all posts
    if (userRole === 'admin') return true;
    
    // Staff can only modify their own posts
    return post.author === userEmail;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Posts</h2>
        <Link
          href="/admin/posts"
          className="text-[#009cd6] hover:text-[#0088bd] font-semibold text-sm transition-colors"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <Link
            href="/admin/posts/new"
            className="inline-block px-6 py-2 bg-[#009cd6] text-white rounded-lg hover:bg-[#0088bd] transition-colors"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const canModify = canModifyPost(post);
            
            return (
              <div
                key={post.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                {/* Post Image */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />

                {/* Post Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{post.createdAt}</span>
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {canModify ? (
                    <>
                      <button
                        onClick={() => alert('Edit feature coming soon!')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-gray-50 text-gray-400 rounded-lg text-xs">
                      <span>No access</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
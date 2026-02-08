'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { getAllPosts } from '@/lib/dummyData';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  useEffect(() => {
    filterPosts();
  }, [searchQuery, filterStatus, posts]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getAllPosts();
    setPosts(data);
    setFilteredPosts(data);
    setLoading(false);
  };

  const filterPosts = () => {
    let filtered = posts;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((post) => post.status === filterStatus);
    }

    setFilteredPosts(filtered);
  };

  const handleDelete = async (id, title) => {
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
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Posts</h2>
            <p className="text-gray-600">Manage your blog posts and articles</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Create New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-1">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-700"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery || filterStatus !== 'all'
              ? 'No posts found matching your criteria'
              : 'No posts yet. Create your first post!'}
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors"
          >
            <Plus size={20} />
            Create New Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const canModify = canModifyPost(post);
            
            return (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Post Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Post Content */}
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>By {post.author}</span>
                    <span>{post.createdAt}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Eye size={16} />
                      View
                    </button>
                    
                    {canModify ? (
                      <>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-xs">
                        <span>No edit access</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
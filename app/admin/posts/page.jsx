"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Edit2, Trash2, Eye } from "lucide-react";
import { getAllPosts } from "@/lib/dummyData";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadPosts();
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
    let filtered = [...posts];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (post) => post.status.toLowerCase() === filterStatus.toLowerCase(),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredPosts(filtered);
  };

  const handleDelete = (postId, postTitle) => {
    if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      setPosts(posts.filter((post) => post.id !== postId));
      alert("Post deleted successfully!");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Posts</h2>
            <p className="text-gray-600">
              Manage all your blog posts and articles
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            New Post
          </Link>
        </div>

        {/* Filters and Search */}
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
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#009cd6]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery || filterStatus !== "all"
              ? "No posts found matching your filters"
              : "No posts yet. Create your first post!"}
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
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-6">
                {/* Post Image */}
                {post.image && (
                  <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {post.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.createdAt}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

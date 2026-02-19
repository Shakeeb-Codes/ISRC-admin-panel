'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { graphqlRequest } from '@/lib/api';

// Dynamically construct the image path using your .env variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
const BASE_DOMAIN = API_URL.replace('/graphql', ''); 
const IMAGE_BASE_URL = `${BASE_DOMAIN}/uploads/posts/`;

const GET_RECENT_POSTS_QUERY = `
  query {
    getCategories {
      title
      posts {
        id
        title
        content
        status
        banner_image
      }
    }
  }
`;

export default function RecentPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('staff');

  useEffect(() => {
    loadPosts();
    const role = localStorage.getItem('userRole') || 'staff';
    setUserRole(role);
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const result = await graphqlRequest(GET_RECENT_POSTS_QUERY);
      if (result?.getCategories) {
        const allPosts = result.getCategories.flatMap(cat => 
          (cat.posts || []).map(p => ({
            ...p,
            categoryName: cat.title,
            image: p.banner_image 
              ? `${IMAGE_BASE_URL}${p.banner_image}` 
              : 'https://via.placeholder.com/150?text=No+Image',
            description: p.content ? p.content.replace(/<[^>]*>/g, '').substring(0, 80) : ''
          }))
        );

        const recent = allPosts
          .sort((a, b) => Number(b.id) - Number(a.id))
          .slice(0, 3);

        setPosts(recent);
      }
    } catch (error) {
      console.error("Failed to load recent posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Posts</h2>
        <Link
          href="/admin/posts"
          className="text-[#009cd6] hover:underline font-bold text-sm"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#009cd6]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4 text-sm">No posts found.</p>
          <Link href="/admin/posts/new" className="text-sm font-bold text-[#009cd6]">Create One</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex gap-4 p-3 border border-transparent hover:border-gray-100 hover:bg-gray-50 rounded-xl transition-all group"
            >
              {/* Image Preview using constructed URL */}
              <img
                src={post.image}
                alt={post.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate text-sm">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                  {post.description}...
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
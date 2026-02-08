'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // TODO: Replace with actual API call when backend is ready
    // Example: const response = await fetch('/api/auth/login', { 
    //   method: 'POST', 
    //   body: JSON.stringify(formData) 
    // });

    // Simulate API call
    setTimeout(() => {
      let userFound = false;
      let userRole = '';
      let userName = '';

      // Check if admin
      if (formData.email === 'mail@isrclanka.org' && formData.password === 'admin123') {
        userFound = true;
        userRole = 'admin';
        userName = 'Admin User';
      } else {
        // Check if staff (from localStorage)
        const staffCredentials = JSON.parse(localStorage.getItem('staffCredentials') || '[]');
        const staffUser = staffCredentials.find(
          s => s.email === formData.email && s.password === formData.password
        );

        if (staffUser) {
          userFound = true;
          userRole = 'staff';
          userName = staffUser.name;
        }
      }

      if (userFound) {
        // Store authentication
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userRole', userRole);
        
        // Redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#009cd6] to-[#0088bd] p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img src="/images/logo.png" alt="ISRC Logo" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ISRC Sri Lanka</h1>
            <p className="text-gray-600">Admin Panel</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] focus:border-transparent transition-all pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#009cd6] border-gray-300 rounded focus:ring-[#009cd6]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#009cd6] hover:text-[#0088bd] font-semibold transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#009cd6] text-white py-3 rounded-lg font-semibold hover:bg-[#0088bd] transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm">
            © {new Date().getFullYear()} ISRC Sri Lanka. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
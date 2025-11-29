'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCommunityPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    communityName: '',
    description: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    communityName: '',
    description: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    const newErrors = {
      communityName: '',
      description: '',
      password: '',
      confirmPassword: ''
    };

    if (!formData.communityName.trim()) {
      newErrors.communityName = 'Community name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    // If no errors, proceed with API call
    if (!Object.values(newErrors).some(error => error !== '')) {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/communities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.communityName,
            description: formData.description,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert('Community created successfully! 🎉');
          router.push('/chats');
        } else {
          // Show error from backend
          alert(data.error || 'Failed to create community');
        }
      } catch (error) {
        console.error('Error creating community:', error);
        alert('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: "url('/background_6.gif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        className="w-full flex justify-between items-center px-3 py-1 bg-[#1b1b1b] text-white pixel-font border-b-4 border-black shadow-md z-30"
      >
        <div className="text-2xl font-bold">DEV TALKS</div>

        <div className="flex gap-4 text-sm">
          <button
            className="px-3 py-1 bg-[#1b1b1b] text-white border-4 border-black pixel-font hover:bg-[#333]"
            onClick={() => router.push('/home')}
          >
            HOME
          </button>
        </div>
      </nav>

      {/* CREATE COMMUNITY FORM */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8 px-4 relative z-20">
        <div className="w-full max-w-2xl bg-black/85 backdrop-blur-sm border-4 border-white rounded-lg p-8 pixel-font">
          <h1 className="text-3xl text-white mb-2 text-center drop-shadow-neon">CREATE COMMUNITY</h1>
          <p className="text-xs text-gray-400 text-center mb-8">Fill in the details to create your dev community</p>

          <div className="space-y-6">
            {/* Community Name */}
            <div>
              <label htmlFor="communityName" className="block text-white text-sm mb-2">
                COMMUNITY NAME *
              </label>
              <input
                type="text"
                id="communityName"
                name="communityName"
                value={formData.communityName}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Enter community name..."
              />
              {errors.communityName && (
                <p className="text-red-400 text-xs mt-1">{errors.communityName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-white text-sm mb-2">
                DESCRIPTION *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                placeholder="Describe your community..."
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-white text-sm mb-2">
                COMMUNITY PASSWORD *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Enter password for members to join..."
              />
              <p className="text-gray-500 text-xs mt-1">Members will need this password to join</p>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white text-sm mb-2">
                CONFIRM PASSWORD *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Re-enter password..."
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.push('/chats')}
                className="flex-1 px-6 py-3 bg-gray-700 text-white pixel-font border-4 border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-cyan-600 text-white pixel-font border-4 border-cyan-400 rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'CREATING...' : 'CREATE'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }

        .drop-shadow-neon {
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.8), 0 0 16px rgba(0, 255, 255, 0.5);
        }

        @media (max-width: 640px) {
          h1 { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
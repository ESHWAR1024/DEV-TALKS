'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

export default function ChatsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch user's joined communities
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserCommunities();
    }
  }, [status]);

  const fetchUserCommunities = async () => {
    try {
      const response = await fetch('/api/communities/my-communities');
      const data = await response.json();
      
      if (data.success) {
        setCommunities(data.data);
      } else {
        console.error('Failed to fetch communities:', data.error);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter communities based on search
  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate avatar emoji based on community name
  const getAvatar = (name: string) => {
    const avatars = ['🎮', '💬', '⛓️', '🤖', '💡', '🔒', '🚀', '⚡', '🌟', '🔥'];
    const index = name.length % avatars.length;
    return avatars[index];
  };

  // Format time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl pixel-font">LOADING...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: "url('/background_2.gif')",
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

          <button
            className="px-3 py-1 bg-[#1b1b1b] text-white border-4 border-black pixel-font hover:bg-[#333]"
            onClick={() => router.push('/browse_community')}
          >
            BROWSE COMMUNITIES
          </button>

          <button
            className="px-3 py-1 bg-[#ffd84d] text-black border-4 border-black pixel-font hover:bg-[#ffe78c]"
            onClick={() => router.push('/create_community')}
          >
            CREATE COMMUNITY
          </button>
        </div>
      </nav>

      {/* CHAT SIDEBAR */}
      <div className="absolute left-8 top-24 bottom-8 w-[400px] bg-[#111111] border-4 border-black rounded-lg overflow-hidden z-20">
        {/* Sidebar Header */}
        <div className="bg-[#1f1f1f] p-4 border-b-4 border-black">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white text-xl pixel-font">MY COMMUNITIES</h2>
            {session && (
              <span className="text-cyan-400 text-xs pixel-font">{session.user?.name}</span>
            )}
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-white"
          />
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-full">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-400 text-sm pixel-font">Loading...</p>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 px-4">
              <p className="text-gray-400 text-sm pixel-font text-center mb-4">
                {searchQuery ? 'No communities found' : 'No communities joined yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push('/browse_community')}
                  className="px-4 py-2 bg-cyan-600 text-white text-xs pixel-font border-2 border-cyan-400 rounded hover:bg-cyan-500"
                >
                  BROWSE COMMUNITIES
                </button>
              )}
            </div>
          ) : (
            filteredCommunities.map((community) => (
              <div
                key={community._id}
                className="flex items-center gap-3 p-4 border-b-2 border-gray-800 hover:bg-[#1f1f1f] cursor-pointer transition-colors"
                onClick={() => router.push(`/community/${community._id}`)}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-2xl border-2 border-gray-700 flex-shrink-0">
                  {getAvatar(community.name)}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white text-sm pixel-font truncate">{community.name}</h3>
                    <span className="text-gray-500 text-xs pixel-font ml-2 flex-shrink-0">
                      {formatDate(community.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{community.description}</p>
                  <p className="text-gray-500 text-xs pixel-font mt-1">
                    👥 {community.memberCount} members
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }

        .drop-shadow-neon {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.9), 0 0 14px rgba(255, 255, 255, 0.7);
        }

        .drop-shadow-white {
          text-shadow: 0 0 6px rgba(255,255,255,0.85);
        }

        @media (max-width: 640px) {
          h1 { font-size: 28px; }
          p { font-size: 12px; }
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #1f1f1f;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
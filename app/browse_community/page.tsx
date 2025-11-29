'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

export default function BrowseCommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Fetch communities on load
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities');
      const data = await response.json();
      
      if (data.success) {
        setCommunities(data.data);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityClick = (community: Community) => {
    setSelectedCommunity(community);
    setShowModal(true);
    setPassword('');
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCommunity(null);
    setPassword('');
    setError('');
  };

  const handleJoin = async () => {
    if (!password) {
      setError('Please enter the password');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const response = await fetch('/api/communities/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId: selectedCommunity?._id,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Successfully joined community! 🎉');
        handleCloseModal();
        // Here you would typically redirect to the community chat
        router.push('/chats');
      } else {
        setError(data.error || 'Failed to join community');
      }
    } catch (error) {
      console.error('Error joining community:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: "url('/background_7.gif')",
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
            className="px-3 py-1 bg-[#ffd84d] text-black border-4 border-black pixel-font hover:bg-[#ffe78c]"
            onClick={() => router.push('/create-community')}
          >
            CREATE COMMUNITY
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-20 px-8 pb-8 relative z-20">
        <div className="mb-6">
          <h1 className="text-3xl text-white pixel-font drop-shadow-neon mb-2">BROWSE COMMUNITIES</h1>
          <p className="text-#28282B-400 text-xs pixel-font">Join communities and start collaborating</p>
        </div>

        {loading ? (
          <div className="text-white text-center text-xl pixel-font">LOADING...</div>
        ) : communities.length === 0 ? (
          <div className="text-white text-center text-xl pixel-font">No communities yet. Create one!</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {communities.map((community) => (
              <div
                key={community._id}
                onClick={() => handleCommunityClick(community)}
                className="bg-[#181818] rounded-lg p-4 cursor-pointer hover:bg-[#282828] transition-all border-2 border-gray-800 hover:border-cyan-400"
              >
                {/* Community Image/Icon */}
                <div className="w-full aspect-square bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">💬</span>
                </div>

                {/* Community Info */}
                <h3 className="text-white text-sm pixel-font mb-2 truncate">{community.name}</h3>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{community.description}</p>
                <p className="text-gray-500 text-xs pixel-font">{community.memberCount} members</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border-4 border-white rounded-lg p-8 max-w-md w-full pixel-font">
            <h2 className="text-2xl text-white mb-4 drop-shadow-neon">{selectedCommunity.name}</h2>
            
            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-4">{selectedCommunity.description}</p>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>👥 {selectedCommunity.memberCount} members</span>
                <span>📅 {new Date(selectedCommunity.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm mb-2">ENTER PASSWORD TO JOIN:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400"
                placeholder="Enter password..."
              />
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCloseModal}
                disabled={isJoining}
                className="flex-1 px-6 py-3 bg-gray-700 text-white pixel-font border-4 border-gray-600 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="flex-1 px-6 py-3 bg-cyan-600 text-white pixel-font border-4 border-cyan-400 rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50"
              >
                {isJoining ? 'JOINING...' : 'JOIN'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }

        .drop-shadow-neon {
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.8), 0 0 16px rgba(0, 255, 255, 0.5);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          h1 { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
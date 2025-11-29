'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function ChatsPage() {
  const router = useRouter();

  const communities = [
    {
      name: "Game Dev",
      lastMessage: "Abhi-san: read the updated story folder for corre...",
      time: "7:42 pm",
      avatar: "🎮"
    },
    {
      name: "BACKCHODI COMMUNITY",
      lastMessage: "~ anirudh r: Cool cool thanks",
      time: "6:45 pm",
      avatar: "😎"
    },
    {
      name: "Web3 Builders",
      lastMessage: "Reacted ❤️ to: \"gm frens\"",
      time: "6:20 pm",
      avatar: "⛓️"
    },
    {
      name: "AI/ML Enthusiasts",
      lastMessage: "Sarah: How much time will it take to complete...",
      time: "5:58 pm",
      avatar: "🤖"
    },
    {
      name: "Indie Hackers",
      lastMessage: "Just shipped v2.0! 🚀",
      time: "4:32 pm",
      avatar: "💡"
    },
    {
      name: "Cybersecurity",
      lastMessage: "New vulnerability discovered in...",
      time: "3:15 pm",
      avatar: "🔒"
    }
  ];

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
          <h2 className="text-white text-xl pixel-font mb-3">COMMUNITIES</h2>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-white"
          />
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-full">
          {communities.map((community, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 border-b-2 border-gray-800 hover:bg-[#1f1f1f] cursor-pointer transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center text-2xl border-2 border-gray-700 flex-shrink-0">
                {community.avatar}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-white text-sm pixel-font truncate">{community.name}</h3>
                  <span className="text-gray-500 text-xs pixel-font ml-2 flex-shrink-0">{community.time}</span>
                </div>
                <p className="text-gray-400 text-xs truncate">{community.lastMessage}</p>
              </div>
            </div>
          ))}
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
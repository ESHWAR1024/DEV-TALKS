'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();

  const handleGoToChats = () => {
    router.push('/chats');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login"); 
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: "url('/background.gif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{ position: 'absolute', top: 0, left: 0, right: 0, imageRendering: 'pixelated' }}
        className="w-full flex justify-between items-center px-3 py-1 bg-[#1b1b1b] text-white pixel-font border-b-4 border-black shadow-md z-30"
      >
        <div className="text-2xl font-bold">DEV TALKS</div>

        <div className="flex gap-4 text-sm">

          <button 
            onClick={() => router.push('/home')}
            className="px-3 py-1 bg-[#1b1b1b] text-white border-4 border-black pixel-font hover:bg-[#333]"
            style={{ imageRendering: 'pixelated' }}
          >
            HOME
          </button>

          <button 
            onClick={() => router.push('/about')}
            className="px-3 py-1 bg-[#1b1b1b] text-white border-4 border-black pixel-font hover:bg-[#333]"
            style={{ imageRendering: 'pixelated' }}
          >
            ABOUT
          </button>

          <button 
            onClick={() => router.push('/contact')}
            className="px-3 py-1 bg-[#1b1b1b] text-white border-4 border-black pixel-font hover:bg-[#333]"
            style={{ imageRendering: 'pixelated' }}
          >
            CONTACT
          </button>

          {/* LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 text-white border-4 border-black pixel-font hover:bg-red-700"
            style={{ imageRendering: 'pixelated' }}
          >
            LOGOUT
          </button>

        </div>
      </nav>

      {/* CENTER AREA */}
      <div className="flex items-center justify-center h-[70vh] pt-20 relative z-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl text-white pixel-font drop-shadow-neon" style={{ imageRendering: 'pixelated' }}>
            DEV TALKS
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-white pixel-font drop-shadow-white" style={{ imageRendering: 'pixelated' }}>
            Where Developers
            <br />
            Brainstorm Ideas
          </p>
        </div>
      </div>

      {/* BUTTON AT BOTTOM */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
        <button 
          onClick={handleGoToChats}
          className="px-6 py-3 bg-black text-white pixel-font border-4 border-white rounded-lg hover:bg-gray-800"
          style={{ imageRendering: 'pixelated' }}
        >
          GO TO DISCUSSIONS
        </button>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }

        .drop-shadow-neon {
          text-shadow: 0 0 8px rgba(255, 0, 255, 0.85), 0 0 18px rgba(255, 0, 255, 0.6);
        }

        .drop-shadow-white {
          text-shadow: 0 0 6px rgba(255,255,255,0.85);
        }

        @media (max-width: 640px) {
          h1 { font-size: 28px; }
          p { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}

'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();


  

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: "url('/background_4.gif')",
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
            onClick={() => router.push('/about')}
          >
            ABOUT
          </button>

          <button
            className="px-3 py-1 bg-[#1b1b1b] text-white border-4 border-black pixel-font hover:bg-[#333]"
            onClick={() => router.push('/contact')}
          >
            CONTACT
          </button>
        </div>
      </nav>

      {/* CENTER CONTENT WITH BLACK CARD */}
      <div className="flex items-center justify-center h-[80vh] pt-40 relative z-20">
        <div className="text-center w-full relative px-4">
          {/* Black Card with About Info */}
          <div className="max-w-3xl mx-auto bg-black/80 backdrop-blur-sm border-4 border-white rounded-lg p-8 pixel-font">
            <h2 className="text-2xl md:text-3xl text-white mb-6 drop-shadow-neon">About Dev Talks</h2>
            
            <p className="text-white text-sm md:text-base leading-relaxed mb-8">
              Dev Talks is a private collaboration space designed specifically for developer teams.
It allows members to share ideas, discuss them in structured threads, react with feedback, and vote on which concepts move forward.
Communities are protected with passwords, ensuring that only your trusted team participates.

Ideas flow through a simple lifecycle—proposed, under review, approved, or discarded—making decision-making fast and organized.
With a retro pixel aesthetic and distraction-free design, Dev Talks keeps your team's focus exactly where it belongs: building great projects together.
            </p>

            <div className="border-t-2 border-white/30 pt-6">
              <p className="text-white text-sm md:text-base mb-4">
                THANK YOU FOR USING THIS SITE
              </p>
              
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 text-xs"></span>
                  <a 
                    href="mailto:eshwar10245@gmail.com" 
                    className="text-white text-xs hover:text-cyan-400 transition-colors"
                  >
                    
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 text-xs"></span>
                  <a 
                    href="https://github.com/ESHWAR1024" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-xs hover:text-cyan-400 transition-colors"
                  >
                    
                  </a>
                </div>
              </div>
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
          h1 { font-size: 28px; }
          p { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
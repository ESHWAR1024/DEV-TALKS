'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: "url('/background_3.gif')",
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

      {/* CENTER CONTENT */}
      <div className="flex items-center justify-center h-[80vh] pt-40 relative z-20">
        <div className="text-center w-full relative px-4">
          
          {/* MAIN CARD */}
          <div className="max-w-3xl mx-auto bg-black/80 backdrop-blur-sm border-4 border-white rounded-lg p-8 pixel-font">

            <h2 className="text-2xl md:text-3xl text-white mb-6 drop-shadow-neon">
              DEV TALKS DEVELOPER
            </h2>

            <p className="text-white text-sm md:text-base leading-relaxed mb-8">
              Hey guys! I AM ESHWAR, the developer of this small website for discussing your ideas and arranging them efficiently.
            </p>

            {/* CONTACT SECTION */}
            <div className="border-t-2 border-white/30 pt-6">
              <p className="text-white text-sm md:text-base mb-4">
                You can drop suggestions here:
              </p>

              {/* GIF + CONTACT ROW */}
              <div className="flex items-start gap-6 max-w-xl mx-auto">

                {/* GIF FRAME (bigger + aligned left) */}
                <div className="border-4 border-white rounded-lg w-28 h-28 overflow-hidden bg-black shadow-lg">
                  <img
                    src="/owner_1.gif"
                    alt="Developer GIF"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* CONTACT INFO */}
                <div className="space-y-4 text-left flex-1">
                  <div className="flex items-center gap-3">
                    <br></br>
                    <span className="text-cyan-400 text-xs">EMAIL:</span>
                    <a
                      href="mailto:eshwar10245@gmail.com"
                      className="text-white text-xs hover:text-cyan-400 transition-colors"
                    >
                    









                      eshwar10245@gmail.com
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <br></br>
                    <span className="text-cyan-400 text-xs">GITHUB:</span>
                    <a
                      href="https://github.com/ESHWAR1024"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-xs hover:text-cyan-400 transition-colors"
                    >
                      ESHWAR1024
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }

        .drop-shadow-neon {
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.8), 0 0 16px rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

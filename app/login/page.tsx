'use client';

import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/* -------------------------------------------
   COMPONENT: Background Wrapper 
-------------------------------------------- */
function BackgroundWrapper({
  src,
  children,
}: {
  src: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('${src}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------
   LOGIN PAGE
-------------------------------------------- */
export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const name = e.target.name.value;
    const password = e.target.password.value;

    // NextAuth login
    const res = await signIn("credentials", {
      redirect: false,
      name,
      password,
    });

    if (!res?.error) {
      router.push("/home"); // redirect to your homepage
    } else {
      alert("Invalid name or password");
    }
  };

  return (
    <>
      {/* Use Background Wrapper — add your GIF here */}
      <BackgroundWrapper src="/background_5.gif">
        <div className="relative z-10 flex flex-col items-center p-8 rounded-lg bg-black border border-white shadow-2xl">
          
          {/* Pixelated Title */}
          <h1 className="text-4xl mb-6 font-bold tracking-wider pixel-font border-4 border-white p-4 pixelated-box text-white">
            DEV TALKS
          </h1>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              className="px-4 py-2 bg-black border border-white text-white pixel-font"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              className="px-4 py-2 bg-black border border-white text-white pixel-font"
              required
            />

            <button
              type="submit"
              className="mt-4 py-2 px-4 bg-white text-black font-bold pixel-font border border-black hover:bg-gray-200"
            >
              LOGIN
            </button>
          </form>
        </div>
      </BackgroundWrapper>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }

        .pixelated-box {
          image-rendering: pixelated;
          box-shadow: 0 0 0 6px #fff, inset 0 0 0 6px #fff;
        }

        @media (max-width: 480px) {
          .pixel-font { font-size: 10px; }
          .pixelated-box { padding: 8px; }
        }
      `}</style>
    </>
  );
}

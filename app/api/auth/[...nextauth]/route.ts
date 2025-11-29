import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

























export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        await connectDB();
        const { name, password } = credentials;

        let user = await User.findOne({ name });

        if (!user) {
          const hashed = await bcrypt.hash(password, 10);
          user = await User.create({
            name,
            password: hashed,
          });
          return { id: user._id.toString(), name: user.name };
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user._id.toString(), name: user.name };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
      }
      return session;
    }
  },

  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
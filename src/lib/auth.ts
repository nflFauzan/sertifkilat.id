import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import authConfig from "./auth.config";

const adapter = PrismaAdapter(prisma);
const originalCreateUser = adapter.createUser;
if (originalCreateUser) {
  adapter.createUser = async (data) => {
    // Generate a secure placeholder password since database schema has it as non-nullable
    const placeholderPassword = await bcrypt.hash(Math.random().toString(36), 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userToCreate: any = {
      ...data,
      password: placeholderPassword,
    };
    return originalCreateUser(userToCreate);
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  debug: true,
  logger: {
    error(error) {
      console.error("NextAuth Error:", error);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth Debug:", code, metadata);
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-client-secret",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          plan: user.plan,
        };
      },
    }),
  ],
});

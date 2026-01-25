import 'dotenv/config'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [];
const isProd = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },
  

  user:{
    deleteUser:{enabled:true},
    
  },


  trustedOrigins,
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,

  advanced: {
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          path: '/',
        }
      }
    }
  }
});

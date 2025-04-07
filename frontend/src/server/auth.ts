import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "~/env";
import { cookies } from "next/headers";
import { authSchema } from "~/validation/auth";
import { axiosInstance } from "~/lib/axios-instance";

class UserExistsError extends CredentialsSignin {
  code = "UserExists";
}

class RegisterFailedError extends CredentialsSignin {
  code = "RegisterFailed";
}

class LoginFailedError extends CredentialsSignin {
  code = "LoginFailed";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials) {
        const action = credentials?.action;
        const { username, password } = await authSchema.parseAsync(credentials);

        if (action === "register") {
          const { data: response, status } = await axiosInstance({
            url: "/v1/auth/register",
            method: "POST",
            data: {
              username,
              password,
            },
          });

          if (status !== 200) {
            if (status === 409) {
              throw new UserExistsError("UserExists");
            }
            throw new RegisterFailedError("RegisterFailed");
          }

          (await cookies()).set("token", response.payload.token);

          return {
            id: response.payload.id,
            name: response.payload.username,
            image: response.payload.image,
          };
        }

        const { data: response, status } = await axiosInstance({
          url: "/v1/auth/login",
          method: "POST",
          data: {
            username,
            password,
          },
        });

        if (status !== 200) {
          throw new LoginFailedError("LoginFailed");
        }

        (await cookies()).set("token", response.payload.token);

        return {
          id: response.payload.id,
          name: response.payload.username,
          image: response.payload.image,
        };
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      if (!(await cookies()).get("token")) {
        return false;
      }

      const isLoggedIn = !!auth?.user;
      const isOnAuth = request.nextUrl.pathname.startsWith("/auth");

      if (!isOnAuth) {
        return isLoggedIn;
      }

      if (isLoggedIn && isOnAuth) {
        return false;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) Object.assign(token, user);

      if (trigger === "update") {
        token = { ...token, ...session };
      }

      const { exp, iat, jti, ...restToken } = token;
      return restToken;
    },

    async session({ session, token }) {
      Object.assign(session.user, token);
      return session;
    },
  },
});

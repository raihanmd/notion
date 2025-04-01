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
        // try {
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

          // const response = await fetch(
          //   `${env.NEXT_PUBLIC_API_URL}/v1/auth/register`,
          //   {
          //     body: JSON.stringify({
          //       username,
          //       password,
          //     }),
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     method: "POST",
          //   },
          // );

          if (status !== 200) {
            if (status === 409) {
              throw new UserExistsError("UserExists");
            }
            throw new RegisterFailedError("RegisterFailed");
          }

          // const data = await response.json();

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

        // const response = await fetch(
        //   `${env.NEXT_PUBLIC_API_URL}/v1/auth/login`,
        //   {
        //     body: JSON.stringify({
        //       username,
        //       password,
        //     }),
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     method: "POST",
        //   },
        // );

        if (status !== 200) {
          throw new LoginFailedError("LoginFailed");
        }

        // const data = await response.json();

        (await cookies()).set("token", response.payload.token);

        return {
          id: response.payload.id,
          name: response.payload.username,
          image: response.payload.image,
        };
        // } catch (error) {
        //   console.error("Authentication error:", error);
        //   throw error; // Return null instead of throwing
        // }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuth = request.nextUrl.pathname.startsWith("/auth");

      // For non-auth pages, require login (except for register page)
      if (!isOnAuth) {
        return isLoggedIn;
      }

      // If user is logged in and tries to access auth pages, redirect to home
      if (isLoggedIn && isOnAuth) {
        return false; // This triggers redirect to home
      }

      return true;
    },
    // async jwt({ token, user }) {
    //   if (user) {
    //     return {
    //       ...token,
    //       id: user.id,
    //       username: user.name,
    //       image: user.image,
    //     };
    //   }
    //   return token;
    // },
    // async session({ session, token }) {
    //   return {
    //     ...session,
    //     user: {
    //       ...session.user,
    //       id: token.id as string,
    //       username: token.username as string,
    //       image: token.image as string,
    //     },
    //   };
    // },
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

import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "~/_components/theme-provider";
import { Toaster } from "~/_components/ui/sonner";
import { ReactQueryProvider } from "~/provider/react-query-provider";
import NextAuthProvider from "~/provider/next-auth-provider";

export const metadata: Metadata = {
  title: "Notion Clone",
  description:
    "A powerful and intuitive Notion clone application that helps you organize your thoughts, documents, and tasks. Create, edit, and collaborate on documents with a clean and modern interface. Features include real-time collaboration, rich text editing, customizable templates, and seamless organization tools.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ReactQueryProvider>
          <NextAuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

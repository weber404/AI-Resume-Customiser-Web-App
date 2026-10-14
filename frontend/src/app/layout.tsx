import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Resume Tailor | Intelligent ATS Resume Alignment",
  description:
    "Tailor your resume to each job description with AI. Highlight relevant experience, identify keyword gaps, and customize your resume before downloading.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7F9FC] text-[#172033] min-h-screen antialiased selection:bg-[#4F6BED]/20 selection:text-[#172033]">
        {children}
      </body>
    </html>
  );
}

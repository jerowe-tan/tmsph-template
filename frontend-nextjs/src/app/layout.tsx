import localFont from "next/font/local";
import { createPrivateMetadata } from "@/lib/metadata";
import "./globals.css";

const toyotaType = localFont({
  src: [
    { path: "../assets/fonts/ToyotaType-Regular.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/ToyotaType-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/ToyotaType-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-toyota-type",
  display: "swap",
});

export const metadata = createPrivateMetadata({
  title: "Landing Page",
  description: "Access your Toyota account and connected services.",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${toyotaType.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

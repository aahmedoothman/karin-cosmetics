import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karin Cosmetics | Colour, considered. | ألوان تعبّر عنك",
  description: "اكتشف مجموعة ألوان الشعر من Karin. اختر درجتك واطلبها داخل مصر. Discover Karin hair colours, delivered across Egypt.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}

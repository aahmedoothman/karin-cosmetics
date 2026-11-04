import type { Metadata } from "next";
import "./globals.css";
import "./brand-b.css";

export const metadata: Metadata = {
  title: "Karin Cosmetics | Colour, considered. | ألوان تعبّر عنك",
  description: "اكتشف مجموعة ألوان الشعر من Karin. اختر درجتك واطلبها داخل مصر. Discover Karin hair colours, delivered across Egypt.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html:"try{var l=location.pathname.split('/')[1];document.documentElement.lang=l==='en'?'en':'ar';document.documentElement.dir=l==='en'?'ltr':'rtl';var s=localStorage.getItem('karin-theme');document.documentElement.dataset.theme=s||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion:reduce)').matches||localStorage.getItem('karin-motion')==='off'?'off':'on';}catch(e){}"}}/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

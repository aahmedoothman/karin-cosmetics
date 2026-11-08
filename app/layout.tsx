import type { Metadata } from "next";
import "./globals.css";
import "./brand-b.css";
import "./karin-refinement.css";
import "./commerce.css";
import "./atelier.css";
import "./campaign.css";
import {StoreProvider} from './store-provider';

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
      <head><link rel="stylesheet" href="/assets/fonts/changa.css"/><link rel="stylesheet" href="/assets/fonts/sora.css"/><script dangerouslySetInnerHTML={{__html:"var l=location.pathname.split('/')[1];if(l==='receipt')l=new URLSearchParams(location.search).get('lang')||'ar';document.documentElement.lang=l==='en'?'en':'ar';document.documentElement.dir=l==='en'?'ltr':'rtl';var theme='',motion='';try{theme=localStorage.getItem('karin-theme')||'';motion=localStorage.getItem('karin-motion')||'';}catch(e){}document.documentElement.dataset.theme=['dark','light'].includes(theme)?theme:(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion:reduce)').matches||motion==='off'?'off':'on';"}}/></head>
      <body className="antialiased"><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}

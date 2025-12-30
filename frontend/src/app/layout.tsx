import { cn } from "@/lib/utils";
import "./globals.css";
import QueryProvider from "./query-provider";
import { Inter, Geist } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const geist = Geist({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("antialiased", inter.className, geist.className)}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

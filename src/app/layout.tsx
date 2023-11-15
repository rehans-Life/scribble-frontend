import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/redux-provider";
import { Toaster } from "@/components/ui/toaster";
import SocketProvider from "@/components/socket-provider";
import SoundProvider from "@/components/sound-provider";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="touch-none">
      <title>Scribble - Free Multiplayer Drawing & Guessing Game</title>
      <meta
        name="description"
        content="scribble is a free multiplayer drawing and guessing game. Draw and guess words with your friends and people all around the world! Score the most points and be the winner!"
      ></meta>
      <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      <body className={`bg-[url('/background.png')]`}>
        <ReduxProvider>
          <SocketProvider>
            <SoundProvider>{children}</SoundProvider>
          </SocketProvider>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}

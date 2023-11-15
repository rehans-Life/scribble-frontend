"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaQuestion } from "react-icons/fa";

export default function Footer() {
  const [pages] = useState([
    "When it's your turn, choose a word you want to draw!",
    "Try to draw your choosen word! No spelling!",
    "Let other players try to guess your drawn word!",
    "When it's not your turn, try to guess what other players are drawing!",
  ]);

  const [activePage, setActivePage] = useState<number>(0);

  useEffect(() => {
    const intervalToken = setInterval(() => {
      setActivePage(activePage === pages.length - 1 ? 0 : activePage + 1);
    }, 2000);

    return () => {
      clearInterval(intervalToken);
    };
  }, [activePage]);

  const Page = ({ num, description }: { num: number; description: string }) => {
    return (
      <AnimatePresence>
        {activePage === num - 1 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="h-full w-full flex flex-col items-center justify-center text-white"
          >
            <div className="w-full flex justify-center">
              <img
                src={`/gifs/step${num}.gif`}
                className="h-48 object-contain"
              />
            </div>
            <div className="text-sm text-center mt-2">{description}</div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 1 1"
        fill="rgba(12,44,150,0.75)"
        preserveAspectRatio="none"
        className="w-full h-[40px]"
      >
        <polygon points="0,0 1,1 0,1"></polygon>
      </svg>
      <div className="bg-[rgba(12,44,150,0.75)]">
        <div className="w-full md:p-6 py-6 p-3 flex flex-col md:flex-row gap-5 rounded-sm justify-center">
          <div className="bg-[rgba(12,44,150,0.75)] h-auto w-full md:w-[350px] p-3 py-5 flex flex-col gap-y-5 text-white relative">
            <div className="flex items-center justify-center">
              <FaQuestion className="text-xl absolute left-3 top-7" />
              <div className="font-semibold md:text-2xl text-xl">About</div>
            </div>
            <div className="flex flex-col md:text-md text-sm">
              <div>
                <b>Scribble</b> is a free online multiplayer drawing and
                guessing pictionary game.
              </div>
              <br />
              <div>
                A normal game consists of some players, where every round a
                player has to draw their chosen word and others have to guess it
                to gain points!
              </div>
              <br />
              <div>
                The person with the most points at the end of the game, will
                then be crowned as the winner!
              </div>
            </div>
          </div>
          <div className="w-full md:w-[350px] relative bg-[rgba(12,44,150,0.75)] flex flex-col gap-y-5 text-white md:p-6 py-6 p-3 ">
            <div className="flex items-center justify-center">
              <Pencil className="text-xl absolute left-3 top-7" />
              <div className="font-semibold md:text-2xl text-xl">
                How to Play
              </div>
            </div>
            <div className="flex-1 w-full relative">
              {pages.map((des, i) => (
                <Page key={i} num={i + 1} description={des} />
              ))}
            </div>
            <div className="flex items-center justify-center py-1">
              {pages.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full cursor-pointer ${
                    activePage === i
                      ? "bg-white h-[14px] w-[14px]"
                      : "bg-slate-400 h-3 w-3"
                  } mx-2 hover:bg-white transition-all ease-out duration-75`}
                  onClick={() => setActivePage(i)}
                ></div>
              ))}{" "}
            </div>
          </div>
        </div>
        <div className="text-md text-white pt-2 pb-3 text-center">
          Crafted by{" "}
          <a
            href="https://github.com/rehans-Life"
            target="__blank"
            rel="noreferrer"
            className="font-medium underline cursor-pointer underline-offset-4"
          >
            Rehan
          </a>
          . The source code is on{" "}
          <a
            href="https://github.com/rehans-Life/scribble-frontend"
            target="__blank"
            rel="noreferrer"
            className="font-medium underline cursor-pointer underline-offset-4"
          >
            Github
          </a>
        </div>
      </div>
    </div>
  );
}

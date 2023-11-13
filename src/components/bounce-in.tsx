import { AnimatePresence, motion } from "framer-motion";
import React, { ReactNode } from "react";

export default function BounceIn({
  isVisible,
  children,
  initialDelay,
}: {
  isVisible: boolean;
  initialDelay: number;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            translateY: "-100%",
            opacity: 0,
          }}
          animate={{
            translateY: "0%",
            opacity: 1,
            transition: {
              delay: initialDelay,
            },
          }}
          exit={{
            translateY: "-100%",
            opacity: 0,
          }}
          transition={{
            type: "spring",
            duration: 0.4,
            bounce: 0.5,
          }}
          className="absolute flex items-center justify-center left-0 right-0 top-0 bottom-0 z-[99]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

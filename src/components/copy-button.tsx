import { Check } from "lucide-react";
import React, { ReactNode, useState } from "react";

export default function CopyButton({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  const [isCopying, setIsCopying] = useState<boolean>(false);

  const copy = async () => {
    setIsCopying(true);
    await navigator.clipboard.writeText(value);
    setTimeout(() => {
      setIsCopying(false);
    }, 2000);
  };

  return (
    <div
      onClick={copy}
      className="w-full h-full flex items-center justify-center"
    >
      {isCopying ? <Check /> : children}
    </div>
  );
}

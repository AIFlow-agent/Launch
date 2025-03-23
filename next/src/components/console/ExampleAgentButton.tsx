import React from "react";
import clsx from "clsx";

export const ExampleAgentButton = ({
  name,
  children,
  setAgentRun,
  className
}: {
  name: string;
  children: string;
  setAgentRun?: (name: string, goal: string) => void;
  className: string;
}) => {
  const handleClick = () => {
    if (setAgentRun) {
      setAgentRun(name, children);
    }
  };

  return (
    <div
      className={clsx("w-full p-4 rounded-tl-[7px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px] text-white hover:bg-slate-5 sm:text-base",className)}
      onClick={handleClick}
    >
      <p className="text-lg font-bold">{name}</p>
      <p className="mt-2 text-sm">{children}</p>
    </div>
  );
};

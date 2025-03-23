import clsx from "clsx";
import React from "react";

import Tooltip from "./Tooltip";
import type { toolTipProperties } from "../types";

interface LabelProps {
  left?: React.ReactNode;
  type?: string;
  toolTipProperties?: toolTipProperties;
}

const Label = ({ type, left, toolTipProperties }: LabelProps) => {
  const isTypeTextArea = () => {
    return type === "textarea";
  };

  return (
<Tooltip
  child={
    <div
      className={clsx(
        "center flex min-w-[8em] items-center rounded-xl",
        "py-2 text-sm font-semibold tracking-wider text-white transition-all md:py-3 md:pl-3 md:text-lg",
        isTypeTextArea() && "md:h-20",

        type !== "range" && "md:rounded-r-none", 
        "bg-transparent" 
      )}
    >
      {left}
    </div>
  }
  sideOffset={0}
  toolTipProperties={toolTipProperties}
></Tooltip>
  );
};

export default Label;

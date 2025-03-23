import clsx from "clsx";
import React from "react";

interface DrawerItemProps {
  text: string;
  tokenId: string;
  className?: string;
  onClick?: () => Promise<void> | void;
}

export const DrawerItemButton = (props: DrawerItemProps) => {
  const { text,tokenId, onClick } = props;

  return (
    <button
      type="button"
      className={clsx(
        "cursor-pointer rounded-md text-slate-12 hover:bg-slate-5 flex-col items-start gap-y-2",
        props.className
      )}
      onClick={onClick}
    >
      <div className="line-clamp-1 text-left text-sm font-medium">{text}</div>
      <div className="line-clamp-1 text-left text-sm font-medium">{tokenId}</div>
    </button>
    
  );
};

export const DrawerItemButtonLoader = () => {
  return <div className="w-50 mx-1.5 h-7 animate-pulse rounded-md bg-slate-6"></div>;
};

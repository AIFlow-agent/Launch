import clsx from "clsx";
import type { PropsWithChildren } from "react";
import React from "react";
import { FaChevronRight } from "react-icons/fa";

type BadgeProps = PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>;

const BannerBadge = ({ children, className, ...props }: BadgeProps) => (
  <div
    className={clsx(
      "font-gothic font-normal text-[23px] text-white truncate leading-[23px]",
      className
    )}
  >

      <span className="font-gothic font-normal">{children}</span>
      {/* <FaChevronRight
        size={10}
        className="font-thin text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
      /> */}
  </div>
);

export default BannerBadge;

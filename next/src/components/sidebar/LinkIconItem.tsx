import type { ReactNode } from "react";

const LinkIconItem = (props: { children: ReactNode; href?: string; onClick: () => void }) => (
  <a
    href={props.href}
    className="group grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-2xl border-[#990DFF]  bg-[#990DFF] text-white hover:bg-slate-5 hover:text-[#990DFF] group-hover:scale-110"
    onClick={(e) => {
      e.preventDefault();
      props.onClick();
    }}
  >
    {props.children}
  </a>
);

export default LinkIconItem;

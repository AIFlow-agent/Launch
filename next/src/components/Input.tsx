import clsx from "clsx";
import type { ChangeEvent, KeyboardEvent, ReactNode, RefObject } from "react";

import Label from "./Label";
import type { toolTipProperties } from "../types";

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface InputProps {
  small?: boolean; // Will lower padding and font size. Currently only works for the default input
  left?: ReactNode;
  value: string | number | undefined;
  onChange: (e: ChangeEvent<InputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  subType?: string;
  attributes?: { [key: string]: string | number | string[] }; // attributes specific to input type
  toolTipProperties?: toolTipProperties;
  inputRef?: RefObject<InputElement>;
  onKeyDown?: (e: KeyboardEvent<InputElement>) => void;
  handlePlay: () => void
}

const Input = (props: InputProps) => {
  const isTypeTextArea = () => {
    return props.type === "textarea";
  };

  return (
    <div className="bg-[rgb(255,255,255,0.16)] bg-transparent rounded-[17px] border border-[#990DFF]">
      <div className="items-left z-5 flex h-fit w-full flex-col text-lg text-white md:flex-row md:items-center rounded-[17px] border border-[#990DFF] relative pr-12">
      {props.left && (
        <Label left={props.left} type={props.type} toolTipProperties={props.toolTipProperties} />
      )}
      {isTypeTextArea() ? (
        <textarea
          className={clsx(
            "delay-50 h-15 w-full resize-none rounded-xl border-none bg-transparent p-2 text-sm tracking-wider text-white outline-none transition-all selection:bg-sky-300 placeholder:text-slate-8 sm:h-20 md:text-lg focus:outline-none focus:border-none focus:ring-0",
            props.disabled && "cursor-not-allowed",
            props.left && "md:rounded-l-none",
            props.small && "text-sm sm:py-[0]"
          )}
          ref={props.inputRef as RefObject<HTMLTextAreaElement>}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
          onKeyDown={props.onKeyDown}
          {...props.attributes}
        />
      ) : (
        <input
          className={clsx(
            "w-full rounded-xl border-none bg-transparent p-2 py-1 text-sm tracking-wider text-white outline-none transition-all duration-200 selection:bg-sky-300 placeholder:text-slate-8 sm:py-3 md:text-lg focus:outline-none focus:border-none focus:ring-0",
            props.disabled && "cursor-not-allowed",
            props.left && "md:rounded-l-none",
            props.small && "text-sm sm:py-[0]"
          )}
          ref={props.inputRef as RefObject<HTMLInputElement>}
          placeholder={props.placeholder}
          type={props.type}
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
          onKeyDown={props.onKeyDown}
          {...props.attributes}
        />
      )}
      {/* {isTypeTextArea() ? (
      <button className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer p-1.5 hover:opacity-80" onClick={props.handlePlay}>
        <img 
          src="https://agent.aiflow.guru/start.png" 
          alt="Start"
          className="h-8 w-8 object-contain" 
        />
      </button>):(<button className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer p-1.5 hover:opacity-80" onClick={props.handlePlay}>
        <img 
          src="https://agent.aiflow.guru/start.png" 
          alt="Start"
          className="h-4 w-4 object-contain" 
        />
      </button>)} */}
      </div>
    </div>
  );
};

export default Input;

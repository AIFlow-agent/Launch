import React from "react";

import BannerBadge from "./BannerBadge";

const AppTitle = () => {
  return (
    <div id="title" className="relative flex flex-col items-center">
      <div className="flex flex-row items-start">
        <span
          className="font-bold text-[93px] inline-block 
          bg-gradient-to-r from-[#FF2BF8] to-[#990DFF]
          bg-clip-text text-transparent
          [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
        >
          AIFLow Agent
        </span>
      </div>
      <div className=" text-center text-white">
        <div>
          <BannerBadge
            className="md:hidden"
            onClick={() => {
              window.open("https://aiflow.guru", "_blank");
            }}
          >
            Automate your business with Agents
          </BannerBadge>
        </div>
        <div
          className="hidden md:flex"
          // onClick={() => {
          //   window.open("https://aiflow.guru", "_blank");
          // }}
        >
          <BannerBadge>Launch Your First AI Agent on BNB Chain</BannerBadge>
        </div>
      </div>
    </div>
  );
};

export default AppTitle;

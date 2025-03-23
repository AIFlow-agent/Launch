import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { FaBars } from "react-icons/fa";

import { DrawerItemButton, DrawerItemButtonLoader } from "./DrawerItemButton";
import type { DisplayProps } from "./Sidebar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../utils/api";
import AuthItem from "../sidebar/AuthItem";
import LinkIconItem from "../sidebar/LinkIconItem";
import LinkItem from "../sidebar/LinkItem";
import { PAGE_LINKS, SOCIAL_LINKS } from "../sidebar/links";

const LeftSidebar = ({ show, setShow, onReload }: DisplayProps & { onReload?: () => void }) => {
  const router = useRouter();
  const { session, signIn, signOut, status } = useAuth();
  const [t] = useTranslation("drawer");

  const { isLoading, data } = api.agent.getAll.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const userAgents = data ?? [];

  const navigateToPage = (href: string) => {
    if (router.pathname === href) {
      onReload?.();
      return;
    }

    void router.push(href);
  };

  return (
    <Sidebar show={show} setShow={setShow} side="left">
      <div className="flex flex-row items-center pb-6">

        <button
          className="mr-auto rounded-md border-none transition-all"
          onClick={() => setShow(!show)}
        >
          <img 
            src="https://agent.aiflow.guru/shrink.png" 
            className="z-20 m-2 w-[12px] h-[12px] object-contain 
                    transition-all hover:invert hover:scale-110"
          />

        </button>
      </div>

      <div className="mb-2 mr-2 flex-1 overflow-y-auto overflow-x-hidden overflow-ellipsis">
        {/* {status === "unauthenticated" && (
          <div className="p-1 text-sm text-slate-12">
            <a className="link" onClick={() => void signIn()}>
              {t("SIGN_IN")}
            </a>{" "}
            {t("SIGN_IN_NOTICE")}
          </div>
        )} */}
        {status === "authenticated" && !isLoading && userAgents.length === 0 && (
          <div className="p-1 text-sm text-slate-12">
            {t("NEED_TO_SIGN_IN_AND_CREATE_AGENT_FIRST")}
          </div>
        )}
        {(status === "loading" || (status === "authenticated" && isLoading)) && (
          <div className="flex flex-col gap-2 overflow-hidden">
            {Array(13)
              .fill(0)
              .map((_, index) => (
                <DrawerItemButtonLoader key={index} />
              ))}
          </div>
        )}

        {userAgents.map((agent, index) => (
          <DrawerItemButton
            key={`${index}-${agent.name}`}
            className="flex w-full rounded-md p-2 text-sm font-semibold"
            text={agent.name}
            tokenId={agent.tokenId}
            onClick={() => void router.push(`/agent?id=${agent.id}`)}
          />
          
        ))}
      </div>
      {/* <ul role="list" className="flex flex-col">
        <ul className="mb-2">
          <div className="mb-2 ml-2 text-xs font-semibold text-slate-10">Pages</div>
          {PAGE_LINKS.map((link, i) => (
            <LinkItem
              key={i}
              title={link.name}
              href={link.href}
              onClick={() => navigateToPage(link.href)}
            >
              <link.icon className={link.className} />
            </LinkItem>
          ))}
        </ul>
        <li className="mb-2">
          <div className="mx-2 flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((link) => (
              <LinkIconItem
                key={link.name}
                href={link.href}
                onClick={() => {
                  void router.push(link.href);
                }}
              >
                <link.icon
                  size={20}
                  className="transition-all group-hover:rotate-3 group-hover:scale-125"
                />
              </LinkIconItem>
            ))}
          </div>
        </li>
        <li>
          <div className="mb-2 ml-2 text-xs font-semibold text-slate-10"></div>
        </li>
        <li>
          <AuthItem session={session} signOut={signOut} signIn={signIn} />
        </li>
      </ul> */}
        <button
        className="mb-4 rounded-md p-1 shadow-depth-1 border-purple-500 bg-purple-400 text-white hover:bg-slate-2 hover:text-black"
        onClick={() => navigateToPage("/")}
      >
        New Agent
      </button>
    </Sidebar>
  );
};

export default LeftSidebar;

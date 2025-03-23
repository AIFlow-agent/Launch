import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import type { KeyboardEvent, RefObject } from "react";
import { useEffect,useState } from "react";
import { FaCog, FaPlay, FaStar } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAgentStore } from "../../stores";
import type { Message } from "../../types/message";
import AppTitle from "../AppTitle";
import Button from "../Button";
import ExampleAgents from "../console/ExampleAgents";
import { ToolsDialog } from "../dialog/ToolsDialog";
import Globe from "../Globe";
import Input from "../Input";
import LinkIconItem from "../sidebar/LinkIconItem";
import LinkItem from "../sidebar/LinkItem";
import { PAGE_LINKS, SOCIAL_LINKS } from "../sidebar/links";

type LandingProps = {
  messages: Message[];
  disableStartAgent: boolean;
  handlePlay: () => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  goalInputRef: RefObject<HTMLInputElement>;
  goalInput: string;
  setGoalInput: (string) => void;
  setShowSignInDialog: (boolean) => void;
  setAgentRun: (newName: string, newGoal: string) => void;
};
const Landing = (props: LandingProps) => {
  const router = useRouter();
  const [showToolsDialog, setShowToolsDialog] = useState(false);

  const [ isConnected , setIsConnected ] = useState ( false ) ;

  const [userAddress, setUserAddress] = useState(""); 
  const { t } = useTranslation("indexPage");
  const agent = useAgentStore.use.agent();

  const BSC_MAINNET_PARAMS = {
    chainId: "0x38", 
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
  };

  const switchToBSC = async() => {
    try {

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_MAINNET_PARAMS.chainId }],
      });
    } catch (error) {

      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BSC_MAINNET_PARAMS],
        });
      } else {
        console.error("switch network error:", error);
      }
    }
  }


  const connect = async () => {
    try {
   
      if (isConnected) return;


      const address = await connectWallet();
      if (!address) return;


      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x38") {
        await switchToBSC();

        const newChainId = await window.ethereum.request({ method: "eth_chainId" });
        if (newChainId !== "0x38") {
          throw new Error("cancel switch by user");
        }
      }

      console.log("manual success:", address);
    } catch (error) {
      setUserAddress("");
      setIsConnected(false);
      alert(`连接失败: ${error.message}`);
    }
  };


  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("install wallet please!");
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
        setIsConnected(true);
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error("user reject network:", error);
      return null;
    }
  };

  return (
    <>
      <ToolsDialog show={showToolsDialog} setOpen={setShowToolsDialog} />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, type: "easeInOut" }}
        className="z-10"
      >
        <AppTitle />
      </motion.div>
      {/* <button className="absolute top-2 right-2 z-20 rounded-md bg-slate-1 mb-4 px-4 py-2 shadow-depth-1 hover:bg-slate-2" onClick={()=>connect()} > {isConnected ? 
      (`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`  ) : ( "Connect to BNB Chain")} 
      </button> */}
      {/* <div className="absolute left-0 right-0 m-auto grid place-items-center overflow-hidden opacity-40">
        <Globe />
      </div> */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 1, type: "easeInOut" }}
        className="z-10"
      >
        <ExampleAgents setAgentRun={props.setAgentRun} setShowSignIn={props.setShowSignInDialog} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.5, type: "easeInOut" }}
        className="z-10 flex w-full flex-col gap-6"
      >
        <Input
          inputRef={props.goalInputRef}
          left={
            <>
              <FaStar />
              <span className="ml-2">{`${t("LABEL_AGENT_GOAL")}`}</span>
            </>
          }
          disabled={agent != null}
          value={props.goalInput}
          onChange={(e) => props.setGoalInput(e.target.value)}
          onKeyDown={props.handleKeyPress}
          placeholder={`${t("PLACEHOLDER_AGENT_GOAL")}`}
          type="textarea"
          handlePlay = {props.handlePlay}
        />

        <div className="flex w-full flex-row items-center justify-center gap-3">
          {/* <Button
            ping
            onClick={() => setShowToolsDialog(true)}
            className="h-full bg-gradient-to-t from-slate-9 to-slate-12 hover:shadow-depth-3"
          >
            <FaCog />
          </Button> */}
          <Button
            onClick={props.handlePlay}
            className="border-0 [background:linear-gradient(-58deg,#FF2BF8,#990DFF)] [border-radius:7px_10px_10px_10px] font-gothic text-[17px] text-white hover:bg-slate-2 hover:text-black flex items-center justify-center"
          >
            Create Agent
            {/* <FaPlay /> */}
          </Button>
        </div>
      </motion.div>

      <ul role="list" className="flex flex-col absolute bottom-2 w-full">
              {/* <ul className="mb-2">
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
              </ul> */}
              <li className="mb-2">
                <div className="mx-2 flex items-center justify-center gap-10">
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
              {/* <li>
                <div className="mb-2 ml-2 text-xs font-semibold text-slate-10"></div>
              </li>
              <li>
                <AuthItem session={session} signOut={signOut} signIn={signIn} />
              </li> */}
            </ul>
    </>
  );
};

export default Landing;

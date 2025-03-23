import { type GetStaticProps, type NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect,useState, useRef } from "react";

import nextI18NextConfig from "../../next-i18next.config.js";
import HelpDialog from "../components/dialog/HelpDialog";
import { SignInDialog } from "../components/dialog/SignInDialog";
import Chat from "../components/index/chat";
import Landing from "../components/index/landing";
import { useAgent } from "../hooks/useAgent";
import { useAuth } from "../hooks/useAuth";
import { useSettings } from "../hooks/useSettings";
import DashboardLayout from "../layout/dashboard";
import { AgentApi } from "../services/agent/agent-api";
import { DefaultAgentRunModel } from "../services/agent/agent-run-model";
import AutonomousAgent from "../services/agent/autonomous-agent";
import { MessageService } from "../services/agent/message-service";
import {
  resetAllAgentSlices,
  resetAllMessageSlices,
  useAgentStore,
  useMessageStore,
} from "../stores";
import { useAgentInputStore } from "../stores/agentInputStore";
import { resetAllTaskSlices, useTaskStore } from "../stores/taskStore";
import { toApiModelSettings } from "../utils/interfaces";
import { languages } from "../utils/languages";
import { isEmptyOrBlank } from "../utils/whitespace";
import { getProviders, signIn, useSession } from "next-auth/react";
import { ethers } from 'ethers';
import { loadContract } from '../lib/contract';
import ConnectMetaMask from '../components/ConnectMetaMask' ; 
import { Provider } from "@radix-ui/react-tooltip";
import { update } from "lodash";

// // pages/demo.tsx
// import dynamic from 'next/dynamic';

// // 动态加载合约操作组件（禁用 SSR）
// const MintContract = dynamic(() => import('../components/CallMintMethod'), {
//   ssr: false, // 确保仅在客户端渲染
// });



const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<any | null>(null);

  // 添加调试效果
  useEffect(() => {
    console.log("component currentAccount update:", currentAccount);
  }, [currentAccount]);

  // 添加调试效果
  useEffect(() => {
    console.log("component currentAccount update:", currentProvider);
  }, [currentProvider]);

  const { t } = useTranslation("indexPage");
  const addMessage = useMessageStore.use.addMessage();
  const messages = useMessageStore.use.messages();
  const tasks = useTaskStore.use.tasks();

  const setAgent = useAgentStore.use.setAgent();
  const agentLifecycle = useAgentStore.use.lifecycle();

  const agent = useAgentStore.use.agent();

  const { session } = useAuth();
  const nameInput = useAgentInputStore.use.nameInput();
  const setNameInput = useAgentInputStore.use.setNameInput();
  const goalInput = useAgentInputStore.use.goalInput();
  const setGoalInput = useAgentInputStore.use.setGoalInput();
  const { settings } = useSettings();

  const [showSignInDialog, setShowSignInDialog] = React.useState(false);
  const agentUtils = useAgent();

  const goalInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    goalInputRef?.current?.focus();
  }, []);

  const setAgentRun = (newName: string, newGoal: string) => {
    setNameInput(newName);
    setGoalInput(newGoal);
    handlePlay(newGoal);
  };

  const disableStartAgent =
    (agent !== null && !["paused", "stopped"].includes(agentLifecycle)) ||
    isEmptyOrBlank(goalInput);

  const handlePlay = (goal: string) => {
    if (agentLifecycle === "stopped") handleRestart();
    else handleNewAgent(goal.trim());
  };

  const contractAddress = '0x0098cB7F1f2f2eAE1064ae1A318d37A08b51546A'; // 合约地址

  const ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    {
      constant: false,
      inputs: [
        { name: "to", type: "address" },
        { name: "tokenURI", type: "string" },
      ],
      name: "mint",
      outputs: [],
      type: "function",
    },
  ];
  
  async function mintNFT(to, tokenURI) {
    if (!window.ethereum) {
      alert("Please install MetaMask browser extension");
      return;
    }
  
    try {

      // // 1. 初始化 Provider 和 Signer
      // const provider = new ethers.BrowserProvider(window.ethereum);  // 创建 BrowserProvider 实例
      // await window.ethereum.request({ method: "eth_requestAccounts" });
  
      // 2. 获取 Signer
      const signer = await currentProvider.getSigner();
  
      // 3. 创建合约实例，传入 signer
      const contract = new ethers.Contract(contractAddress, ABI, signer); // 使用 signer 而非 provider
  
      // 4. 发送 mint 交易
      const tx = await contract.mint(to, tokenURI);  // 执行 mint 函数，发起交易

  
      // 5. 等待交易确认
      const receipt = await tx.wait();
  


      // 6. 解析 Transfer 事件
      let tokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog.name === "Transfer") {
            tokenId = parsedLog.args.tokenId.toString();

            break;
          }
        } catch (error) {
          // 忽略无法解析的日志
        }
      }

      if (!tokenId) {
        console.log("have not found tokenId");
      }

      return tokenId;
    } catch (error) {
      console.error("fail:", error);
    }
  }

  const handleNewAgent = (goal: string) => {
      
    console.log("handleNewAgent:goal["+goal+"] address["+currentAccount+"]");

    if(currentAccount!=null && currentAccount!=undefined)
    {
      if (session === null) {
        storeAgentDataInLocalStorage("", goal);
        // setShowSignInDialog(true);
        signIn("credentials", {
        name: currentAccount,
        redirect: false
        }).catch(console.error);
      }

      var tx = mintNFT(currentAccount,"https://agent.aiflow.guru/aiflow.json").then(tokenId => {
        console.log("success:"+tokenId);
        if(tokenId!=undefined)
        {
  
          if (agent && agentLifecycle == "paused") {
            agent?.run().catch(console.error);
            return;
          }
      
          const model = new DefaultAgentRunModel(goal.trim());
  
          console.log("new agent model:"+model.getId());
  
          const messageService = new MessageService(addMessage);
          const agentApi = new AgentApi({
            model_settings: toApiModelSettings(settings, session),
            goal: goal,
            tokenId: "TOKEN ID: "+tokenId,
            session: session,
            agentUtils: agentUtils,
          });
  
          const newAgent = new AutonomousAgent(
            model,
            messageService,
            settings,
            agentApi,
            session ?? undefined
          );
          setAgent(newAgent);
          newAgent?.run().then(console.log).catch(console.error);
        }
      });
    }else{
      alert("Link to Wallet first!")
    }

    
  };

  const storeAgentDataInLocalStorage = (name: string, goal: string) => {
    const agentData = { name, goal };
    localStorage.setItem("agentData", JSON.stringify(agentData));
  };

  const getAgentDataFromLocalStorage = () => {
    const agentData = localStorage.getItem("agentData");
    return agentData ? (JSON.parse(agentData) as { name: string; goal: string }) : null;
  };

  useEffect(() => {
    if (session !== null) {
      const agentData = getAgentDataFromLocalStorage();

      if (agentData) {
        setNameInput(agentData.name);
        setGoalInput(agentData.goal);
        localStorage.removeItem("agentData");
      }
    }
  }, [session, setGoalInput, setNameInput]);

  const handleRestart = () => {
    resetAllMessageSlices();
    resetAllTaskSlices();
    resetAllAgentSlices();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Only Enter is pressed, execute the function
    // if (e.key === "Enter" && !disableStartAgent && !e.shiftKey) {
    //   handlePlay(goalInput);
    // }
  };
  
  return (
    <DashboardLayout
      onReload={() => {
        agent?.stopAgent();
        handleRestart();
      }}
    >

      {/* <HelpDialog /> */}

      <SignInDialog show={showSignInDialog} setOpen={setShowSignInDialog} />
      <div id="content" className="flex min-h-screen w-full items-center justify-center">
        <div
          id="layout"
          className="relative flex h-screen w-full max-w-screen-md flex-col items-center justify-center gap-5 overflow-hidden p-2 py-10 sm:gap-3 sm:p-4"
        >

      <div>
        <ConnectMetaMask 
          onAccountChange={(account) => {
 
            setCurrentAccount(account);
            // if (session === null) {
            //   signIn("credentials", {
            //   name: currentAccount,
            //   redirect: false
            //   }).catch(console.error);
            //   console.log("onAccountChange login, session:"+session)
            // }
          }} onProviderChange={(provider) => {
            setCurrentProvider(provider);
          }} 
        />
      </div>
          {agent !== null ? (
            <Chat
              messages={messages}
              disableStartAgent={disableStartAgent}
              handlePlay={handlePlay}
              nameInput={nameInput}
              goalInput={goalInput}
              setShowSignInDialog={setShowSignInDialog}
              setAgentRun={setAgentRun}
            />
          ) : (
            <Landing
              messages={messages}
              disableStartAgent={disableStartAgent}
              handlePlay={() => handlePlay(goalInput)}
              handleKeyPress={handleKeyPress}
              goalInputRef={goalInputRef}
              goalInput={goalInput}
              setGoalInput={setGoalInput}
              setShowSignInDialog={setShowSignInDialog}
              setAgentRun={setAgentRun}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  const supportedLocales = languages.map((language) => language.code);
  const chosenLocale = supportedLocales.includes(locale) ? locale : "en";

  return {
    props: {
      ...(await serverSideTranslations(chosenLocale, nextI18NextConfig.ns)),
    },
  };
};

// components/ConnectMetaMask.tsx
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAuth } from "../hooks/useAuth";
import { getProviders, signIn, useSession } from "next-auth/react";


const BNB_MAINNET_CHAIN = {
  chainId: '0x38', // 56 的十六进制（主网唯一标识）
  chainName: 'BNB Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18 // 与测试网一致
  },
  rpcUrls: ['https://bsc-dataseed1.binance.org'], // 主网专用节点
  blockExplorerUrls: ['https://bscscan.com'] // 主网浏览器
};

// BNB 测试链配置（Testnet）
// const BNB_TESTNET_CHAIN = {
//   chainId: '0x61', // 97 的十六进制
//   chainName: 'BNB Smart Chain Testnet',
//   nativeCurrency: {
//     name: 'BNB',
//     symbol: 'BNB',
//     decimals: 18
//   },
//   rpcUrls: ['https://bsc-testnet.publicnode.com'], 
//   blockExplorerUrls: ['https://testnet.bscscan.com']
// };



interface ConnectMetaMaskProps {
  onAccountChange?: (account: string | null) => void;
  onProviderChange?: (provider: any | null) => void;
}

export default function ConnectMetaMask({ onAccountChange,onProviderChange }: ConnectMetaMaskProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any | null>(null);
  const [chainId, setChainId] = useState<string>('');
  const [isSwitching, setIsSwitching] = useState(false);
  const { session } = useAuth();

  // 监听账户变化（新增）
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      const newAccount = accounts[0] || null;
      setAccount(newAccount);
      onAccountChange?.(newAccount);
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [onAccountChange]);

  
  // 监听网络变化
  // useEffect(() => {
  //   const handleChainChanged = (newChainId: string) => {
  //     console.log ('检测到网络切换，新链ID:',newChainId ) ;
  //     setChainId(newChainId);
  //   };

  //   window.ethereum?.on('chainChanged', handleChainChanged);
  //   return () => window.ethereum?.removeListener('chainChanged', handleChainChanged);
  // }, [onAccountChange]);

  // 切换至BNB测试链
  const switchToTestChain = async () => {
    if (!window.ethereum) return;
    
    setIsSwitching(true);
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BNB_MAINNET_CHAIN]
      });
    } catch (error) {
      console.error('Change Error:', error);
    }
    setIsSwitching(false);
  };

  const connect = async () => {
    if (window.ethereum) {
      try {

        // 检测 MetaMask 提供者
        let metamaskProvider;

        // 处理可能存在多个提供商的情况
        const providers = window.ethereum.providers || [window.ethereum];
        metamaskProvider = providers.find(p => p.isMetaMask);
        
        if (!metamaskProvider) {
          throw new Error("Please install MetaMask browser extension");
        }

        // 使用明确的 MetaMask 提供者
        const p = new ethers.BrowserProvider(metamaskProvider);
        const accounts = await metamaskProvider.request({ method: "eth_requestAccounts" });

        // const accounts = await window.ethereum.request({
        //   method: 'eth_requestAccounts',
        // });
        setAccount(accounts[0]);
        setProvider(p);

        // const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await p.getNetwork();
        // setChainId(network.chainId.toString());

        console.log("account:", accounts[0]);

        if (session === null) {
          // setShowSignInDialog(true);
          signIn("credentials", {
          name: accounts[0],
          redirect: false
          }).catch(console.error);
          console.log("onAccountChange login, session:"+session)
        }

        if (onAccountChange) {
          onAccountChange(accounts[0]);
        }

        if (onProviderChange) {
          onProviderChange(p);
        }

      } catch (error) {
        console.error('Connect to MetaMask fail:', error);
      }
    } else {
      alert('Please install MetaMask browser extension');
    }
  };
  // 状态显示
  const getConnectionStatus = () => {
    if (!account) return 'Link Wallet';
    // if (chainId !== BNB_MAINNET_CHAIN.chainId) {
    //   return isSwitching ? 'Changing to testnet...' : 'Click to change to testnet';
    // }
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };

  const login = () => {
      if (session === null) {
        // setShowSignInDialog(true);
        signIn("credentials", {
        name: account,
        redirect: false
        }).catch(console.error);
        console.log("onAccountChange login, session:"+session)
      }
  }

  return (
    <div className="absolute flex top-2 right-2 z-20">
        <div className="cursor-pointer w-[90px] h-[42px] [border-radius:7px_10px_10px_10px] border-[1px] border-solid border-[#990DFF] text-white hover:bg-slate-2 hover:text-black flex items-center justify-center mr-5">
        <a
          className="font-gothic font-bold text-[17px] text-[#990DFF]"
          href="https://aiflow.guru"
        >
          AIFlow
        </a>
      </div>
      <div
        className="cursor-pointer w-[147px] h-[41px] [background:linear-gradient(-58deg,#FF2BF8,#990DFF)] [border-radius:7px_10px_10px_10px] font-gothic text-[17px] text-white hover:bg-slate-2 hover:text-black flex items-center justify-center"
        onClick={!account?connect:undefined}
      >
       {getConnectionStatus()}
      </div>
    </div>

  );
}
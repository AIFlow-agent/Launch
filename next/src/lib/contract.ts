// lib/contract.ts
import { ethers } from 'ethers';
// import { NEXT_PUBLIC_CONTRACT_ADDRESS, NEXT_PUBLIC_ABI } from '../env';

export const loadContract = async ():Promise<ethers.Contract> => {
    // 确保在浏览器端运行
    if (typeof window === 'undefined') {
        throw new Error('loadContract must be called in a browser environment');
    }

    // 检查 MetaMask 是否安装
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }
        
    try {
        const ABI = [ "function mint(address to, string memory tokenURI) external"];
        const contractAddress = "0x0098cB7F1f2f2eAE1064ae1A318d37A08b51546A";

        // 请求用户账户（需异步等待）
        const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner(accounts[0]); // 使用第一个账户

        const contract = new ethers.Contract(contractAddress, ABI, signer);

        return contract;
    } catch (error) {
        console.error('Failed to load contract:', error);
        throw error;
    }
};
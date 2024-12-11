import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const BRIDGE_ABI = [
  "function bridgeTokens(address token, uint256 amount, address recipient) external"
];

const ETH_PROVIDER_URL = process.env.ETH_PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const SKYA_CONTRACT_ADDRESS = '0x623cd3a3edf080057892aaf8d773bbb7a5c9b6e9';
const BRIDGE_CONTRACT_ADDRESS = '0x1b89Cb4e324Af944383d70074527C6751CaED01B';
const RECIPENT_ADDRESS = '0x2c760dCD6666834F919Dc8CA0Dff9b6427a4d8aD'; 

async function sendBridgeTransaction(providers:string , privateKey: string , tokenContract:string , bridgeAdress:string , recipientAddress:string) {
  try { 
    const provider = new ethers.JsonRpcProvider(providers);
    const wallet = new ethers.Wallet(privateKey, provider);
    const skyaToken = new ethers.Contract(tokenContract, ERC20_ABI, wallet);
    const bridgeContract = new ethers.Contract(bridgeAdress, BRIDGE_ABI, wallet);
    const amountToBridge = ethers.parseUnits('1.0', 18);

    // Sending approval transaction for the bridge
    const approveBridgeTx = await skyaToken.approve(bridgeAdress, amountToBridge);
    console.log('Approval transaction for the bridge sent:', approveBridgeTx.hash);
    await approveBridgeTx.wait();
    console.log('Approval transaction for the bridge confirmed');

    // Sending bridge transaction
    const bridgeTx = await bridgeContract.bridgeTokens(tokenContract, amountToBridge, recipientAddress);
    console.log('Transaction sent to the bridge:', bridgeTx.hash);
    const bridgeReceipt = await bridgeTx.wait();
    console.log('Transaction confirmed:', bridgeReceipt.transactionHash);
    console.log(`Tokens have been sent to the address ${recipientAddress} on the Base network`);
  } catch (error) {
    console.error('Error while sending transaction:', error);
  }
}

if(ETH_PROVIDER_URL && PRIVATE_KEY){
  sendBridgeTransaction(ETH_PROVIDER_URL , PRIVATE_KEY , SKYA_CONTRACT_ADDRESS , BRIDGE_CONTRACT_ADDRESS , RECIPENT_ADDRESS).catch(console.error);
}
else {
  console.log('Unfortunately, the private key or provider address is missing');
}

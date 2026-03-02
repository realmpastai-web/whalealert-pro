import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

const ETHERSCAN_BASE = 'https://api.etherscan.io/api';

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  amount: number;
  amountUsd: number;
  timestamp: number;
}

export async function getTokenTransfers(
  tokenAddress: string,
  minValueUsd: number = 100000,
  fromBlock?: number
): Promise<WhaleTransaction[]> {
  try {
    const params = new URLSearchParams({
      module: 'account',
      action: 'tokentx',
      contractaddress: tokenAddress,
      startblock: fromBlock ? fromBlock.toString() : '0',
      endblock: '999999999',
      sort: 'desc',
      apikey: config.apis.etherscan,
    });

    const response = await axios.get(`${ETHERSCAN_BASE}?${params.toString()}`);
    
    if (response.data.status !== '1') {
      logger.warn(`Etherscan API warning: ${response.data.message}`);
      return [];
    }

    const transactions = response.data.result || [];
    const whaleTxs: WhaleTransaction[] = [];

    for (const tx of transactions.slice(0, 20)) {
      const amount = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal || '18'));
      // Note: In production, fetch actual price from CoinGecko or similar
      const estimatedUsdValue = amount * 1; // Placeholder - would fetch real price
      
      if (estimatedUsdValue >= minValueUsd) {
        whaleTxs.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          tokenName: tx.tokenName,
          tokenSymbol: tx.tokenSymbol,
          tokenDecimal: tx.tokenDecimal,
          amount,
          amountUsd: estimatedUsdValue,
          timestamp: parseInt(tx.timeStamp) * 1000,
        });
      }
    }

    return whaleTxs;
  } catch (error) {
    logger.error('Error fetching token transfers:', error);
    return [];
  }
}

export async function getEthPrice(): Promise<number> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    return response.data.ethereum.usd;
  } catch (error) {
    logger.error('Error fetching ETH price:', error);
    return 0;
  }
}

export function getEtherscanTxUrl(txHash: string): string {
  return `https://etherscan.io/tx/${txHash}`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { dividendDistributorAbi, erc20Abi } from '@sovereignx/shared';
import { config } from '../config.js';

const monadChain = {
  id: config.monad.chainId,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [config.monad.rpcUrl] } },
} as const;

export async function depositCvaToDistributor(amountUsd: number) {
  const pk = config.monad.deployerPrivateKey;
  const distributor = config.contracts.dividendDistributor as `0x${string}` | undefined;
  const cva = config.contracts.cvaStablecoin as `0x${string}` | undefined;

  if (!pk) throw new Error('DEPLOYER_PRIVATE_KEY not configured');
  if (!distributor) throw new Error('DIVIDEND_DISTRIBUTOR_ADDRESS not configured');
  if (!cva) throw new Error('CVA_STABLECOIN_ADDRESS not configured');

  const account = privateKeyToAccount(pk);
  const amount = parseUnits(String(amountUsd), 6);

  const publicClient = createPublicClient({ chain: monadChain, transport: http(config.monad.rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: monadChain,
    transport: http(config.monad.rpcUrl),
  });

  const balance = await publicClient.readContract({
    address: cva,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account.address],
  });
  if (balance < amount) {
    throw new Error(`Insufficient CVA balance: have ${balance}, need ${amount}`);
  }

  const allowance = await publicClient.readContract({
    address: cva,
    abi: [
      ...erc20Abi,
      {
        type: 'function',
        name: 'allowance',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
        ],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
      },
    ],
    functionName: 'allowance',
    args: [account.address, distributor],
  });

  if (allowance < amount) {
    const approveHash = await walletClient.writeContract({
      address: cva,
      abi: erc20Abi,
      functionName: 'approve',
      args: [distributor, amount],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  const depositHash = await walletClient.writeContract({
    address: distributor,
    abi: dividendDistributorAbi,
    functionName: 'depositCVADividends',
    args: [amount],
  });
  await publicClient.waitForTransactionReceipt({ hash: depositHash });

  return { txHash: depositHash, amountUsd, amount: amount.toString() };
}

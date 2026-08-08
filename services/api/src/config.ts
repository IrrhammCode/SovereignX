import 'dotenv/config';

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  cleanverse: {
    apiId: process.env.CLEANVERSE_API_ID ?? '',
    apiKey: process.env.CLEANVERSE_API_KEY ?? '',
    apiUrl: process.env.CLEANVERSE_API_URL ?? 'https://uatapi.cleanverse.com/api/cooperate',
    chain: 'monad',
  },
  monad: {
    rpcUrl: process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz',
    chainId: Number(process.env.MONAD_CHAIN_ID ?? 10143),
  },
  contracts: {
    sovxToken: process.env.SOVX_TOKEN_ADDRESS ?? '',
    identityRegistry: process.env.IDENTITY_REGISTRY_ADDRESS ?? '',
    complianceEngine: process.env.COMPLIANCE_ENGINE_ADDRESS ?? '',
    dividendDistributor: process.env.DIVIDEND_DISTRIBUTOR_ADDRESS ?? '',
    cvaStablecoin: process.env.CVA_STABLECOIN_ADDRESS ?? '',
  },
  travelRuleThresholdUsd: Number(process.env.TRAVEL_RULE_THRESHOLD_USD ?? 3000),
} as const;

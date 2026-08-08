import { loadRootEnv } from '@sovereignx/shared/load-env';
loadRootEnv();

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  cleanverse: {
    apiId: process.env.CLEANVERSE_API_ID ?? '',
    apiKey: process.env.CLEANVERSE_API_KEY ?? '',
    apiUrl: process.env.CLEANVERSE_API_URL ?? 'https://uatapi.cleanverse.com/api/cooperate',
    skillsUrl: process.env.CLEANVERSE_SKILLS_URL ?? 'https://uatapi.cleanverse.com/api/skills',
    chain: 'monad',
  },
  monad: {
    rpcUrl: process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz',
    chainId: Number(process.env.MONAD_CHAIN_ID ?? 10143),
    deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY as `0x${string}` | undefined,
  },
  contracts: {
    sovxToken: process.env.SOVX_TOKEN_ADDRESS ?? '',
    identityRegistry: process.env.IDENTITY_REGISTRY_ADDRESS ?? '',
    complianceEngine: process.env.COMPLIANCE_ENGINE_ADDRESS ?? '',
    dividendDistributor: process.env.DIVIDEND_DISTRIBUTOR_ADDRESS ?? '',
    cvaStablecoin:
      process.env.CVA_STABLECOIN_ADDRESS ??
      '0xaC0893567D43C3E7e6e35a72803df05416C1f20D',
  },
  travelRuleThresholdUsd: Number(process.env.TRAVEL_RULE_THRESHOLD_USD ?? 3000),
  indexerUrl: process.env.INDEXER_URL ?? 'http://localhost:4001',
  validatorPool:
    process.env.VALIDATOR_POOL_ADDRESS ?? process.env.COMPLIANCE_ENGINE_ADDRESS ?? '',
  fred: {
    apiKey: process.env.FRED_API_KEY ?? '',
  },
} as const;

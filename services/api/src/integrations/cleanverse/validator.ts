import { cleanverseRequest } from './client.js';
import { config } from '../../config.js';

export interface ValidatorRule {
  allowed_group: string;
  allowed_sub_group: string;
  min_tier: number;
  min_sub_tier: number;
  is_black_list?: boolean;
  countries?: string[];
}

export async function isPoolRegistered(contractAddress: string) {
  const res = await cleanverseRequest<{ registered?: boolean }>('/validator/is_register', {
    chain: config.cleanverse.chain,
    contract_address: contractAddress,
  });
  return {
    registered: res.code === '0000' && !!res.data?.registered,
    code: res.code,
    message: res.message,
  };
}

export async function verifyUserCompliance(userAddress: string, poolAddress: string) {
  const res = await cleanverseRequest<{ valid?: boolean }>('/validator/verify', {
    chain: config.cleanverse.chain,
    contract_address: poolAddress,
    user_address: userAddress,
  });

  if (res.code === '0000') {
    return { valid: res.data?.valid ?? true, code: res.code, message: res.message };
  }
  return { valid: false, code: res.code, message: res.message };
}

export async function registerCompliancePool(
  contractAddress: string,
  ownerSignature: string,
  rule: ValidatorRule = {
    allowed_group: '',
    allowed_sub_group: '',
    min_tier: 1,
    min_sub_tier: 0,
    is_black_list: false,
    countries: [],
  },
) {
  return cleanverseRequest<{ tx_hash?: string }>(
    '/validator/register',
    {
      chain: config.cleanverse.chain,
      contract_address: contractAddress,
      rule,
      owner_signature: ownerSignature,
    },
    true,
  );
}

export async function queryPoolRules(contractAddress: string) {
  return cleanverseRequest<{ rules?: ValidatorRule[] }>('/validator/rules', {
    chain: config.cleanverse.chain,
    contract_address: contractAddress,
  });
}

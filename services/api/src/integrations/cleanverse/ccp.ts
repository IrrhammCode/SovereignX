import type { ComplianceCheckResult, IVMS101Payload } from '@sovereignx/shared';
import { createHash } from 'node:crypto';
import { queryAPass } from './apass.js';
import { isPoolRegistered, verifyUserCompliance } from './validator.js';
import { config } from '../../config.js';

let poolRegisteredCache: { value: boolean; expires: number } | null = null;

async function isValidatorPoolActive(): Promise<boolean> {
  const pool = config.validatorPool;
  if (!pool) return false;

  if (poolRegisteredCache && Date.now() < poolRegisteredCache.expires) {
    return poolRegisteredCache.value;
  }

  const status = await isPoolRegistered(pool);
  poolRegisteredCache = { value: status.registered, expires: Date.now() + 5 * 60_000 };
  return status.registered;
}

export async function runCCPCheck(
  from: string,
  to: string,
  amountUsd: number,
): Promise<ComplianceCheckResult> {
  const [senderCVI, receiverCVI] = await Promise.all([
    queryAPass(from),
    queryAPass(to),
  ]);

  if (!senderCVI || senderCVI.status !== 'Verified') {
    return {
      allowed: false,
      code: 'CVI_SENDER',
      message: 'Sender CVI not verified',
      senderCVI: senderCVI ?? undefined,
    };
  }

  if (senderCVI.isBlacklisted) {
    return {
      allowed: false,
      code: 'SANCTIONS_SENDER',
      message: 'Sender failed AML/sanctions screening',
      senderCVI,
    };
  }

  if (!receiverCVI || receiverCVI.status !== 'Verified') {
    return {
      allowed: false,
      code: 'CVI_RECEIVER',
      message: 'Receiver CVI not verified',
      senderCVI,
      receiverCVI: receiverCVI ?? undefined,
    };
  }

  if (receiverCVI.isBlacklisted) {
    return {
      allowed: false,
      code: 'SANCTIONS_RECEIVER',
      message: 'Receiver failed AML/sanctions screening',
      senderCVI,
      receiverCVI,
    };
  }

  const poolActive = await isValidatorPoolActive();
  const pool = config.validatorPool;

  if (poolActive && pool) {
    const [senderVerify, receiverVerify] = await Promise.all([
      verifyUserCompliance(from, pool),
      verifyUserCompliance(to, pool),
    ]);
    if (!senderVerify.valid) {
      return {
        allowed: false,
        code: 'VALIDATOR_SENDER',
        message: senderVerify.message || 'Sender failed validator pool check',
        senderCVI,
        receiverCVI,
      };
    }
    if (!receiverVerify.valid) {
      return {
        allowed: false,
        code: 'VALIDATOR_RECEIVER',
        message: receiverVerify.message || 'Receiver failed validator pool check',
        senderCVI,
        receiverCVI,
      };
    }
  }

  const attestationHash = createHash('sha256')
    .update(`${from}:${to}:${amountUsd}:${senderCVI.kycHash}:${receiverCVI.kycHash}`)
    .digest('hex');

  return {
    allowed: true,
    code: '0000',
    message: poolActive ? 'CCP validation passed' : 'CCP passed via A-Pass (validator pool not registered)',
    attestationHash,
    senderCVI,
    receiverCVI,
  };
}

export async function buildIVMS101(
  from: string,
  to: string,
  amount: string,
  senderCVI: NonNullable<ComplianceCheckResult['senderCVI']>,
  receiverCVI: NonNullable<ComplianceCheckResult['receiverCVI']>,
) {
  const travelRuleRequired = Number(amount) >= config.travelRuleThresholdUsd;

  const cvaAddress = config.contracts.cvaStablecoin;
  let cvaEligible = false;
  if (cvaAddress && (await isValidatorPoolActive())) {
    const verify = await verifyUserCompliance(from, cvaAddress);
    cvaEligible = verify.valid;
  } else if (cvaAddress) {
    cvaEligible = senderCVI.status === 'Verified';
  }

  return {
    originator: {
      accountNumber: from,
      name: `CVI Tier ${senderCVI.tier} · Group ${senderCVI.group}`,
      address: from,
      country: senderCVI.countryCode ?? 'US',
      nationalId: senderCVI.kycHash,
    },
    beneficiary: {
      accountNumber: to,
      name: `CVI Tier ${receiverCVI.tier} · Group ${receiverCVI.group}`,
      address: to,
      country: receiverCVI.countryCode ?? 'US',
    },
    transfer: {
      amount,
      currency: 'USD',
      assetSymbol: 'SOVX',
      chain: config.cleanverse.chain,
    },
    compliance: {
      cviVerified: senderCVI.status === 'Verified' && receiverCVI.status === 'Verified',
      cvaEligible,
      travelRuleRequired,
    },
  };
}

import type { ComplianceCheckResult, IVMS101Payload } from '@sovereignx/shared';
import { createHash } from 'node:crypto';
import { queryAPass } from './apass.js';
import { verifyUserCompliance } from './validator.js';
import { config } from '../../config.js';

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

  const pool = config.validatorPool;
  if (pool) {
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
  } else {
    const cvaAddress = config.contracts.cvaStablecoin;
    if (cvaAddress) {
      const verify = await verifyUserCompliance(from, cvaAddress);
      if (!verify.valid) {
        return {
          allowed: false,
          code: 'CCP_VERIFY',
          message: verify.message,
          senderCVI,
          receiverCVI,
        };
      }
    }
  }

  const attestationHash = createHash('sha256')
    .update(`${from}:${to}:${amountUsd}:${senderCVI.kycHash}:${receiverCVI.kycHash}`)
    .digest('hex');

  return {
    allowed: true,
    code: '0000',
    message: 'CCP validation passed',
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
): Promise<IVMS101Payload> {
  const travelRuleRequired = Number(amount) >= config.travelRuleThresholdUsd;

  const cvaAddress = config.contracts.cvaStablecoin;
  let cvaEligible = false;
  if (cvaAddress) {
    const verify = await verifyUserCompliance(from, cvaAddress);
    cvaEligible = verify.valid;
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

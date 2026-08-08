import type { CVIRecord } from '@sovereignx/shared';
import { cleanverseRequest } from './client.js';
import { config } from '../../config.js';

interface ApassData {
  tier: string;
  subTier: number;
  group: string;
  subGroup: string;
  status: number;
  expirationTime: number;
  currentKycHash: string;
  countries?: string[];
  isBlacklisted?: boolean;
}

const STATUS_MAP: Record<number, CVIRecord['status']> = {
  1: 'Verified',
  2: 'Frozen',
};

export async function queryAPass(address: string): Promise<CVIRecord | null> {
  try {
    const res = await cleanverseRequest<ApassData>('/query_apass', {
      chain: config.cleanverse.chain,
      address,
    });

    if (res.code !== '0000' || !res.data) return null;

    const d = res.data;
    return {
      wallet: address,
      tier: d.tier,
      group: d.group,
      status: STATUS_MAP[d.status] ?? 'Pending',
      expirationTime: d.expirationTime,
      kycHash: d.currentKycHash,
      countryCode: d.countries?.[0],
      isBlacklisted: d.isBlacklisted ?? false,
    };
  } catch {
    return null;
  }
}

export async function verifyAPass(
  address: string,
  aTokenAddress: string,
): Promise<{ valid: boolean; code: string; message: string }> {
  const res = await cleanverseRequest<{ valid?: boolean }>('/validator/verify', {
    chain: config.cleanverse.chain,
    address,
    tokenAddress: aTokenAddress,
  });

  if (res.code === '0000') {
    return { valid: true, code: res.code, message: res.message };
  }

  return { valid: false, code: res.code, message: res.message };
}

export async function downloadTravelRule(address: string): Promise<{ url?: string; error?: string }> {
  const res = await cleanverseRequest<{ downloadUrl?: string }>('/download_travel_rule', {
    chain: config.cleanverse.chain,
    address,
  });

  if (res.code === '0000' && res.data?.downloadUrl) {
    return { url: res.data.downloadUrl };
  }

  return { error: res.message };
}

/** Enrollment magiclink from Cleanverse Skills API (no encryption) */
export async function getEnrollmentMagiclink(): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch(`${config.cleanverse.skillsUrl}/get_magiclink`, {
      headers: { Accept: 'application/json' },
    });
    const body = (await res.json()) as { code: string; data?: { register_url?: string }; message?: string };
    if (body.code === '0000' && body.data?.register_url) {
      return { url: body.data.register_url };
    }
    return { error: body.message ?? 'Failed to get magiclink' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Network error' };
  }
}

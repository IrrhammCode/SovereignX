import { createCipheriv, createDecipheriv } from 'node:crypto';
import { config } from '../../config.js';

const IV = Buffer.alloc(16, 0);

function getAesKey(): Buffer {
  if (!config.cleanverse.apiKey) throw new Error('CLEANVERSE_API_KEY not set');
  return Buffer.from(config.cleanverse.apiKey, 'base64');
}

export function encryptPayload(body: Record<string, unknown>): string {
  const cipher = createCipheriv('aes-256-cbc', getAesKey(), IV);
  const json = JSON.stringify(body);
  return Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]).toString('base64');
}

export function decryptPayload<T>(data: string): T {
  const decipher = createDecipheriv('aes-256-cbc', getAesKey(), IV);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data, 'base64')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(decrypted) as T;
}

export interface CleanverseEnvelope<T = unknown> {
  code: string;
  message: string;
  data: T;
}

export async function cleanverseRequest<T>(
  endpoint: string,
  body: Record<string, unknown> = {},
  encrypted = false,
): Promise<CleanverseEnvelope<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'api-id': config.cleanverse.apiId,
  };

  const requestBody = encrypted
    ? JSON.stringify({ data: encryptPayload(body) })
    : JSON.stringify(body);

  const res = await fetch(`${config.cleanverse.apiUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: requestBody,
  });

  if (!res.ok) {
    throw new Error(`Cleanverse HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<CleanverseEnvelope<T>>;
}

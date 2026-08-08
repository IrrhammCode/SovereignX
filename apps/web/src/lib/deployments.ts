export interface Deployments {
  chain: string;
  chainId: number;
  identityRegistry: string;
  complianceEngine: string;
  sovxToken: string;
  dividendDistributor: string;
  cvaStablecoin: string;
  explorer: string;
}

let cached: Deployments | null = null;

export async function fetchDeployments(): Promise<Deployments> {
  if (cached) return cached;
  const res = await fetch('/deployments.json');
  if (!res.ok) throw new Error('Failed to load deployments');
  cached = await res.json();
  return cached!;
}

export function getContractAddress(
  deployments: Deployments | null,
  envKey: string,
  deploymentKey: keyof Deployments,
): string | undefined {
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv;
  if (!deployments) return undefined;
  const value = deployments[deploymentKey];
  return typeof value === 'string' ? value : undefined;
}

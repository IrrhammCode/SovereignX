export const identityRegistryAbi = [
  {
    type: 'function',
    name: 'registerIdentity',
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'cviHash', type: 'bytes32' },
      { name: 'tier', type: 'uint8' },
      { name: 'expirationTime', type: 'uint256' },
      { name: 'countryCode', type: 'bytes2' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isVerified',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'contains',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
] as const;

export const sovxTokenAbi = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MIN_FRACTION',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

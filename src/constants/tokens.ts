import { Token, ChainId } from '@uniswap/sdk-core';

// World Chain ID from environment variable
export const WORLD_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_WORLD_CHAIN_ID || '480') as ChainId;

// World Chain Uniswap v4 contract addresses
export const WORLD_CHAIN_CONTRACTS = {
  POOL_MANAGER: '0xb1860d529182ac3bc1f51fa2abd56662b7d13f33',
  POSITION_DESCRIPTOR: '0x7da419153bd420b689f312363756d76836aeace4',
  POSITION_MANAGER: '0xc585e0f504613b5fbf874f21af14c65260fb41fa',
  QUOTER: '0x55d235b3ff2daf7c3ede0defc9521f1d6fe6c5c0',
  STATE_VIEW: '0x51d394718bc09297262e368c1a481217fdeb71eb',
  UNIVERSAL_ROUTER: '0x8ac7bee993bb44dab564ea4bc9ea67bf9eb5e743',
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
};

// World Chain token addresses (real tokens available on World Chain)
export const TOKEN_ADDRESSES = {
  ETH: '0x4200000000000000000000000000000000000006', // World Chain ETH (WETH)
  USDC: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1', // USDC on World Chain
  WLD: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003', // WLD (Worldcoin) on World Chain
  WBTC: '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3', // Wrapped BTC on World Chain
  uXRP: '0x2615a94df961278DcbC41Fb0a54fEc5f10a693aE', // XRP 
  uDOGE: '0x12E96C2BFEA6E835CF8Dd38a5834fa61Cf723736', // Dogecoin (Universal) 
  uSOL: '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55', // Solana (Universal) 
  uSUI: '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4', // Sui (Universal)
  USDT0: '0x102d758f688a4C1C5a80b116bD945d4455460282', // Stargate USD₮0 
};

// Token definitions for World Chain
export const ETH_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.ETH,
  18,
  'ETH',
  'World Chain ETH'
);

export const USDC_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.USDC,
  6,
  'USDC',
  'USDC'
);

export const WLD_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.WLD,
  18,
  'WLD',
  'Worldcoin'
);

export const WBTC_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.WBTC,
  8,
  'WBTC',
  'Wrapped BTC'
);

export const uXRP_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.uXRP,
  6,
  'uXRP',
  'XRP (Universal)'
);

export const uDOGE_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.uDOGE,
  8,
  'uDOGE',
  'Dogecoin (Universal)'
);

export const uSOL_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.uSOL,
  9,
  'uSOL',
  'Solana (Universal)'
);

export const uSUI_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.uSUI,
  9,
  'uSUI',
  'Sui (Universal)'
);

export const USDT0_TOKEN = new Token(
  WORLD_CHAIN_ID,
  TOKEN_ADDRESSES.USDT0,
  6,
  'USD₮0',
  'Stargate USD₮0'
);

// All available tokens on World Chain (ordered with World token first)
export const AVAILABLE_TOKENS = [
  WLD_TOKEN,    // Worldcoin (World token first)
  ETH_TOKEN,    // World Chain ETH
  USDC_TOKEN,   // USDC
  WBTC_TOKEN,   // Wrapped BTC
  uXRP_TOKEN,   // XRP (Universal)
  uDOGE_TOKEN,  // Dogecoin (Universal)
  uSOL_TOKEN,   // Solana (Universal)
  uSUI_TOKEN,   // Sui (Universal)
  USDT0_TOKEN,  // Stargate USD₮0
];

// Token icons mapping (using local images)
export const TOKEN_ICONS: { [key: string]: string } = {
  'ETH': '/eth.png',     // World Chain ETH
  'USDC': '/usdc.png',   // USDC
  'WLD': '/wld.png',     // Worldcoin
  'WBTC': '/wbtc.png',   // Wrapped BTC
  'uXRP': '/xrp.png',    // XRP (Universal)
  'uDOGE': '/doge.png',  // Dogecoin (Universal)
  'uSOL': '/solana.png', // Solana (Universal)
  'uSUI': '/sui.png',          // Sui (Universal) - no image available
  'USD₮0': '/usdt.png',  // Stargate USD₮0
};

// Common pool configurations for World Chain (matching available tokens)
export const POOL_CONFIGS = [
  {
    currency0: ETH_TOKEN.address,
    currency1: USDC_TOKEN.address,
    fee: 500, // 0.05%
    tickSpacing: 10,
    hooks: "0x0000000000000000000000000000000000000000",
  },
  {
    currency0: ETH_TOKEN.address,
    currency1: WLD_TOKEN.address,
    fee: 3000, // 0.3%
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000",
  },
  {
    currency0: ETH_TOKEN.address,
    currency1: WBTC_TOKEN.address,
    fee: 3000, // 0.3%
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000",
  },
  {
    currency0: WLD_TOKEN.address,
    currency1: USDC_TOKEN.address,
    fee: 1400, // 0.14%
    tickSpacing: 20,
    hooks: "0x0000000000000000000000000000000000000000",
  },
  {
    currency0: USDC_TOKEN.address,
    currency1: uXRP_TOKEN.address,
    fee: 500, // 0.05%
    tickSpacing: 10,
    hooks: "0x0000000000000000000000000000000000000000",
  },
  {
    currency0: USDC_TOKEN.address,
    currency1: uDOGE_TOKEN.address,
    fee: 500, // 0.05%
    tickSpacing: 10,
    hooks: "0x0000000000000000000000000000000000000000",
  },
  {
    currency0: USDC_TOKEN.address,
    currency1: USDT0_TOKEN.address,
    fee: 100, // 0.01%
    tickSpacing: 1,
    hooks: "0x0000000000000000000000000000000000000000",
  },
  {
    currency0: ETH_TOKEN.address,
    currency1: USDT0_TOKEN.address,
    fee: 500, // 0.05%
    tickSpacing: 10,
    hooks: "0x0000000000000000000000000000000000000000",
  },
];

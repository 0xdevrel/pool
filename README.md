## Pool - Liquidity Pools of World Chain

A mobile-first DeFi application for liquidity pools on World Chain, featuring privacy-preserving authentication via World ID in World App.

### Tech stack
- **Next.js App Router** (15)
- **React** 19
- **Tailwind CSS** 4 (custom CSS in `src/app/globals.css`)
- **Worldcoin MiniKit** (`@worldcoin/minikit-js`, `@worldcoin/minikit-react`)
- **React Icons** for UI elements

### Features
- **World ID Authentication**: Privacy-preserving wallet authentication via World App
- **Username Display**: Shows usernames instead of wallet addresses
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Dashboard Interface**: Clean, intuitive user interface for DeFi operations
- **iOS Scroll Bounce Prevention**: Smooth scrolling experience on iOS devices
- **Coming Soon Features**: Uniswap V4 integration, liquidity provision, token swapping

## How it works

### Authentication Flow
1. User opens the app in World App
2. `WalletAuthButton` component triggers `MiniKit.commandsAsync.walletAuth`
3. User signs a SIWE (Sign-In with Ethereum) message
4. Backend verifies the signature via `verifySiweMessage`
5. Username is fetched using `MiniKit.getUserByAddress()`
6. User is redirected to the dashboard

Key files:
- `src/components/WalletAuthButton.tsx`: Handles wallet authentication flow
- `src/app/api/nonce/route.ts`: Generates secure nonces for authentication
- `src/app/api/complete-siwe/route.ts`: Verifies SIWE signatures server-side
- `src/providers/minikit-provider.tsx`: Initializes MiniKit and provides loading state

### User Experience
- **Welcome Screen**: Features overview and authentication
- **Dashboard**: User profile, stats, and quick actions
- **Responsive Design**: Adapts to different screen sizes
- **Loading States**: Smooth transitions and feedback

## Project structure (high level)
- `src/app/page.tsx`: Welcome screen with features and authentication
- `src/app/dashboard/page.tsx`: Main dashboard interface
- `src/app/layout.tsx`: App shell, fonts, MiniKit provider
- `src/app/api/`: Authentication endpoints
  - `nonce/route.ts`: Nonce generation
  - `complete-siwe/route.ts`: SIWE verification
- `src/components/`: UI components
  - `WalletAuthButton.tsx`: Authentication component
- `src/providers/minikit-provider.tsx`: MiniKit initialization
- `public/`: App icons and manifest

## Prerequisites
- Node 18+ (Node 20+ recommended)
- A Worldcoin Developer account and a registered Mini App

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```
2. Start the dev server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
3. Open the app inside World App. If you open it in a normal browser, the authentication will show an error: "Please open this app in World App".

Tips for testing on device:
- Expose your local server via a tunnel (e.g., `ngrok`) and open that URL in World App
- The app uses SIWE (Sign-In with Ethereum) for authentication

## API Endpoints

### GET `/api/nonce`
Generates a secure nonce for SIWE authentication.

Response:
```json
{ "nonce": "random-uuid-string" }
```

### POST `/api/complete-siwe`
Verifies SIWE signature and completes authentication.

Body:
```json
{
  "payload": { /* MiniAppWalletAuthSuccessPayload from MiniKit */ },
  "nonce": "nonce-from-step-1"
}
```

Success response (200):
```json
{
  "status": "success",
  "isValid": true,
  "user": {
    "walletAddress": "0x...",
    "username": null
  }
}
```

## Scripts
- `pnpm dev`: Run Next.js dev server (Turbopack)
- `pnpm build`: Production build
- `pnpm start`: Run production server
- `pnpm lint`: Lint

## Deployment
- Deploy as a standard Next.js app
- Ensure the app is accessible via HTTPS for World App integration

## Features in Development
- **Uniswap V4 Integration**: Advanced liquidity pool features
- **Liquidity Provision**: Add/remove liquidity from pools
- **Token Swapping**: Direct token exchange functionality
- **Yield Optimization**: Automated yield farming strategies
- **Analytics Dashboard**: Detailed pool performance metrics

## Design Guidelines Compliance
This app follows World mini app guidelines:
- ✅ **Mobile-first design** with responsive layout
- ✅ **iOS scroll bounce prevention** implemented
- ✅ **Username display** instead of wallet addresses
- ✅ **Privacy-preserving authentication** via World ID
- ✅ **Clean, intuitive UI** with proper spacing and typography
- ✅ **Fast loading times** with optimized performance

## Known limitations
- The app must run inside World App for authentication to work (`MiniKit.isInstalled()` check)
- DeFi features are currently in development (coming soon)
- Requires World App for full functionality

## License
No license specified. Add one if you plan to distribute.

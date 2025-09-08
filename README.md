## Sudoku (World ID gated)

Minimal, mobile-first Sudoku that unlocks after a privacy-preserving World ID verification in World App (via Worldcoin MiniKit).

### Tech stack
- **Next.js App Router** (15)
- **React** 19
- **Tailwind CSS** 4 (custom CSS in `src/app/globals.css`)
- **Worldcoin MiniKit** (`@worldcoin/minikit-js`, `@worldcoin/minikit-react`)

### Features
- **World ID gate**: Users must verify in World App to start
- **Fresh puzzle** after successful verification
- **Three difficulties**: easy, medium, hard
- **Smart highlighting**: row/column/box of selected cell
- **Live validation** with error highlights
- **Timer, 3-mistake limit, 3-hint limit** with game over state
- **Mobile-first UI**

## How it works

### Verification flow
1. Client renders `VerifyButton` which calls `MiniKit.commandsAsync.verify` with `VerificationLevel.Orb`.
2. The returned proof (`ISuccessResult`) is POSTed to `POST /api/verify`.
3. The server verifies via `verifyCloudProof(payload, app_id, action, signal)` using your `app_id`.
4. On success (or when `max_verifications_reached` is returned), the app unlocks the game.

Key files:
- `src/components/VerifyButton.tsx`: Triggers verification and calls the API
- `src/app/api/verify/route.ts`: Verifies proof server-side (CORS enabled for dev)
- `src/providers/minikit-provider.tsx`: Installs MiniKit and guards initial render

### Game logic
- `src/components/SudokuGame.tsx` contains a simple generator/solver:
  - Backtracking creates a full valid grid
  - Cells are removed based on difficulty (40/50/60 removed)
  - Note: uniqueness of the puzzle is not guaranteed in this simple approach
- Validations highlight duplicates in rows, columns, and 3×3 boxes
- 3 mistakes or 3 used hints trigger game over

## Project structure (high level)
- `src/app/page.tsx`: Landing screen, gating, and game entry
- `src/app/layout.tsx`: App shell, fonts, MiniKit provider
- `src/app/api/verify/route.ts`: World ID proof verification endpoint
- `src/components/`: UI and game components
  - `SudokuGame.tsx`, `SudokuGrid.tsx`, `SudokuCell.tsx`, `NumberPad.tsx`, `VerifyButton.tsx`
- `src/providers/minikit-provider.tsx`: MiniKit init and loading UI
- `public/`: icons and assets (manifest optional)

## Prerequisites
- Node 18+ (Node 20+ recommended)
- A Worldcoin Developer account and a registered Mini App to obtain:
  - **App ID**: `app_...`
  - **Action ID**: e.g. `sudoku-game` (or your custom action)

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```
2. Create `.env.local` in the project root with your IDs:
   ```bash
   NEXT_PUBLIC_WLD_APP_ID=app_your_app_id
   NEXT_PUBLIC_WLD_ACTION_ID=sudoku-game
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
4. Open the app inside World App. If you open it in a normal browser, the Verify button will show an error: “Please open this app in World App”.

Tips for testing on device:
- Expose your local server via a tunnel (e.g., `ngrok`) and open that URL in World App
- CORS is permissive in `POST /api/verify` to ease local testing

## API
### POST `/api/verify`
Body:
```json
{
  "payload": { /* ISuccessResult from MiniKit */ },
  "action": "your-action-id",
  "signal": ""
}
```
Success response (200):
```json
{ "verifyRes": { "success": true, ... }, "status": 200 }
```
Also returns 200 with `alreadyVerified: true` when `max_verifications_reached` is encountered.

## Scripts
- `pnpm dev`: Run Next.js dev server (Turbopack)
- `pnpm build`: Production build
- `pnpm start`: Run production server
- `pnpm lint`: Lint

## Deployment
- Set `NEXT_PUBLIC_WLD_APP_ID` and `NEXT_PUBLIC_WLD_ACTION_ID` in your hosting env (e.g., Vercel)
- Deploy as a standard Next.js app

## Known limitations
- Sudoku generator does not enforce a unique solution for every puzzle
- The app must run inside World App for verification to work (`MiniKit.isInstalled()` check)
- `manifest.json` is referenced in `layout.tsx`; if you want PWA features, add it to `public/`

## License
No license specified. Add one if you plan to distribute.

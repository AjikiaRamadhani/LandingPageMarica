This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Printable WhatsApp and external game rewards

Printable downloads still require a signed-in account. After the user submits the required name, email, WhatsApp number, and child age, Marica prepares a short-lived PDF link and attempts delivery by email and WhatsApp. The download page reports each delivery result and keeps the direct download link available if a notification fails.

The current `.env` does not yet have WhatsApp Cloud API credentials, so email and the direct PDF download work, but WhatsApp delivery is reported as not configured. To enable it, Marica needs to connect a WhatsApp Business Platform (Meta Cloud API) number and add these server-side environment variables to `.env` locally and to the production host:

```text
WHATSAPP_CLOUD_ACCESS_TOKEN
WHATSAPP_CLOUD_PHONE_NUMBER_ID
WHATSAPP_GRAPH_API_VERSION
WHATSAPP_PRINTABLE_TEMPLATE_NAME
WHATSAPP_PRINTABLE_TEMPLATE_LANGUAGE=id
```

Set `WHATSAPP_CLOUD_ACCESS_TOKEN` to the Meta permanent/system-user access token, `WHATSAPP_CLOUD_PHONE_NUMBER_ID` to the sender number's Phone Number ID (not the phone number itself), and `WHATSAPP_GRAPH_API_VERSION` to a Graph API version currently supported by Meta. Create and get Meta approval for a WhatsApp message template in Indonesian with three body parameters, in this order: parent name (`{{1}}`), printable title (`{{2}}`), and the expiring download URL (`{{3}}`). Set its exact name and language in the corresponding template variables. The user must have opted in to receive WhatsApp messages. Do not put the access token in client-side code. Until these Meta setup steps are complete, WhatsApp won't send; the existing email and direct download remain available.

The four web games on `/edugames` currently open directly on their external websites. They do not award Marica Points: clicking a link or closing an external tab cannot prove that a user completed the game. A secure point flow requires game-site code to pass a launch token to its own backend and have that backend call Marica only after verifying completion.

The future server-verified flow is documented by these environment variable names; configure a unique random secret of at least 32 characters only when the matching game backend is ready to integrate:

```text
GAME_LAUNCH_TOKEN_SECRET
GAME_COMPLETION_KEY_PACU_JALUR
GAME_COMPLETION_KEY_PANJAT_PINANG
GAME_COMPLETION_KEY_DINO_ESCAPE
GAME_COMPLETION_KEY_ANGKASA_RASA
```

When a signed-in user launches a supported web game, `POST /api/games/launch` returns the game's URL with a 10-minute `maricaLaunchToken` in its URL fragment. The external game can read and then remove that fragment from the browser URL. Its server must verify that the player actually completed the game, then send `POST /api/games/{gameId}/complete` with `{"launchToken":"..."}` and the matching `x-game-api-key` header. Never put a completion key in browser code or trust a completion/score claim directly from the browser. Marica awards 50 points per verified completion, at most 1,000 game points per account per day (Asia/Jakarta), and ignores a repeated launch token. The game endpoints and payloads are listed in Swagger at `/api-docs`.

The mobile games linked to app stores do not participate in this web-game reward flow yet. Their app/backend needs the same trusted server-to-server integration before it can award points.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

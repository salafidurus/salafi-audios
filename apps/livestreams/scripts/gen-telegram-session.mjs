/* eslint-disable no-console */
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

console.log(`
=== Telegram Session Generator ===

Before you begin, you need a Telegram API ID and API Hash.
To get them:

  1. Go to https://my.telegram.org and log in with your Telegram phone number.
  2. Click "API development tools".
  3. Fill in any App title and short name (e.g. "MyApp" / "myapp"), then submit.
  4. Copy the "App api_id" (a number) → TELEGRAM_API_ID
     Copy the "App api_hash" (a hex string) → TELEGRAM_API_HASH

These are tied to your Telegram account — keep them private.
`);

const apiId = parseInt(await ask("API ID: "), 10);
const apiHash = await ask("API Hash: ");

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
  connectionRetries: 5,
});

await client.start({
  phoneNumber: async () => ask("Phone number (with country code, e.g. +447...): "),
  password: async () => ask("2FA password (press Enter to skip): "),
  phoneCode: async () => ask("Code sent to Telegram: "),
  onError: (err) => console.error(err),
});

console.log("\nAdd this to your .env file:\n");
console.log("TELEGRAM_SESSION=" + client.session.save());

await client.disconnect();
rl.close();

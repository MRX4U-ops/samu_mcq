/**
 * One-time helper script to generate your FREE Telegram MTProto Session String.
 *
 * Steps:
 * 1. Go to https://my.telegram.org and log in with your phone number.
 * 2. Click "API development tools" and create an app (free) to get api_id and api_hash.
 * 3. Run: node generate_telegram_session.js
 * 4. Copy the generated TELEGRAM_SESSION_STRING into backend/.env (and Render Environment Variables).
 */
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));

(async () => {
  console.log('\n=== FREE Telegram MTProto Session Generator ===\n');
  const apiId = parseInt(await ask('Enter TELEGRAM_API_ID: '), 10);
  const apiHash = await ask('Enter TELEGRAM_API_HASH: ');

  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await ask('Enter your Telegram phone number (with country code, e.g. +91...): '),
    password: async () => await ask('Enter 2FA password (if enabled, else press Enter): '),
    phoneCode: async () => await ask('Enter the OTP code sent to your Telegram app: '),
    onError: (err) => console.error('Error:', err.message),
  });

  console.log('\n✅ Login successful! Add these 4 variables to backend/.env & Render:\n');
  console.log(`TELEGRAM_API_ID=${apiId}`);
  console.log(`TELEGRAM_API_HASH=${apiHash}`);
  console.log(`TELEGRAM_SESSION_STRING=${client.session.save()}`);
  console.log(`TELEGRAM_GROUP_ID=<your_group_username_or_chat_id>\n`);

  // Also list recent groups/channels so the user can easily copy the exact ID
  console.log('--- Your Recent Groups / Channels ---');
  const dialogs = await client.getDialogs({ limit: 25 });
  for (const d of dialogs) {
    if (d.isGroup || d.isChannel) {
      console.log(`• ${d.title}  =>  ID: ${d.id.toString()}`);
    }
  }

  rl.close();
  process.exit(0);
})();

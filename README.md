# Discord Translation Bot

🌐 A Discord bot that allows users to translate messages into their own preferred languages (e.g. Hungarian 🇭🇺, Romanian 🇷🇴) using inline buttons. All translations are ephemeral — only visible to the user who requested them.

---

## ✨ Features

- Inline buttons under each message for language selection
- Personal preference toggle: enable/disable translations per user
- Hide translation button
- File-based preference persistence (`.prefs.json`)
- Clean code using `discord.js` v14

---

## ⚙️ Technologies

- Node.js
- discord.js v14
- dotenv
- axios
- JSON-based storage (no DB needed)

---

## 👥 Contributors

- **Grávuj Miklós Henrich** – Development & Maintenance [@gravuj-miklos-henrich](https://github.com/gravuj-miklos-henrich)
- **Lovász Mihály** – Idea & Community Support [@LovaszMisi](https://github.com/LovaszMisi)

---

## 🛠 Setup Instructions

```bash
git clone https://github.com/dorsium/discord-translation-bot.git
cd discord-translation-bot
npm install
```

Create a .env file:

```env
BOT_TOKEN=your-discord-bot-token
```

Then run:

```bash
node index.js
```

---

🔄 Built with ❤️ for multilingual communities.

require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');

// 🧠 User-specific translation settings (userID → enabled: true/false)
const userPrefs = new Map();
const PREFS_FILE = './.prefs.json';

// 🔧 Supported translation targets
const supportedLangs = ['hu', 'ro'];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

// 🔄 Load preferences from file
if (fs.existsSync(PREFS_FILE)) {
  try {
    const raw = fs.readFileSync(PREFS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    data.forEach(([key, val]) => userPrefs.set(key, val));
    console.log(`🔄 Loaded ${userPrefs.size} user preference(s) from file.`);
  } catch (err) {
    console.error('⚠️ Failed to load user preferences:', err);
  }
}

// ♻️ Helper to build the Enable/Disable button
function buildToggleButton(label) {
  return new ButtonBuilder()
    .setCustomId('toggle_prefs')
    .setLabel(label)
    .setEmoji('⚙️')
    .setStyle(ButtonStyle.Secondary);
}

// ♻️ Helper to build the full button row
function buildTranslationButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('translate_hu')
      .setLabel('Hungarian')
      .setEmoji('🇭🇺')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('translate_ro')
      .setLabel('Romanian')
      .setEmoji('🇷🇴')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('hide_translation')
      .setLabel('Hide')
      .setEmoji('🙈')
      .setStyle(ButtonStyle.Secondary),
    buildToggleButton('Disable')
  );
}

// 🌍 Buttons on new message + check who has translation enabled
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // ⛔ Translations disabled → show only the Enable button
  if (userPrefs.get(userId) === false) {
    const row = new ActionRowBuilder().addComponents(
      buildToggleButton('Enable')
    );

    await message.reply({
      content: '🔕 Translations are currently disabled for you.',
      components: [row],
      ephemeral: true
    });
    return;
  }

  // ✅ Translations enabled → show full button row
  const row = buildTranslationButtons();

  await message.reply({
    content: '🌐 Translate this message:',
    components: [row]
  });
});

// 🎯 Interactions (button clicks)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;

  // ⛔ Hide = hide the translation
  if (interaction.customId === 'hide_translation') {
    await interaction.deferUpdate();
    await interaction.deleteReply();
    return;
  }

  // ⚙️ Toggle = enable/disable translation
  if (interaction.customId === 'toggle_prefs') {
    const current = userPrefs.get(userId) ?? true;
    userPrefs.set(userId, !current);

    // 💾 Save preferences to file
    try {
      const jsonData = JSON.stringify([...userPrefs], null, 2);
      fs.writeFileSync(PREFS_FILE, jsonData, 'utf-8');
      console.log(`💾 Saved prefs for ${userId}: ${!current}`);
    } catch (err) {
      console.error('❌ Failed to save user preferences:', err);
    }

    await interaction.reply({
      content: `✅ Translations are now **${!current ? 'enabled' : 'disabled'}** for you.`,
      ephemeral: true
    });
    return;
  }

  // 🌐 Translation
  const targetLang = interaction.customId.replace('translate_', '');

  if (!supportedLangs.includes(targetLang)) {
    await interaction.reply({
      content: '❌ Unsupported language.',
      ephemeral: true
    });
    return;
  }

  const originalMessage = interaction.message.reference
    ? await interaction.channel.messages.fetch(interaction.message.reference.messageId)
    : interaction.message;

  const textToTranslate = originalMessage.content;

  try {
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: textToTranslate,
        langpair: `en|${targetLang}`
      }
    });

    const translated = response.data.responseData.translatedText;

    await interaction.reply({
      content: `📘 ${translated}`,
      ephemeral: true
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '❌ Translation failed.',
      ephemeral: true
    });
  }
});

client.login(process.env.BOT_TOKEN);

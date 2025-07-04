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

const userPrefs = new Map();
const PREFS_FILE = './.prefs.json';
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

function buildToggleButton(label) {
  return new ButtonBuilder()
    .setCustomId('toggle_prefs')
    .setLabel(label)
    .setEmoji('⚙️')
    .setStyle(ButtonStyle.Secondary);
}

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

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  const perms = message.channel.permissionsFor(client.user);
  if (!perms?.has('SendMessages')) return;

  try {
    if (userPrefs.get(userId) === false) {
      const row = new ActionRowBuilder().addComponents(buildToggleButton('Enable'));

      await message.reply({
        content: '🔕 Translations are currently disabled for you.',
        components: [row],
        flags: 64
      });
      return;
    }

    const row = buildTranslationButtons();

    await message.reply({
      content: '🌐 Translate this message:',
      components: [row]
    });
  } catch (err) {
    console.error(`❌ Failed to reply in #${message.channel.id}:`, err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;

  if (interaction.customId === 'hide_translation') {
    try {
      await interaction.deferUpdate();
      await interaction.deleteReply();
    } catch (err) {
      console.error('❌ Failed to hide translation:', err);
    }
    return;
  }

  if (interaction.customId === 'toggle_prefs') {
    const current = userPrefs.get(userId) ?? true;
    userPrefs.set(userId, !current);

    try {
      const jsonData = JSON.stringify([...userPrefs], null, 2);
      fs.writeFileSync(PREFS_FILE, jsonData, 'utf-8');
      console.log(`💾 Saved prefs for ${userId}: ${!current}`);
    } catch (err) {
      console.error('❌ Failed to save user preferences:', err);
    }

    try {
      await interaction.reply({
        content: `✅ Translations are now **${!current ? 'enabled' : 'disabled'}** for you.`,
        flags: 64
      });
    } catch (err) {
      console.error('❌ Failed to send toggle reply:', err);
    }

    return;
  }

  const targetLang = interaction.customId.replace('translate_', '');

  if (!supportedLangs.includes(targetLang)) {
    await interaction.reply({
      content: '❌ Unsupported language.',
      flags: 64
    });
    return;
  }

  let textToTranslate = '';

  try {
    let repliedMsg = null;
    if (interaction.message.reference?.messageId) {
      repliedMsg = await interaction.channel.messages.fetch(
        interaction.message.reference.messageId
      );
    }
    textToTranslate = repliedMsg?.content || interaction.message.content;
  } catch (err) {
    console.error('❌ Failed to fetch referenced message:', err);
    textToTranslate = interaction.message.content;
  }

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
      flags: 64
    });
  } catch (err) {
    console.error('❌ Translation failed:', err);
    await interaction.reply({
      content: '❌ Translation failed.',
      flags: 64
    });
  }
});

client.login(process.env.BOT_TOKEN);

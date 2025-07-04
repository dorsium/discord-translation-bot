import dotenv from 'dotenv';
import {
   Client,
   GatewayIntentBits,
   Partials,
   Events,
   ChannelType,
   TextChannel,
   PermissionFlagsBits,
   ActionRowBuilder,
   ButtonBuilder,
   MessageFlags,
} from 'discord.js';
import { loadPrefs, getPref, setPref } from './prefs';
import { buildToggleButton, buildTranslationButtons } from './ui';
import { translate } from './translation';

dotenv.config();

const supportedLangs = ['hu', 'ro'];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online: ${client.user?.tag}`);
});

async function init() {
  await loadPrefs();

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (
      !message.inGuild() ||
      (message.channel?.type !== ChannelType.GuildText &&
        message.channel?.type !== ChannelType.GuildAnnouncement)
    )
      return;

    const perms = (message.channel as TextChannel).permissionsFor(client.user!);
    if (!perms?.has(PermissionFlagsBits.SendMessages)) return;

    const userId = message.author.id;
    try {
      if (getPref(userId) === false) {
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(buildToggleButton('Enable'))
          .toJSON();
        await message.reply({
          content: '🔕 Translations are currently disabled for you.',
          components: [row],
          flags: MessageFlags.SuppressEmbeds,
        });
        return;
      }

      const row = buildTranslationButtons();
      await message.reply({
        content: '🌐 Translate this message:',
        components: [row],
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
      const current = getPref(userId) ?? true;
      await setPref(userId, !current);

      try {
        await interaction.reply({
          content: `✅ Translations are now **${!current ? 'enabled' : 'disabled'}** for you.`,
          flags: 64,
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
        flags: 64,
      });
      return;
    }

    let textToTranslate = '';
    try {
      const repliedId = interaction.message.reference?.messageId;
      const repliedMsg = repliedId
        ? await interaction.channel?.messages.fetch(repliedId)
        : null;
      textToTranslate = repliedMsg?.content || interaction.message.content;
    } catch (err) {
      console.error('❌ Failed to fetch referenced message:', err);
      textToTranslate = interaction.message.content;
    }

    try {
      const translated = await translate(textToTranslate, targetLang);
      await interaction.reply({
        content: `📘 ${translated}`,
        flags: 64,
      });
    } catch (err) {
      console.error('❌ Translation failed:', err);
      await interaction.reply({
        content: '❌ Translation failed.',
        flags: 64,
      });
    }
  });

  await client.login(process.env.BOT_TOKEN);
}

init().catch((err) => {
  console.error('❌ Failed to start bot:', err);
});

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function buildToggleButton(label: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId('toggle_prefs')
    .setLabel(label)
    .setEmoji('⚙️')
    .setStyle(ButtonStyle.Secondary);
}

export function buildTranslationButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
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

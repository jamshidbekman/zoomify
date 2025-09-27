import { Injectable, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { OpenAIService } from 'src/modules/openai/openai.service';
import { UserDocument } from 'src/modules/user/types/user';
import { UserService } from 'src/modules/user/user.service';
import { Context } from 'telegraf';
import { Menu } from '../markups/menu';
import { TelegramGroupService } from 'src/modules/telegram-group/telegram-group.service';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    private readonly openAiService: OpenAIService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly tgGroupService: TelegramGroupService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const from = ctx.from;
    let user: UserDocument;

    if (from?.id) {
      user = await this.userService.upsert({
        tg_id: from?.id.toString(),
        first_name: from.first_name,
        last_name: from.last_name,
        username: from.username,
      });
    }

    if (from?.id.toString() == this.configService.get<string>('BOT_ADMIN')) {
      ctx.reply('Assalomu alaykum!');
      ctx.reply('🏠 Asosiy menyu', Menu);
      return;
    }
    ctx.reply(
      `Assalomu alaykum! Botni rivojlantirish ishlari olib borilmoqda, tez kunda undan foydalanishingiz mumkin bo'ladi!\n\nRahmat!`,
    );
  }

  @On('my_chat_member')
  async onMyChatMember(@Ctx() ctx: Context) {
    const chat = ctx.update['my_chat_member'].chat;
    const from = ctx.update['my_chat_member'].from;
    const oldStatus = ctx.update['my_chat_member'].old_chat_member.status;
    const newStatus = ctx.update['my_chat_member'].new_chat_member.status;

    if (oldStatus === 'left' && newStatus === 'member') {
      await this.tgGroupService.add({
        admin_id: from.id,
        group_id: chat.id,
        title: chat.title,
      });
      return;
    }

    if (oldStatus === 'member' && newStatus === 'left') {
      await this.tgGroupService.remove(String(chat.id));
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Ctx, On, Update, Action, Hears } from 'nestjs-telegraf';
import { LessonService } from 'src/modules/lesson/lesson.service';
import { OpenAIService } from 'src/modules/openai/openai.service';
import { ReminderService } from 'src/modules/reminder/reminder.service';
import { TelegramGroupService } from 'src/modules/telegram-group/telegram-group.service';
import { Context, Markup } from 'telegraf';
import { getHours, isBefore, isToday, startOfDay } from 'date-fns';

@Update()
@Injectable()
export class BotCommand {
  constructor(
    private readonly tgGroupService: TelegramGroupService,
    private readonly openAiService: OpenAIService,
    private readonly reminderService: ReminderService,
    private readonly lessonService: LessonService,
  ) {}

  @Hears('✨ 👥 Guruhlarim ✨')
  async MyGroups(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;

    if (!user_id) {
      return ctx.reply('⚠️ Xatolik: foydalanuvchi aniqlanmadi!');
    }

    const groups = await this.tgGroupService.userGroups(user_id.toString());

    if (groups.length === 0) {
      ctx.reply('❌ Sizda hech qanday guruh mavjud emas!');
      return;
    }

    const buttons = await Promise.all(
      groups.map(async (g) => {
        try {
          const chat = await ctx.telegram.getChat(g.tg_id);
          let link: string | null = null;

          if ('username' in chat && chat.username) {
            link = `https://t.me/${chat.username}`;
          } else {
            try {
              const invite = await ctx.telegram.createChatInviteLink(g.tg_id);
              link = invite.invite_link;
            } catch (e) {
              link = null;
            }
          }

          if (link) {
            return [Markup.button.url(g.title, link)];
          } else {
            return [
              Markup.button.callback(`❌ ${g.title}`, `no_link_${g.tg_id}`),
            ];
          }
        } catch (err) {
          console.warn('Chatni olishda xatolik');
          return [];
        }
      }),
    );

    await ctx.reply(
      '✨ Sizning guruhlaringiz ✨',
      Markup.inlineKeyboard(buttons.flat(), { columns: 1 }),
    );
    return;
  }

  @Hears('➕ Yangi eslatma ➕')
  async createLessons(@Ctx() ctx: any) {
    ctx.session.step = 'waiting_for_title';
    await ctx.reply('Eslatma uchun nom yuboring:');
  }

  @Hears('🗓️ 📌 Eslatmalarim 📌')
  async reminders(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const reminders = await this.reminderService.getReminders(String(user_id));

    if (!reminders || reminders.length === 0) {
      await ctx.reply('❌ Eslatmalar mavjud emas!');
      return;
    }

    const buttons = reminders.map((r) => [
      Markup.button.callback(r.title, `reminder_${r.id}`),
    ]);

    await ctx.reply(
      '📌 Sizning eslatmalaringiz:',
      Markup.inlineKeyboard(buttons),
    );
  }

  @Action(/reminder_(.+)/)
  async reminderDetail(@Ctx() ctx: any) {
    const reminderId = ctx.match[1];
    const reminder = await this.reminderService.getReminder(reminderId);

    if (!reminder) {
      await ctx.answerCbQuery('❌ Eslatma topilmadi');
      return;
    }

    try {
      const group = await this.tgGroupService.getGroup(reminder.tg_group_id);
      let link: string | null = null;
      try {
        const chat = await ctx.telegram.getChat(reminder.tg_group_id);

        if ('username' in chat && chat.username) {
          link = `https://t.me/${chat.username}`;
        } else {
          try {
            const invite = await ctx.telegram.createChatInviteLink(
              reminder.tg_group_id,
            );
            link = invite.invite_link;
          } catch {
            link = null;
          }
        }
      } catch {
        link = null;
      }

      let message = `📌 Eslatma nomi: ${reminder.title}\n`;
      if (reminder.start_date) {
        message += `🕒 Birinchi eslatma sanasi: ${reminder.start_date}\n`;
      }
      message += `👥 Guruh: ${group?.title}\n`;
      message += link
        ? `🔗 Guruh havolasi: ${link}\n`
        : `🔗 Guruh havolasi: ❌ mavjud emas\n`;
      message += `🗓️ Darslar soni: ${reminder.lessons.length}\n`;

      await ctx.editMessageText(
        message,
        Markup.inlineKeyboard([
          [Markup.button.callback('❌ O‘chirish', `delete_${reminder.id}`)],
          [Markup.button.callback('⬅️ Orqaga', 'back_reminders')],
        ]),
      );
    } catch (err) {
      console.error(err);
      await ctx.reply('⚠️ Xatolik yuz berdi!');
    }
  }

  @Action(/delete_(.+)/)
  async deleteReminder(@Ctx() ctx: any) {
    const reminderId = ctx.match[1];
    await this.reminderService.delete(reminderId);
    await ctx.editMessageText('✅ Eslatma o‘chirildi');
  }

  @Action('back_reminders')
  async backReminders(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const reminders = await this.reminderService.getReminders(String(user_id));

    if (!reminders || reminders.length === 0) {
      await ctx.editMessageText('❌ Eslatmalar mavjud emas!');
      return;
    }

    const buttons = reminders.map((r) => [
      Markup.button.callback(r.title, `reminder_${r.id}`),
    ]);

    await ctx.editMessageText(
      '📌 Sizning eslatmalaringiz:',
      Markup.inlineKeyboard(buttons),
    );
  }

  @On('text')
  async handleText(@Ctx() ctx: any) {
    const text = ctx.message.text;

    if (ctx.session.step === 'waiting_for_title') {
      ctx.session.title = text;
      ctx.session.step = 'waiting_for_group';

      const groups = await this.tgGroupService.userGroups(ctx.from.id);
      if (!groups.length) {
        await ctx.reply('❌ Sizda hech qanday guruh topilmadi.');
        ctx.session.step = null;
        return;
      }

      ctx.session.availableGroups = groups;

      const groupButtons = groups.map((g) => [g.title]);

      await ctx.reply(
        `✅ Eslatma nomi qabul qilindi: ${text}\n\nEslatmani qaysi guruhga yuborish kerak, tanlang 👇:`,
        Markup.keyboard(groupButtons).resize(),
      );
      return;
    }

    if (ctx.session.step === 'waiting_for_group') {
      const groups = ctx.session.availableGroups || [];
      const selectedGroup = groups.find((g) => g.title === text);

      if (!selectedGroup) {
        await ctx.reply(
          '❌ Bunday guruh topilmadi. Iltimos, tugmalardan birini tanlang 👇',
          Markup.keyboard(groups.map((g) => [g.title])).resize(),
        );
        return;
      }

      ctx.session.group = {
        tg_id: selectedGroup.tg_id,
        title: selectedGroup.title,
      };
      ctx.session.step = 'waiting_for_schedule';

      await ctx.reply(
        `✅ Guruh qabul qilindi: ${selectedGroup.title}\n\nEndi jadval matnini yuboring:`,
        Markup.removeKeyboard(),
      );
      return;
    }

    if (ctx.session.step === 'waiting_for_schedule') {
      const scheduleText = text;
      const msg = await ctx.reply('Bir oz kuting...');
      const lessons = await this.openAiService.generate(scheduleText);

      await ctx.deleteMessage(msg.message_id);

      if (!lessons) {
        ctx.reply('⚠️ Tizimda xatolik yuz berdi!');
        ctx.session = {};
        return;
      }

      if (!lessons.is_valid) {
        await ctx.reply(
          '⚠️ Jadvalda noaniqlik bor, qaytadan aniq qilib yuboring!',
        );
        return;
      }

      const startDate = new Date(lessons.start_date);
      const now = new Date();
      const currentHour = getHours(now);

      if (isBefore(startDate, startOfDay(now))) {
        await ctx.reply(
          `⚠️ Kechagi yoki undan oldingi sanaga jadval qo'shib bo'lmaydi. Iltimos, bugun yoki bugundan keyingi sanadan boshlangan jadval yuboring!`,
        );
        return;
      }

      if (isToday(startDate) && currentHour >= 6) {
        await ctx.reply(
          "⚠️ Bugungi eslatmalar soat 06:00 da ishga tushiriladi. Hozir soat 06:00 dan o'tgan, shuning uchun bugungi eslatma ishlamaydi.\n\n" +
            'Iltimos, ertangi yoki undan keyingi sanadan boshlangan jadval yuboring!',
        );
        return;
      }

      const reminder = await this.reminderService.create({
        title: ctx.session.title,
        start_date: lessons.start_date,
        tg_group_id: ctx.session.group.tg_id,
        user_tg_id: ctx.from.id,
      });

      if (!reminder) {
        ctx.session = {};
        ctx.reply('⚠️ Tizimda xatolik yuz berdi!');
        return;
      }

      lessons.lessons.forEach(async (lesson) => {
        await this.lessonService.create({
          ...lesson,
          reminder: { id: reminder.id },
          teacher_name: lesson.teacher_name ?? undefined,
          subject: lesson.subject ?? undefined,
          end: lesson.end ?? undefined,
        });
      });

      await ctx.reply(
        `📅 Eslatma jadvali yaratildi:\n\n` +
          `📌 Eslatma nomi: ${ctx.session.title}\n` +
          `👥 Guruh: ${ctx.session.group.title}\n` +
          `📖 Jadvaldagi eslatmalar soni: ${lessons.lessons.length}`,
      );

      ctx.session = {};
    }
  }

  @Action(/no_link_.+/)
  async onNoLink(@Ctx() ctx: Context) {
    await ctx.answerCbQuery(
      `❌ Ushbu guruh maxfiy bo'lganligi sabab kirib bo‘lmadi!`,
    );
  }
}

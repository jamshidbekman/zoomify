import { TelegramGroupDocument } from 'src/modules/telegram-group/types/group';

export type UserDocument = {
  id: string;
  tg_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  tg_groups?: TelegramGroupDocument[];
};

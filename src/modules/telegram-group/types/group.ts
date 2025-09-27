import { UserDocument } from 'src/modules/user/types/user';

export type TelegramGroupDocument = {
  id: string;
  tg_id: string;
  title: string;
  user: Partial<UserDocument>;
  created_at: Date;
};

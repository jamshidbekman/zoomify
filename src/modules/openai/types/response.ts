export type Response = {
  is_valid: boolean;
  start_date: string;
  lessons: [
    {
      teacher_name: string | null;
      meet: string;
      start: string;
      end: string | null;
      subject: string | null;
    },
  ];
};

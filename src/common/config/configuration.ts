export const configuration = () => {
  return {
    PORT: process.env.PORT,
    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_ADMIN: process.env.BOT_ADMIN,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    DB_PORT: process.env.DB_PORT,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
  };
};

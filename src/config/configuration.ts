export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'early_edge',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiration: process.env.JWT_EXPIRATION || '7d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  autoApply: {
    maxApplicationsPerHour: parseInt(
      process.env.MAX_APPLICATIONS_PER_HOUR || '15',
      10,
    ),
    maxApplicationsPerDay: parseInt(
      process.env.MAX_APPLICATIONS_PER_DAY || '50',
      10,
    ),
    minDelaySeconds: parseInt(process.env.MIN_DELAY_SECONDS || '3', 10),
    maxDelaySeconds: parseInt(process.env.MAX_DELAY_SECONDS || '15', 10),
  },
});

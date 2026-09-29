import { createApp } from './app.js';
import { connectToDatabase, closeDatabaseConnection, getDb } from './config/db.js';
import { getEnv } from './config/env.js';
import { seedDatabase } from './utils/seed.js';

const env = getEnv();

async function bootstrap() {
  await connectToDatabase({
    mongoUri: env.mongoUri,
    mongoDbName: env.mongoDbName,
    mongoTlsAllowInvalidCertificates: env.mongoTlsAllowInvalidCertificates,
  });

  await seedDatabase(getDb());

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Backend server running at http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error.message);
  process.exit(1);
});

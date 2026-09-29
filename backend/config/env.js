import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export function getEnv() {
  const rawTlsAllowInvalid = String(process.env.MONGODB_TLS_ALLOW_INVALID_CERTIFICATES || '').toLowerCase();

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.BACKEND_PORT || 5000),
    mongoUri: process.env.MONGODB_URI || '',
    mongoDbName: process.env.MONGODB_DB_NAME || 'royalsalon',
    mongoTlsAllowInvalidCertificates: rawTlsAllowInvalid === 'true' || rawTlsAllowInvalid === '1',
  };
}

import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config({ path: '.env.local' });
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'royalsalon';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const serviceNames = [
  'Royal Haircut',
  'Classic Facial',
  'Luxury Shaving',
  'Beard Grooming',
  'Hair Coloring',
  'Manicure & Pedicure',
];

async function main() {
  await client.connect();
  const db = client.db(dbName);

  for (const name of serviceNames) {
    const docs = await db.collection('services').find({ name }).sort({ createdAt: 1 }).toArray();
    if (docs.length > 1) {
      const duplicateIds = docs.slice(1).map((doc) => doc._id);
      await db.collection('services').deleteMany({ _id: { $in: duplicateIds } });
      console.log(`Removed ${duplicateIds.length} duplicate records for ${name}`);
    }
  }

  const count = await db.collection('services').countDocuments({});
  console.log(`services-after-cleanup=${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });

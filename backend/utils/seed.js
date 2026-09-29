import { defaultServices } from '../data/defaultServices.js';

export async function seedDatabase(db) {
  const servicesCollection = db.collection('services');
  const now = new Date();

  for (const service of defaultServices) {
    const matches = await servicesCollection.find({ name: service.name }).sort({ createdAt: 1 }).toArray();

    if (matches.length === 0) {
      await servicesCollection.insertOne({
        ...service,
        createdAt: now,
        updatedAt: now,
      });
      continue;
    }

    const [primary, ...duplicates] = matches;
    await servicesCollection.updateOne(
      { _id: primary._id },
      {
        $set: {
          ...service,
          updatedAt: now,
        },
      }
    );

    if (duplicates.length > 0) {
      await servicesCollection.deleteMany({ _id: { $in: duplicates.map((doc) => doc._id) } });
    }
  }

  console.log('Default salon services are ready.');
}

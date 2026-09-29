export async function trimCollectionAsQueue(db, collectionName, keepCount = 6) {
  const collection = db.collection(collectionName);
  let totalRecords = await collection.countDocuments({});

  while (totalRecords > keepCount) {
    const [oldestRecord] = await collection.find({}).sort({ createdAt: 1 }).limit(1).toArray();

    if (!oldestRecord?._id) {
      break;
    }

    await collection.deleteOne({ _id: oldestRecord._id });
    totalRecords -= 1;
  }
}

import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

router.get('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const services = await db.collection('services').find({}).sort({ createdAt: -1 }).limit(200).toArray();
  res.json({ items: services });
}));

router.post('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const payload = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('services').insertOne(payload);
  const created = await db.collection('services').findOne({ _id: result.insertedId });
  res.status(201).json(created);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const db = getDb();
  const id = parseId(req.params.id);

  await db.collection('services').updateOne(
    { _id: id },
    {
      $set: {
        ...req.body,
        updatedAt: new Date(),
      },
    }
  );

  const updated = await db.collection('services').findOne({ _id: id });
  res.json(updated);
}));

export default router;

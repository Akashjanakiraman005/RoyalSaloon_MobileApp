import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { trimCollectionAsQueue } from '../utils/queueTrim.js';

const router = Router();
const MAX_CUSTOMER_DETAILS = 6;

function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 15);
}

router.get('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const customers = await db.collection('customers').find({}).sort({ createdAt: -1 }).limit(200).toArray();
  res.json({ items: customers });
}));

router.post('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const phoneDigits = normalizePhoneDigits(req.body?.phone);
  const payload = {
    ...req.body,
    ...(phoneDigits ? { phone: phoneDigits } : {}),
    visits: Number(req.body?.visits || 0),
    totalSpent: Number(req.body?.totalSpent || 0),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('customers').insertOne(payload);
  await trimCollectionAsQueue(db, 'customers', MAX_CUSTOMER_DETAILS);
  const created = await db.collection('customers').findOne({ _id: result.insertedId });
  res.status(201).json(created);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const db = getDb();
  const id = parseId(req.params.id);
  const phoneDigits = normalizePhoneDigits(req.body?.phone);

  await db.collection('customers').updateOne(
    { _id: id },
    {
      $set: {
        ...req.body,
        ...(phoneDigits ? { phone: phoneDigits } : {}),
        updatedAt: new Date(),
      },
    }
  );

  const updated = await db.collection('customers').findOne({ _id: id });
  res.json(updated);
}));

export default router;

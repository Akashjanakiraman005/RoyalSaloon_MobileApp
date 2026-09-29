import { Router } from 'express';
import { getDb } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const settings = await db.collection('settings').findOne({ key: 'salon-settings' });
  res.json(settings || null);
}));

router.put('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const now = new Date();

  await db.collection('settings').updateOne(
    { key: 'salon-settings' },
    {
      $set: {
        key: 'salon-settings',
        ...req.body,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );

  const settings = await db.collection('settings').findOne({ key: 'salon-settings' });
  res.json(settings);
}));

export default router;

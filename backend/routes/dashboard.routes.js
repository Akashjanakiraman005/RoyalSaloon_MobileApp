import { Router } from 'express';
import { getDb } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [customersCount, servicesCount, billsCount, revenueAgg, monthlyRevenueAgg, monthlySeriesAgg] = await Promise.all([
    db.collection('customers').countDocuments({}),
    db.collection('services').countDocuments({}),
    db.collection('bills').countDocuments({}),
    db.collection('bills').aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
        },
      },
    ]).toArray(),
    db.collection('bills').aggregate([
      {
        $match: {
          createdAt: {
            $gte: monthStart,
            $lt: nextMonthStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
        },
      },
    ]).toArray(),
    db.collection('bills').aggregate([
      {
        $match: {
          createdAt: { $type: 'date' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
          billsCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]).toArray(),
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  const monthlyRevenue = monthlyRevenueAgg[0]?.totalRevenue || 0;
  const monthlySeries = monthlySeriesAgg
    .filter((item) => item?._id?.year && item?._id?.month)
    .map((item) => ({
      year: item._id.year,
      month: item._id.month,
      label: `${String(item._id.month).padStart(2, '0')}/${item._id.year}`,
      totalRevenue: Number(item.totalRevenue || 0),
      billsCount: Number(item.billsCount || 0),
    }));

  res.json({
    customersCount,
    servicesCount,
    billsCount,
    totalRevenue,
    monthlyRevenue,
    monthlySeries,
  });
}));

export default router;

import { Router } from 'express';
import { ObjectId } from 'mongodb';
import PDFDocument from 'pdfkit';
import { getDb } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { trimCollectionAsQueue } from '../utils/queueTrim.js';

const router = Router();
const MAX_BILL_DETAILS = 6;
const MAX_CUSTOMER_DETAILS = 6;

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 15);
}

function buildCustomerFilter(bill) {
  if (bill?.customerId) {
    return { _id: parseId(bill.customerId) };
  }

  const phoneDigits = normalizePhoneDigits(bill?.customerPhone || bill?.phone);
  if (phoneDigits) {
    return { phone: phoneDigits };
  }

  const name = String(bill?.customerName || bill?.name || '').trim();
  if (name) {
    return { name };
  }

  return null;
}

async function syncCustomerLedger(db, bill) {
  const filter = buildCustomerFilter(bill);
  if (!filter) {
    return;
  }

  const now = new Date();
  const totalAmount = Number(bill?.totalAmount || bill?.amount || 0);
  const phoneDigits = normalizePhoneDigits(bill?.customerPhone || bill?.phone);
  const customerName = String(bill?.customerName || bill?.name || 'Customer').trim() || 'Customer';

  const setFields = {
    name: customerName,
    updatedAt: now,
    lastVisit: bill?.createdAt || now,
    lastPaymentMethod: bill?.paymentMethod || bill?.method || 'cash',
    lastPaymentAmount: totalAmount,
    lastBillId: String(bill?._id || ''),
    lastServices: Array.isArray(bill?.services) ? bill.services.slice(-5) : [],
    tier: bill?.customerTier || bill?.tier || 'Standard Client',
  };

  if (phoneDigits) {
    setFields.phone = phoneDigits;
  }

  if (bill?.customerEmail || bill?.email) {
    setFields.email = bill.customerEmail || bill.email;
  }

  await db.collection('customers').updateOne(
    filter,
    {
      $set: setFields,
      $setOnInsert: {
        createdAt: bill?.createdAt || now,
      },
      $inc: {
        visits: 1,
        totalSpent: totalAmount,
      },
    },
    { upsert: true }
  );

  await trimCollectionAsQueue(db, 'customers', MAX_CUSTOMER_DETAILS);
}

function getBillIdString(bill) {
  return String(bill?._id || '');
}

router.get('/:id', asyncHandler(async (req, res) => {
  const db = getDb();
  const bill = await db.collection('bills').findOne({ _id: parseId(req.params.id) });

  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  res.json(bill);
}));

router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const db = getDb();
  const bill = await db.collection('bills').findOne({ _id: parseId(req.params.id) });

  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  const serviceDetails = await db.collection('services').find({ name: { $in: bill.services || [] } }).toArray();
  const serviceLookup = new Map(serviceDetails.map((service) => [service.name, service]));
  const pdf = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=royalsalon-bill-${getBillIdString(bill)}.pdf`);

  pdf.pipe(res);

  pdf.fillColor('#34146c').fontSize(22).font('Helvetica-Bold').text('RoyalSalon Luxury Concierge', { align: 'center' });
  pdf.moveDown(0.4);
  pdf.fillColor('#735b24').fontSize(11).font('Helvetica').text('Luxury Service Bill', { align: 'center' });
  pdf.moveDown(1.2);

  pdf.fillColor('#1f2937').fontSize(12).font('Helvetica-Bold').text('Bill Details');
  pdf.moveDown(0.4);
  pdf.font('Helvetica').fontSize(10);
  pdf.text(`Bill ID: ${String(bill._id)}`);
  pdf.text(`Customer: ${bill.customerName || '-'}`);
  pdf.text(`Payment Method: ${String(bill.paymentMethod || '-').toUpperCase()}`);
  pdf.text(`Status: ${bill.status || '-'}`);
  pdf.text(`Date: ${bill.createdAt ? new Date(bill.createdAt).toLocaleString('en-IN') : '-'}`);
  pdf.moveDown(0.8);

  pdf.fillColor('#34146c').font('Helvetica-Bold').fontSize(12).text('Services');
  pdf.moveDown(0.4);

  const services = Array.isArray(bill.services) ? bill.services : [];
  if (services.length === 0) {
    pdf.fillColor('#6b7280').font('Helvetica').fontSize(10).text('No services recorded on this bill.');
  } else {
    services.forEach((serviceName, index) => {
      const service = serviceLookup.get(serviceName);
      const price = service ? Number(service.price || 0) : 0;

      pdf.roundedRect(40, pdf.y, 515, 44).stroke('#ddd6fe');
      pdf.y += 10;
      pdf.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text(`${index + 1}. ${serviceName}`, 52, pdf.y);
      pdf.fillColor('#34146c').font('Helvetica-Bold').text(formatCurrency(price), 450, pdf.y, { width: 80, align: 'right' });
      pdf.y += 24;
      pdf.fillColor('#6b7280').font('Helvetica').fontSize(9).text(service?.category || 'Salon service', 52, pdf.y);
      pdf.y += 18;
      pdf.moveDown(0.3);
    });
  }

  pdf.moveDown(1);
  pdf.fillColor('#1f2937').font('Helvetica-Bold').fontSize(12).text('Summary', { align: 'right' });
  pdf.font('Helvetica').fontSize(10).fillColor('#374151');
  pdf.text(`Subtotal: ${formatCurrency(Math.max(0, Number(bill.totalAmount || 0) / 1.18))}`, { align: 'right' });
  pdf.text('Discount: -₹0.00', { align: 'right' });
  pdf.text(`Tax (GST 18%): ${formatCurrency(Number(bill.totalAmount || 0) - Number(bill.totalAmount || 0) / 1.18)}`, { align: 'right' });
  pdf.fillColor('#34146c').font('Helvetica-Bold').fontSize(14).text(`Grand Total: ${formatCurrency(bill.totalAmount || 0)}`, { align: 'right' });

  pdf.moveDown(2);
  pdf.fillColor('#735b24').font('Helvetica').fontSize(10).text('Thank you for choosing RoyalSalon Luxury Concierge.', { align: 'center' });
  pdf.end();
}));

router.get('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const bills = await db.collection('bills').find({}).sort({ createdAt: -1 }).limit(300).toArray();
  res.json({ items: bills });
}));

router.post('/', asyncHandler(async (req, res) => {
  const db = getDb();

  const payload = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('bills').insertOne(payload);
  await trimCollectionAsQueue(db, 'bills', MAX_BILL_DETAILS);
  const created = await db.collection('bills').findOne({ _id: result.insertedId });
  if (created) {
    await syncCustomerLedger(db, created);
  }
  res.status(201).json(created);
}));

export default router;

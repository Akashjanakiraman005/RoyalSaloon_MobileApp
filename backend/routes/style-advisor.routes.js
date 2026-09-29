import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const FACE_SHAPES = new Set(['oval', 'round', 'square', 'heart', 'oblong']);

const hairstyleIdeasByFaceShape = {
  oval: [
    { title: 'Textured Lob', maintenanceLevel: 'medium', whyItWorks: 'Keeps your natural balance while adding modern movement.' },
    { title: 'Curtain Bang Layers', maintenanceLevel: 'low', whyItWorks: 'Frames the face softly without over-shortening proportions.' },
    { title: 'Soft Shag Cut', maintenanceLevel: 'medium', whyItWorks: 'Adds dimension and personality while staying face-balanced.' },
    { title: 'Classic Pixie with Volume', maintenanceLevel: 'high', whyItWorks: 'Oval proportions support short styles with structured lift.' },
    { title: 'Long Butterfly Layers', maintenanceLevel: 'medium', whyItWorks: 'Enhances flow and fullness while preserving symmetry.' },
    { title: 'Shoulder-Length Wave Cut', maintenanceLevel: 'low', whyItWorks: 'A polished shape that works naturally with oval contours.' },
  ],
  round: [
    { title: 'Angled Lob', maintenanceLevel: 'medium', whyItWorks: 'Longer front lines visually elongate the face.' },
    { title: 'Long Layers with Crown Lift', maintenanceLevel: 'medium', whyItWorks: 'Creates vertical structure for a slimmer profile.' },
    { title: 'Side-Swept Wave Cut', maintenanceLevel: 'low', whyItWorks: 'Diagonal flow reduces circular emphasis.' },
    { title: 'Asymmetric Bob', maintenanceLevel: 'high', whyItWorks: 'Uneven structure adds length and edge.' },
    { title: 'Face-Framing U-Cut', maintenanceLevel: 'low', whyItWorks: 'Controlled layering keeps the look elongated.' },
    { title: 'Mid-Length Feather Layers', maintenanceLevel: 'medium', whyItWorks: 'Adds height and texture without adding width.' },
  ],
  square: [
    { title: 'Feathered Layer Cut', maintenanceLevel: 'medium', whyItWorks: 'Softens jawline definition with light edges.' },
    { title: 'Wavy Shoulder Cut', maintenanceLevel: 'low', whyItWorks: 'Wave movement offsets angular facial lines.' },
    { title: 'Side Fringe Lob', maintenanceLevel: 'medium', whyItWorks: 'Adds softness around forehead and cheek transitions.' },
    { title: 'Airy Long Layers', maintenanceLevel: 'low', whyItWorks: 'Creates flow that relaxes sharp geometry.' },
    { title: 'Textured Collarbone Bob', maintenanceLevel: 'medium', whyItWorks: 'Balances strong jaw with subtle texture.' },
    { title: 'Soft C-Curl Cut', maintenanceLevel: 'high', whyItWorks: 'Rounded styling smooths facial angles.' },
  ],
  heart: [
    { title: 'Chin-Length Textured Bob', maintenanceLevel: 'medium', whyItWorks: 'Adds volume near the jaw for better balance.' },
    { title: 'Side-Parted Long Layers', maintenanceLevel: 'low', whyItWorks: 'Reduces forehead emphasis while keeping length.' },
    { title: 'Collarbone Soft Waves', maintenanceLevel: 'low', whyItWorks: 'Distributes fullness around lower face.' },
    { title: 'Curtain Fringe Medium Cut', maintenanceLevel: 'medium', whyItWorks: 'Blends upper-face width with softer framing.' },
    { title: 'French Bob with Movement', maintenanceLevel: 'high', whyItWorks: 'Keeps top light and adds controlled lower volume.' },
    { title: 'Layered Lob with Ends Flip', maintenanceLevel: 'medium', whyItWorks: 'Creates width around chin area elegantly.' },
  ],
  oblong: [
    { title: 'French Bob', maintenanceLevel: 'high', whyItWorks: 'Short length visually reduces vertical proportion.' },
    { title: 'Curtain Bang Shoulder Cut', maintenanceLevel: 'medium', whyItWorks: 'Breaks face length and adds width.' },
    { title: 'Textured Medium Waves', maintenanceLevel: 'low', whyItWorks: 'Horizontal fullness balances long facial lines.' },
    { title: 'Blunt Lob with Soft Fringe', maintenanceLevel: 'medium', whyItWorks: 'Adds shape and controls excessive length effect.' },
    { title: 'Layered Wavy Bob', maintenanceLevel: 'medium', whyItWorks: 'Builds side volume for a balanced silhouette.' },
    { title: 'Classic Curls Mid-Length', maintenanceLevel: 'high', whyItWorks: 'Curls add width and visual compactness.' },
  ],
};

const hairstyleImageOverridesByTitle = {
  'Textured Lob': 'front/front-lob.svg',
  'Classic Pixie with Volume': 'front/front-pixie.svg',
  'Asymmetric Bob': 'front/front-bob.svg',
  'Chin-Length Textured Bob': 'front/front-bob.svg',
  'French Bob': 'front/front-bob.svg',
  'French Bob with Movement': 'front/front-bob.svg',
};

const hairstyleImageMatchers = [
  { test: /pixie/, fileName: 'front/front-pixie.svg' },
  { test: /french\s*bob/, fileName: 'front/front-bob.svg' },
  { test: /asymmetric\s*bob/, fileName: 'front/front-bob.svg' },
  { test: /chin[-\s]?length.*bob|textured.*bob/, fileName: 'front/front-bob.svg' },
  { test: /\bbob\b/, fileName: 'front/front-bob.svg' },
  { test: /curtain.*shoulder|shoulder.*curtain/, fileName: 'front/front-curtain-bangs.svg' },
  { test: /curtain|fringe/, fileName: 'front/front-curtain-bangs.svg' },
  { test: /shag/, fileName: 'front/front-shag.svg' },
  { test: /feather/, fileName: 'front/front-shag.svg' },
  { test: /wave|wavy|curl/, fileName: 'front/front-wavy.svg' },
  { test: /lob|collarbone/, fileName: 'front/front-lob.svg' },
  { test: /butterfly|layer|u-cut/, fileName: 'front/front-curtain-bangs.svg' },
  { test: /textured/, fileName: 'front/front-lob.svg' },
];

function resolveHairstyleImageFileName(title) {
  const exactFileName = hairstyleImageOverridesByTitle[title];

  if (exactFileName) {
    return exactFileName;
  }

  const normalizedTitle = normalizeText(title);
  const matched = hairstyleImageMatchers.find((rule) => rule.test.test(normalizedTitle));
  return matched?.fileName || 'front/front-lob.svg';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function randomSuitabilityScore() {
  return 74 + Math.floor(Math.random() * 23);
}

function createHairstyleImageUrl(req, title) {
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';
  const fileName = resolveHairstyleImageFileName(title);

  return `${protocol}://${host}/media/hairstyles/${fileName}`;
}

router.post('/recommendations', asyncHandler(async (req, res) => {
  const faceShape = normalizeText(req.body?.faceShape);
  const confidenceInput = Number(req.body?.confidence || 0);
  const confidence = Number.isFinite(confidenceInput) ? Math.max(0, Math.min(1, confidenceInput)) : 0;

  if (!FACE_SHAPES.has(faceShape)) {
    res.status(400).json({
      ok: false,
      message: 'faceShape must be one of: oval, round, square, heart, oblong',
    });
    return;
  }

  const ideaPool = hairstyleIdeasByFaceShape[faceShape] || [];
  const recommendations = shuffle(ideaPool)
    .slice(0, 4)
    .map((item, index) => ({
      id: `idea-${faceShape}-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
      title: item.title,
      imageUrl: createHairstyleImageUrl(req, item.title),
      whyItWorks: item.whyItWorks,
      maintenanceLevel: item.maintenanceLevel,
      suitabilityScore: randomSuitabilityScore(),
      estimatedPrice: null,
      category: 'Hairstyle Idea',
      source: 'ai-face-shape-lookbook',
    }));

  res.json({
    ok: true,
    model: {
      name: 'MediaPipe Face Landmarker',
      execution: 'frontend-on-device',
      version: 'v2 task model',
    },
    analysis: {
      faceShape,
      confidence,
    },
    recommendations,
    disclaimer: 'These are random hairstyle ideas matched to face shape, not your current service catalog.',
  });
}));

export default router;

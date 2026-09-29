import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

let faceLandmarkerPromise;

function euclideanDistance(a, b) {
  const dx = Number(a?.x || 0) - Number(b?.x || 0);
  const dy = Number(a?.y || 0) - Number(b?.y || 0);
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toPercent(value) {
  return Math.round(clamp(value, 0, 1) * 100);
}

async function getFaceLandmarker() {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_ASSET_URL,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
      });
    })();
  }

  return faceLandmarkerPromise;
}

function classifyFaceShape(landmarks) {
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const foreheadLeft = landmarks[127];
  const foreheadRight = landmarks[356];
  const chin = landmarks[152];
  const top = landmarks[10];
  const jawLeft = landmarks[172];
  const jawRight = landmarks[397];

  const cheekWidth = euclideanDistance(leftCheek, rightCheek);
  const foreheadWidth = euclideanDistance(foreheadLeft, foreheadRight);
  const jawWidth = euclideanDistance(jawLeft, jawRight);
  const faceLength = euclideanDistance(top, chin);

  const lengthToWidth = faceLength / Math.max(cheekWidth, 0.0001);
  const jawToForehead = jawWidth / Math.max(foreheadWidth, 0.0001);
  const foreheadToJaw = foreheadWidth / Math.max(jawWidth, 0.0001);

  let faceShape = 'oval';
  let confidence = 0.66;

  if (lengthToWidth > 1.48) {
    faceShape = 'oblong';
    confidence = clamp((lengthToWidth - 1.35) / 0.25, 0.55, 0.92);
  } else if (lengthToWidth < 1.2 && jawToForehead > 0.9 && jawToForehead < 1.1) {
    faceShape = 'round';
    confidence = clamp((1.22 - lengthToWidth) / 0.22, 0.55, 0.88);
  } else if (jawToForehead >= 1.06 && lengthToWidth >= 1.2 && lengthToWidth <= 1.43) {
    faceShape = 'square';
    confidence = clamp((jawToForehead - 0.98) / 0.14, 0.55, 0.89);
  } else if (foreheadToJaw > 1.1) {
    faceShape = 'heart';
    confidence = clamp((foreheadToJaw - 1.04) / 0.14, 0.54, 0.9);
  }

  return {
    faceShape,
    confidence,
    metrics: {
      lengthToWidth: Number(lengthToWidth.toFixed(3)),
      jawToForehead: Number(jawToForehead.toFixed(3)),
      foreheadToJaw: Number(foreheadToJaw.toFixed(3)),
      confidencePercent: toPercent(confidence),
    },
  };
}

export async function analyzeFaceFromImageElement(imageElement) {
  const landmarker = await getFaceLandmarker();
  const detection = landmarker.detect(imageElement);
  const landmarks = detection?.faceLandmarks?.[0];

  if (!landmarks?.length) {
    throw new Error('No face detected. Please upload a clear front-facing photo.');
  }

  return classifyFaceShape(landmarks);
}

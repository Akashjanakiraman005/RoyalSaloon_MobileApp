import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Camera, Upload, ShieldCheck, Loader2, WandSparkles, Gauge, Scissors, Video, VideoOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { analyzeFaceFromImageElement } from '../../lib/faceAdvisor';
import { apiPost } from '../../lib/api';
import { cn } from '../../lib/utils';

function shapeTitle(shape) {
  const value = String(shape || '').trim();
  if (!value) return '-';
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Custom quote';
  }

  return `INR ${amount.toLocaleString('en-IN')}`;
}

function fallbackHairstyleImage(title, faceShape, index) {
  const imageByTitle = {
    'Textured Lob': 'front/front-lob.svg',
    'Classic Pixie with Volume': 'front/front-pixie.svg',
    'Asymmetric Bob': 'front/front-bob.svg',
    'Chin-Length Textured Bob': 'front/front-bob.svg',
    'French Bob': 'front/front-bob.svg',
    'French Bob with Movement': 'front/front-bob.svg',
  };

  if (imageByTitle[title]) {
    return `/media/hairstyles/${imageByTitle[title]}`;
  }

  const normalizedTitle = String(title || '').toLowerCase();
  const textMatchers = [
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

  const matched = textMatchers.find((rule) => rule.test.test(normalizedTitle));
  if (matched) {
    return `/media/hairstyles/${matched.fileName}`;
  }

  const imagePoolByShape = {
    oval: ['front/front-lob.svg', 'front/front-curtain-bangs.svg', 'front/front-shag.svg', 'front/front-pixie.svg'],
    round: ['front/front-lob.svg', 'front/front-bob.svg', 'front/front-shag.svg', 'front/front-curtain-bangs.svg'],
    square: ['front/front-bob.svg', 'front/front-lob.svg', 'front/front-shag.svg', 'front/front-wavy.svg'],
    heart: ['front/front-bob.svg', 'front/front-curtain-bangs.svg', 'front/front-shag.svg', 'front/front-lob.svg'],
    oblong: ['front/front-bob.svg', 'front/front-curtain-bangs.svg', 'front/front-wavy.svg', 'front/front-lob.svg'],
  };

  const shape = String(faceShape || '').toLowerCase();
  const imagePool = imagePoolByShape[shape] || imagePoolByShape.oval;
  const fileName = imagePool[Math.abs(Number(index) || 0) % imagePool.length] || 'front/front-lob.svg';

  return `/media/hairstyles/${fileName}`;
}

async function loadImageElementFromFile(file) {
  const src = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(src);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error('Unable to load image. Please try another photo.'));
    };
    image.src = src;
  });
}

export default function StyleAdvisor() {
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [modelMeta, setModelMeta] = useState(null);
  const [disclaimer, setDisclaimer] = useState('');

  const hasResults = Boolean(analysis && recommendations.length);

  const confidenceChipClass = useMemo(() => {
    const confidence = Number(analysis?.confidence || 0);

    if (confidence >= 0.8) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }

    if (confidence >= 0.6) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }

    return 'bg-stone-100 text-stone-600 border-stone-200';
  }, [analysis]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(localPreviewUrl);
    setAnalysis(null);
    setRecommendations([]);
    setDisclaimer('');
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Camera is not supported in this browser.');
        return;
      }

      if (cameraStreamRef.current) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
      toast.success('Live camera is ready.');
    } catch (error) {
      console.error(error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  };

  const runRecommendations = async (localAnalysis) => {
    const recommendationResponse = await apiPost('/api/style-advisor/recommendations', {
      faceShape: localAnalysis.faceShape,
      confidence: localAnalysis.confidence,
    });

    setAnalysis(localAnalysis);
    setRecommendations(recommendationResponse.recommendations || []);
    setModelMeta(recommendationResponse.model || null);
    setDisclaimer(recommendationResponse.disclaimer || '');
    toast.success('Style recommendations are ready.');
  };

  const runAdvisor = async () => {
    if (!selectedFile) {
      toast.error('Upload a selfie to continue.');
      return;
    }

    if (!consentChecked) {
      toast.error('Please accept consent to analyze your selfie.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const imageElement = await loadImageElementFromFile(selectedFile);
      const localAnalysis = await analyzeFaceFromImageElement(imageElement);
      await runRecommendations(localAnalysis);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Unable to run style advisor.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAdvisorFromCamera = async () => {
    if (!cameraReady || !videoRef.current) {
      toast.error('Start the live camera first.');
      return;
    }

    if (!consentChecked) {
      toast.error('Please accept consent to analyze your selfie.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const video = videoRef.current;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to capture image from camera.');
      }

      context.drawImage(video, 0, 0, width, height);

      const localAnalysis = await analyzeFaceFromImageElement(canvas);
      await runRecommendations(localAnalysis);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Unable to detect face from live camera.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="text-gold font-headline font-bold text-xs uppercase tracking-[0.3em]">AI Concierge</span>
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-stone-900 mt-2">Style Advisor</h2>
          <p className="text-stone-500 mt-2 max-w-2xl">Upload a front-facing selfie and get face-shape matched hairstyle ideas with lookbook images outside your current salon service catalog.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          <ShieldCheck size={14} />
          On-device AI face analysis
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="bg-surface-lowest rounded-2xl ambient-shadow p-6 lg:p-8 space-y-5">
          <div className="flex items-center gap-2 text-stone-700">
            <Camera size={18} className="text-royal-purple" />
            <h3 className="font-headline font-bold text-xl tracking-tight">Upload Selfie</h3>
          </div>

          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-surface-low text-center transition-all hover:border-royal-purple/45 hover:bg-royal-purple/5">
            {previewUrl ? (
              <img src={previewUrl} alt="Selfie preview" className="h-[260px] w-full rounded-xl object-cover" />
            ) : (
              <div className="space-y-3 px-8">
                <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-royal-purple/10 text-royal-purple">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-medium text-stone-700">Click to upload a clear front-facing photo</p>
                <p className="text-xs text-stone-500">Best results with neutral lighting and visible forehead + jawline</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          <div className="space-y-3 rounded-2xl border border-stone-200 bg-surface-low p-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-600">Live Camera</h4>
              <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', cameraReady ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600')}>
                {cameraReady ? 'Active' : 'Off'}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl bg-stone-900">
              <video ref={videoRef} className="h-[210px] w-full object-cover" autoPlay muted playsInline />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={startCamera}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 transition-all hover:border-royal-purple hover:text-royal-purple"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Video size={14} />
                  Start Camera
                </span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 transition-all hover:border-rose-300 hover:text-rose-600"
              >
                <span className="inline-flex items-center gap-1.5">
                  <VideoOff size={14} />
                  Stop Camera
                </span>
              </button>
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={runAdvisorFromCamera}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all',
                  isAnalyzing ? 'bg-stone-400 cursor-not-allowed' : 'bg-royal-purple hover:shadow-md'
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  Detect Live Face
                </span>
              </button>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-royal-purple focus:ring-royal-purple"
            />
            <span className="text-xs leading-5 text-stone-600">
              I consent to temporary face analysis for hairstyle suggestions. My image is processed in browser and not stored permanently.
            </span>
          </label>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={runAdvisor}
            className={cn(
              'w-full rounded-xl px-5 py-3.5 font-headline font-semibold uppercase tracking-[0.14em] text-sm transition-all flex items-center justify-center gap-2',
              isAnalyzing ? 'bg-stone-300 text-stone-700 cursor-not-allowed' : 'bg-royal-purple text-white hover:translate-y-[-1px] hover:shadow-lg'
            )}
          >
            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <WandSparkles size={18} />}
            {isAnalyzing ? 'Analyzing Face' : 'Find My Best Styles (Photo Upload)'}
          </button>
        </section>

        <section className="bg-surface-lowest rounded-2xl ambient-shadow p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-headline font-bold text-xl tracking-tight text-stone-900">Analysis Snapshot</h3>
            <span className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest', confidenceChipClass)}>
              <Gauge size={13} />
              {analysis ? `${analysis.metrics.confidencePercent}% confidence` : 'Awaiting input'}
            </span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-surface-low p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">Detected Face Shape</p>
            <p className="mt-1 text-3xl font-headline font-extrabold text-royal-purple">{shapeTitle(analysis?.faceShape)}</p>
            <p className="mt-2 text-xs text-stone-500">Model: {modelMeta?.name || 'MediaPipe Face Landmarker'} ({modelMeta?.execution || 'on-device'})</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-surface-low px-3 py-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500">L/W Ratio</p>
              <p className="mt-1 text-sm font-semibold text-stone-800">{analysis?.metrics?.lengthToWidth ?? '-'}</p>
            </div>
            <div className="rounded-lg bg-surface-low px-3 py-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Jaw/Forehead</p>
              <p className="mt-1 text-sm font-semibold text-stone-800">{analysis?.metrics?.jawToForehead ?? '-'}</p>
            </div>
            <div className="rounded-lg bg-surface-low px-3 py-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Forehead/Jaw</p>
              <p className="mt-1 text-sm font-semibold text-stone-800">{analysis?.metrics?.foreheadToJaw ?? '-'}</p>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-5">
            This feature gives guidance, not medical or biometric identity decisions. Final suitability should be confirmed by your stylist.
          </p>
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-gold" />
          <h3 className="font-headline font-bold text-2xl tracking-tight text-stone-900">Recommended Styles</h3>
        </div>

        {hasResults ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((item, index) => (
              <article key={item.id} className="rounded-2xl border border-stone-200 bg-surface-lowest p-5 ambient-shadow">
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <img
                    src={item.imageUrl || fallbackHairstyleImage(item.title, analysis?.faceShape, index + 1)}
                    alt={`${item.title} hairstyle reference`}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackHairstyleImage(item.title, analysis?.faceShape, index + 100);
                    }}
                  />
                </div>
                <div className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Front View Reference
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="mt-4 font-headline text-lg font-extrabold tracking-tight text-stone-900">{item.title}</h4>
                  <span className="rounded-full bg-royal-purple/10 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-royal-purple">
                    {item.suitabilityScore}% fit
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-600 leading-6">{item.whyItWorks}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-semibold">
                  <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-stone-600">{item.maintenanceLevel} maintenance</span>
                  <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-stone-600">{item.category}</span>
                  <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-stone-600">{formatPrice(item.estimatedPrice)}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gold">
                  <Scissors size={14} />
                  Ask stylist for this recommendation in next appointment
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-surface-low px-6 py-8 text-center text-stone-500">
            Upload a selfie and click Find My Best Styles to generate hairstyle recommendations beyond your listed services.
          </div>
        )}

        {disclaimer && <p className="text-xs text-stone-500">{disclaimer}</p>}
      </section>
    </div>
  );
}

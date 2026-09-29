import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.readAsDataURL(blob);
});

export async function shareBillNative(billId, customerName, shareText) {
  const isCapacitor = typeof window !== 'undefined' && window.Capacitor;

  if (isCapacitor) {
    try {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
      const pdfUrl = `${apiBase}/api/bills/${billId}/pdf`;

      // 1. Fetch PDF blob
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      const blob = await response.blob();

      // 2. Convert to Base64
      const base64Data = await blobToBase64(blob);
      const fileName = `royalsalon-bill-${billId}.pdf`;

      // 3. Write to temporary cache
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // 4. Share the file natively (handles WhatsApp, Gmail, etc. with PDF attachments)
      await Share.share({
        title: `RoyalSalon Invoice - ${customerName}`,
        text: shareText,
        files: [result.uri],
        dialogTitle: `Share Invoice PDF`
      });
      return true;
    } catch (err) {
      console.error('Capacitor native share failed:', err);
      return false;
    }
  }
  
  return false;
}

import CameraQR from '@/components/camera/camera-qr';
import { ScanningResult } from 'expo-camera';

export default function ScannerScreen() {
  const handleBarcodeScanned = (barcode: ScanningResult) => {
    console.log('Barcode scanned:', barcode);
  };
  return <CameraQR onBarcodeScanned={handleBarcodeScanned} />;
}

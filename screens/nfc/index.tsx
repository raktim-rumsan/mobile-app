import Nfc from '@/components/nfc';

export default function NfcScreen() {
  const onNfcScanned = (barcode: string) => {
    console.log('NFC scanned:', barcode);
  };
  return <Nfc onNfcScanned={onNfcScanned} />;
}

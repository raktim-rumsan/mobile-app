import Camera from '@/components/camera/camera-document';
import { router } from 'expo-router';

export default function ReceiptCreateScreen() {
  return <Camera onBackPress={() => router.replace('/(tabs)/receipt/list')} />;
}

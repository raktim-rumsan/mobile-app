import LayoutTpl, { PageConfig } from '@/components/layout';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DemoLayout() {
  const pages: PageConfig[] = [
    {
      name: 'index',
      title: 'Demo Pages',
    },
    {
      name: 'device-info',
      title: 'Device Info',
    },
    {
      name: 'location',
      title: 'Location',
    },
    {
      name: 'nfc-write',
      title: 'NFC Write',
    },
    {
      name: 'nfc',
      title: 'NFC',
      onBackPress: () => router.back(),
    },
  ];

  return (
    <SafeAreaView className="flex-1">
      <LayoutTpl pages={pages} />
    </SafeAreaView>
  );
}

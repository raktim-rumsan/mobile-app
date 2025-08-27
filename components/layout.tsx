import { Stack } from 'expo-router';

import { Header } from '@/components/Header';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { JSX } from 'react';

export type PageConfig = {
  name: string;
  title?: string;
  onBackPress?: () => void;
  action?: JSX.Element;
  onActionPress?: () => void;
};

export default function LayoutTpl({ pages }: { pages: PageConfig[] }) {
  const router = useRouter();
  const iconColor = useThemeColor({}, 'icon');

  // const pages: PageConfig[] = [
  //   {
  //     name: 'index',
  //     title: 'Demo Pages',
  //   },
  //   {
  //     name: 'device-info',
  //     title: 'Device Info',
  //   },
  //   {
  //     name: 'location',
  //     title: 'Location',
  //   },
  //   {
  //     name: 'nfc-write',
  //     title: 'NFC Write',
  //   },
  //   {
  //     name: 'nfc',
  //     title: 'NFC',
  //     onBackPress: () => router.back(),
  //   },
  // ];

  pages = pages || [
    {
      name: 'index',
      title: 'Page',
    },
  ];

  const getPageConfig = (routeName: string) => {
    return pages.find((page) => page.name === routeName) || null;
  };

  const AppLayout = () => {
    return (
      <Stack
        screenOptions={{
          header: ({ route }) => {
            const pageConfig = getPageConfig(route.name);
            const onBackPress =
              pageConfig?.onBackPress || (() => router.back());

            // Hide header if no page config found or no title
            if (!pageConfig || !pageConfig.title) {
              return undefined;
            }

            return (
              <Header
                title={pageConfig.title}
                onBackPress={onBackPress}
                Action={pageConfig.action}
                onActionPress={pageConfig.onActionPress}
              />
            );
          },
        }}
      >
        {pages.map((page) => (
          <Stack.Screen key={page.name} name={page.name} />
        ))}
      </Stack>
    );
  };
  return <AppLayout />;
}

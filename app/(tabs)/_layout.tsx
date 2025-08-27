import { useNavigation } from '@react-navigation/native';
import { Link, Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, Pressable, SafeAreaView, Text } from 'react-native';
import {
  Cog6ToothIcon,
  HomeIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  QrCodeIcon,
  ReceiptRefundIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';

import { View } from '@/components/Themed';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/core/constants/Colors';
import { useApp } from '@/core/context/AppContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const { isLocked } = useApp();

  const otherTabs: {
    path: string;
    title?: string;
    headerShown?: boolean;
    footerShown?: boolean;
  }[] = [
    {
      path: 'demo',
      title: 'Demo',
      headerShown: false,
      footerShown: true,
    },
    {
      path: 'receipt/preview',
      title: 'Receipt Preview',
    },
    {
      path: 'receipt/form',
      title: 'Receipt Form',
      headerShown: false,
    },
    {
      path: 'receipt/create',
      title: 'Receipt Create',
      headerShown: false,
    },
    {
      path: 'receipt/detail',
      title: 'Receipt Detail',
      headerShown: false,
    },
    {
      path: 'receipt/edit',
      title: 'Receipt Edit',
      headerShown: false,
    },
  ];
  const hiddenHeaders = ['/receipt/create', '/receipt/preview'];
  const hiddenFooters = [
    '/receipt/create',
    '/receipt/preview',
    '/receipt/form',
    '/scanner',
  ].includes(pathname);

  const tabBarStyle = {
    height: Platform.OS === 'android' ? 100 : 60, // Increase height on Android
    paddingTop: 8,
    backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
    borderTopColor: Colors[colorScheme ?? 'light'].tabBarBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Fix for Android to avoid system navigation overlap
    paddingBottom: Platform.OS === 'android' ? 10 : 10,
  };

  // Add HeaderCloseButton component
  function HeaderCloseButton() {
    const navigation = useNavigation();
    return (
      <Pressable
        onPress={() => navigation.goBack()}
        style={{ marginRight: 15 }}
      >
        <XMarkIcon size={24} color={Colors[colorScheme ?? 'light'].text} />
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor:
            Colors[colorScheme ?? 'light'].tabIconDefault,
          tabBarStyle: isLocked ? { display: 'none' } : tabBarStyle,
          headerShown:
            hiddenHeaders.includes(`/${route.name}`) ||
            useClientOnlyValue(false, true),
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            sceneStyle: {
              paddingTop: 0,
              backgroundColor: Colors[colorScheme ?? 'light'].background,
            },
            headerShown: false,
            tabBarLabel: ({ color, focused }) => <Text />,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center justify-center">
                <HomeIcon
                  size={28}
                  color={color}
                  className={`mt-[5px] ${
                    focused ? 'opacity-100' : 'opacity-80'
                  }`}
                />
              </View>
            ),
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <InformationCircleIcon
                      size={20}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="receipt/list"
          options={{
            tabBarLabel: ({ color, focused }) => <Text />,
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center justify-center">
                <ReceiptRefundIcon
                  size={28}
                  color={color}
                  className={`mt-[5px] mr-[5px] ${
                    focused ? 'opacity-100' : 'opacity-80'
                  }`}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="scanner"
          options={{
            title: 'Scan',
            headerShown: false,
            tabBarStyle: { display: 'none' },
            tabBarIcon: ({ focused }) => (
              <View
                className={`items-center justify-center ${
                  Platform.OS === 'android' ? 'mb-[24px]' : 'mb-[34px]'
                }`}
              >
                <View
                  className="w-[64px] h-[64px] items-center justify-center rounded-[64px] border-[3px] translate-y-[-10px]"
                  style={{
                    backgroundColor: Colors[colorScheme ?? 'light'].tint,
                    shadowColor: Colors[colorScheme ?? 'light'].tint,
                    shadowOffset: { width: 4, height: 6 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 8,
                    borderColor:
                      Colors[colorScheme ?? 'light'].tabBarBackground,
                  }}
                >
                  <QrCodeIcon size={36} color="#fff" />
                </View>
              </View>
            ),
            tabBarLabel: () => null, // Remove the title so only the icon shows
          }}
        />
        <Tabs.Screen
          name="timeoff"
          options={{
            title: 'TimeOff',
            headerShown: false,
            tabBarLabel: ({ color, focused }) => <Text />,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center justify-center">
                <PaperAirplaneIcon
                  size={28}
                  color={color}
                  className={`mt-[5px] ml-[5px] ${
                    focused ? 'opacity-100' : 'opacity-80'
                  }`}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarLabel: ({ color, focused }) => <Text />,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center justify-center">
                <Cog6ToothIcon
                  size={28}
                  color={color}
                  className={`mt-[5px] ${
                    focused ? 'opacity-100' : 'opacity-80'
                  }`}
                />
              </View>
            ),
          }}
        />
        {otherTabs.map((tab) => (
          <Tabs.Screen
            name={tab.path}
            key={tab.path}
            options={{
              href: null,
              title: tab.title ? tab.title : tab.path,
              headerShown: tab.headerShown ?? false,
              tabBarStyle: isLocked
                ? { display: 'none' }
                : tab.footerShown
                ? tabBarStyle
                : { display: 'none' },
              headerRight: tab.headerShown
                ? () => <HeaderCloseButton />
                : undefined,
            }}
          />
        ))}
      </Tabs>
    </SafeAreaView>
  );
}

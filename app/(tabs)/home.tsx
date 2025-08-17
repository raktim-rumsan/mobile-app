import { LoadingScreen } from '@/components/LoadingScreen';
import { useApp } from '@/context/AppContext';
import { useAppServicePlugin } from '@/plugins/pluginFactory';
import HomeScreen from '@/screens/home';
import { hostService } from '@/screens/setup/hostService';
import LockScreen from '@/screens/setup/lock';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const { isLocked, setIsLocked } = useApp();
  const appService = useAppServicePlugin(hostService);

  useEffect(() => {
    appService
      .isSessionValid()
      .then((isValid) => {
        setIsLocked(!isValid);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appService, setIsLocked]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (isLocked) {
    return <LockScreen />;
  }
  return <HomeScreen />;
}

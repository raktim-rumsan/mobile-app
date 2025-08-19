import { LoadingScreen } from '@/components/LoadingScreen';
import { useApp } from '@/core/context/AppContext';
import HomeScreen from '@/core/screens/home';
import { hostService } from '@/core/screens/hostService';
import LockScreen from '@/core/screens/lock';
import { useAppServicePlugin } from '@/plugins/pluginFactory';
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

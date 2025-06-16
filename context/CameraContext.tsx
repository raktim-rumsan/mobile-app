import React, { createContext, useContext, useState } from 'react';

interface CameraContextType {
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  return (
    <CameraContext.Provider value={{ photoUri, setPhotoUri }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCameraPhoto must be used within a CameraPhotoProvider');
  }
  return context;
};

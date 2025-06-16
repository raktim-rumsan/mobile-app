import type { AlertPopupIconColor } from '@/components/AlertPopup';
import { ErrorPopup, InfoPopup, WarningPopup } from '@/components/AlertPopup';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface AlertPopupContextType {
  showError: (
    message: string,
    details?: string,
    options?: { iconColor?: AlertPopupIconColor },
  ) => void;
  showInfo: (
    message: string,
    details?: string,
    options?: { iconColor?: AlertPopupIconColor },
  ) => void;
  showWarning: (
    message: string,
    details?: string,
    options?: { iconColor?: AlertPopupIconColor },
  ) => void;
  close: () => void;
}

const AlertPopupContext = createContext<AlertPopupContextType | undefined>(
  undefined,
);

// Internal state for which popup to show
const POPUP_TYPE = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;
type PopupType = keyof typeof POPUP_TYPE;

interface PopupState {
  visible: boolean;
  type: PopupType | null;
  message: string;
  iconColor?: AlertPopupIconColor;
  details?: string;
}

export const AlertPopupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    type: null,
    message: '',
    iconColor: undefined,
    details: undefined,
  });

  const close = useCallback(() => {
    setPopup((prev) => ({ ...prev, visible: false }));
  }, []);

  const showError = useCallback(
    (
      message: string,
      details?: string,
      options?: { iconColor?: AlertPopupIconColor },
    ) => {
      setPopup({
        visible: true,
        type: 'ERROR',
        message,
        iconColor: options?.iconColor,
        details,
      });
    },
    [],
  );

  const showInfo = useCallback(
    (
      message: string,
      details?: string,
      options?: { iconColor?: AlertPopupIconColor },
    ) => {
      setPopup({
        visible: true,
        type: 'INFO',
        message,
        iconColor: options?.iconColor,
        details,
      });
    },
    [],
  );

  const showWarning = useCallback(
    (
      message: string,
      details?: string,
      options?: { iconColor?: AlertPopupIconColor },
    ) => {
      setPopup({
        visible: true,
        type: 'WARNING',
        message,
        iconColor: options?.iconColor,
        details,
      });
    },
    [],
  );

  return (
    <AlertPopupContext.Provider
      value={{ showError, showInfo, showWarning, close }}
    >
      {children}
      {popup.type === 'ERROR' && (
        <ErrorPopup
          visible={popup.visible}
          message={popup.message}
          iconColor={popup.iconColor}
          details={popup.details}
          onClose={close}
        />
      )}
      {popup.type === 'INFO' && (
        <InfoPopup
          visible={popup.visible}
          message={popup.message}
          iconColor={popup.iconColor}
          details={popup.details}
          onClose={close}
        />
      )}
      {popup.type === 'WARNING' && (
        <WarningPopup
          visible={popup.visible}
          message={popup.message}
          iconColor={popup.iconColor}
          details={popup.details}
          onClose={close}
        />
      )}
    </AlertPopupContext.Provider>
  );
};

export function useAlertPopup() {
  const ctx = useContext(AlertPopupContext);
  if (!ctx)
    throw new Error('useAlertPopup must be used within an AlertPopupProvider');
  return ctx;
}

import React, { useState } from 'react';
import { CustomAlert, setAlertInstance } from './CustomAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  React.useEffect(() => {
    setAlertInstance((config: AlertConfig) => {
      setAlertConfig(config);
    });
  }, []);

  return (
    <>
      {children}
      <CustomAlert
        visible={!!alertConfig}
        title={alertConfig?.title || ''}
        message={alertConfig?.message}
        buttons={alertConfig?.buttons}
        onClose={() => setAlertConfig(null)}
      />
    </>
  );
};

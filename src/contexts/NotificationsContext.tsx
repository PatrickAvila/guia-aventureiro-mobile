// mobile/src/contexts/NotificationsContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface NotificationsContextData {
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const NotificationsContext = createContext<NotificationsContextData>({
  unreadCount: 0,
  setUnreadCount: () => {},
  decrementUnreadCount: () => {},
  resetUnreadCount: () => {},
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        decrementUnreadCount,
        resetUnreadCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }
  return context;
};

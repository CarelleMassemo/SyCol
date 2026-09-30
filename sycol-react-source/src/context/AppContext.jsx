import { createContext, useCallback, useContext, useRef, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toast, setToast] = useState({ show: false, text: '' });
  const [contactMessage, setContactMessage] = useState('');
  const timeoutRef = useRef(null);

  const showToast = useCallback((text) => {
    clearTimeout(timeoutRef.current);
    setToast({ show: true, text });
    timeoutRef.current = setTimeout(() => setToast({ show: false, text: '' }), 3200);
  }, []);

  const prefillContact = useCallback((label) => {
    setContactMessage(`Bonjour SyCol, je souhaite obtenir plus d'informations concernant : ${label}.`);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <AppContext.Provider value={{ toast, showToast, contactMessage, setContactMessage, prefillContact }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé à l\'intérieur de <AppProvider>');
  return ctx;
}

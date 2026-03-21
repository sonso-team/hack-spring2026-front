import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import './Modal.scss';

interface ModalContextValue {
  open: (content: ReactNode) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode>(null);

  const open = useCallback((node: ReactNode) => setContent(node), []);
  const close = useCallback(() => setContent(null), []);

  useEffect(() => {
    if (!content) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [content, close]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {content && (
        <div className="modal-overlay" onClick={close}>
          <div onClick={(e) => e.stopPropagation()}>{content}</div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return ctx;
};

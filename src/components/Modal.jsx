import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ children, onClose, labelledBy, describedBy }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleBackdropClick = () => {
    onClose?.();
  };

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy}>
      <button type="button" className="modal__backdrop" onClick={handleBackdropClick} aria-label="Закрыть окно" />
      <div className="modal__container" role="document">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;

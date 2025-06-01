import React, { useEffect, useRef } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'normal', // 'normal' | 'large'
  ariaLabel,
  header,
  ...props
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={ariaLabel || title || 'Modal'} tabIndex="-1" {...props}>
      <div
        className={`modal-content${size === 'large' ? ' modal-content-large' : ''}`}
        ref={modalRef}
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        <div className="modal-header">
          {header ? header : (
            <>
              <div style={{ width: 60 }} />
              {title && <h3 className="mb-1rem" style={{ flex: 1, textAlign: 'center', margin: 0 }}>{title}</h3>}
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
                tabIndex={0}
              >
                ×
              </button>
            </>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal; 
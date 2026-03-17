import React, { useEffect, useRef } from 'react';

const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) => {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    confirmRef.current?.focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="sh-modal" role="dialog" aria-modal="true" aria-label={title || 'Confirm'} onClick={onCancel}>
      <div className="sh-card sh-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sh-card-pad">
          <div className="sh-modal-head">
            <h2 className="sh-title sh-h2">{title}</h2>
          </div>
          {description ? <p className="sh-lead sh-modal-desc">{description}</p> : null}
          <div className="sh-modal-actions">
            <button className="sh-btn sh-btn-ghost" type="button" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button ref={confirmRef} className="sh-btn sh-btn-primary" type="button" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;


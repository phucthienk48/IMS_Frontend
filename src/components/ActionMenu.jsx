import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ActionMenu({ label = "Thao tác", items = [] }) {
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const visibleItems = items.filter(Boolean);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 210;
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    setPosition({ top: rect.bottom + 6, left });
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const close = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("mousedown", close);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", close);
      cancelClose();
    };
  }, [open]);

  if (!visibleItems.length) return null;

  return (
    <div
      className="ims-action-menu"
      onMouseEnter={() => {
        cancelClose();
        updatePosition();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ims-action-trigger"
        onClick={() => {
          updatePosition();
          setOpen((value) => !value);
        }}
      >
        <i className="bi bi-three-dots-vertical" />
        <span>{label}</span>
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="ims-action-dropdown"
          style={{ top: position.top, left: position.left }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {visibleItems.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              type="button"
              className={`ims-action-item ${item.variant ? `ims-action-${item.variant}` : ""}`}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              disabled={item.disabled}
              title={item.title || ""}
            >
              {item.icon && <i className={`bi ${item.icon}`} />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

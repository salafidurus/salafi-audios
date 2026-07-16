"use client";

import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore } from "./toast-store";
import styles from "./toast.module.css";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) {
    return null;
  }
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.content}>
            {toast.type === "error" && <AlertCircle size={18} className={styles.icon} />}
            {toast.type === "success" && <CheckCircle size={18} className={styles.icon} />}
            {toast.type === "warning" && <AlertTriangle size={18} className={styles.icon} />}
            {toast.type === "info" && <Info size={18} className={styles.icon} />}
            <span className={styles.message}>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={styles.closeButton}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

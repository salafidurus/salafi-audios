import { create } from "zustand";

/** Documents this module's responsibility and public boundary. */
/** Visual severity variants supported by the global notification store. */
export type ToastType = "success" | "error" | "info" | "warning";

/** Notification data retained until dismissed or its duration expires. */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  /** Auto-dismiss delay in milliseconds; non-positive values keep the toast visible. */
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

/** Global toast state and actions shared by the web notification surface. */
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message: string, type: ToastType = "info", duration: number = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

/** Selects toast mutation actions without exposing the store implementation. */
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);
  return { addToast, removeToast };
}

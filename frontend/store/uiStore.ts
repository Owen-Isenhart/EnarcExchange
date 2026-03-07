/**
 * UI Store - Zustand store for UI state
 */

import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UiState {
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;

  // Modals
  modals: Record<string, boolean>;
  openModal: (name: string) => void;
  closeModal: (name: string) => void;
  toggleModal: (name: string) => void;
  isModalOpen: (name: string) => boolean;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

let notificationCounter = 0;

export const useUiStore = create<UiState>((set: any, get: any) => ({
  notifications: [],
  
  addNotification: (notification: any) => {
    const id = `notification-${notificationCounter++}`;
    const duration = notification.duration || 5000;
    
    set((state: any) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    
    // Auto-remove after duration
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);
  },

  removeNotification: (id: any) => {
    set((state: any) => ({
      notifications: state.notifications.filter((n: any) => n.id !== id),
    }));
  },

  modals: {} as Record<string, boolean>,
  
  openModal: (name: any) => {
    set((state: any) => ({
      modals: { ...state.modals, [name]: true },
    }));
  },

  closeModal: (name: any) => {
    set((state: any) => ({
      modals: { ...state.modals, [name]: false },
    }));
  },

  toggleModal: (name: any) => {
    set((state: any) => ({
      modals: { ...state.modals, [name]: !state.modals[name] },
    }));
  },

  isModalOpen: (name: any) => {
    const { modals } = get();
    return modals[name] || false;
  },

  isSidebarOpen: true,
  
  toggleSidebar: () =>
    set((state: any) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarOpen: (open: any) => set({ isSidebarOpen: open }),

  theme: 'dark',
  
  setTheme: (theme: any) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  },
}));

/**
 * NotificationCenter Component - Display toast notifications
 */

'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/helpers';

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useUiStore();

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[#00FF41]" />,
    error: <AlertCircle className="h-5 w-5 text-[#FF8C00]" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-[#00FF41]/10 border-[#00FF41]/30',
    error: 'bg-[#FF8C00]/10 border-[#FF8C00]/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification: any) => (
        <div
          key={notification.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
            'animate-in fade-in slide-in-from-right-2',
            bgColors[notification.type as keyof typeof bgColors]
          )}
        >
          {icons[notification.type as keyof typeof icons]}
          <p className="flex-1 text-sm text-white">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-4 w-4 text-white/70" />
          </button>
        </div>
      ))}
    </div>
  );
};

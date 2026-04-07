import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { StatusMessage, StatusMessageType } from '../types';

interface StatusBarProps {
  messages?: StatusMessage[];
  onDismiss?: (id: string) => void;
  autoDismissTimeout?: number;
}

const typeStyles: Record<StatusMessageType, string> = {
  success: 'bg-success-50 border-success-500 text-success-800',
  error: 'bg-error-50 border-error-500 text-error-800',
  info: 'bg-primary-50 border-primary-500 text-primary-800',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
};

const typeIcons: Record<StatusMessageType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const typeLabels: Record<StatusMessageType, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Information',
  warning: 'Warning',
};

function StatusMessageItem({
  message,
  onDismiss,
  autoDismissTimeout,
}: {
  message: StatusMessage;
  onDismiss: (id: string) => void;
  autoDismissTimeout: number;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (message.type !== 'error' && autoDismissTimeout > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss(message.id);
      }, autoDismissTimeout);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message.id, message.type, autoDismissTimeout, onDismiss]);

  const role = message.type === 'error' || message.type === 'warning' ? 'alert' : 'status';
  const ariaLive = message.type === 'error' || message.type === 'warning' ? 'assertive' : 'polite';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`flex items-center justify-between gap-3 rounded-lg border-l-4 px-4 py-3 shadow-sm transition-all ${typeStyles[message.type]}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-lg" aria-hidden="true">
          {typeIcons[message.type]}
        </span>
        <span className="sr-only">{typeLabels[message.type]}:</span>
        <p className="text-sm font-medium">{message.text}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(message.id)}
        className="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1"
        aria-label={`Dismiss ${typeLabels[message.type].toLowerCase()} message: ${message.text}`}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    </div>
  );
}

export function StatusBar({
  messages = [],
  onDismiss,
  autoDismissTimeout = 5000,
}: StatusBarProps) {
  const [internalMessages, setInternalMessages] = useState<StatusMessage[]>([]);

  const isControlled = onDismiss !== undefined;
  const displayMessages = isControlled ? messages : internalMessages;

  useEffect(() => {
    if (!isControlled) {
      setInternalMessages(messages);
    }
  }, [messages, isControlled]);

  const handleDismiss = useCallback(
    (id: string) => {
      if (isControlled && onDismiss) {
        onDismiss(id);
      } else {
        setInternalMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
    },
    [isControlled, onDismiss],
  );

  if (displayMessages.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-md flex-col gap-2"
    >
      {displayMessages.map((message) => (
        <StatusMessageItem
          key={message.id}
          message={message}
          onDismiss={handleDismiss}
          autoDismissTimeout={autoDismissTimeout}
        />
      ))}
    </div>
  );
}

export function useStatusMessages() {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const addMessage = useCallback((text: string, type: StatusMessageType) => {
    const newMessage: StatusMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      type,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const dismissMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addSuccess = useCallback(
    (text: string) => addMessage(text, 'success'),
    [addMessage],
  );

  const addError = useCallback(
    (text: string) => addMessage(text, 'error'),
    [addMessage],
  );

  const addInfo = useCallback(
    (text: string) => addMessage(text, 'info'),
    [addMessage],
  );

  const addWarning = useCallback(
    (text: string) => addMessage(text, 'warning'),
    [addMessage],
  );

  return {
    messages,
    addMessage,
    dismissMessage,
    clearMessages,
    addSuccess,
    addError,
    addInfo,
    addWarning,
  };
}

export default StatusBar;
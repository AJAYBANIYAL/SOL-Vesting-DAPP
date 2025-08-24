'use client'

import { useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export function Notification({ message, type, duration = 5000, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800'
  }[type]

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }[type]

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border rounded-xl shadow-lg max-w-md ${bgColor}`}>
      <div className="flex items-start">
        <span className="mr-2 text-lg">{icon}</span>
        <div className="flex-1">
          <p className="font-medium whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface NotificationManagerProps {
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info'
  }>
  onRemove: (id: string) => void
}

export function NotificationManager({ notifications, onRemove }: NotificationManagerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  )
}

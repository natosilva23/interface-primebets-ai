'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface PaymentNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface PaymentNotificationProps {
  notification: PaymentNotification
  onClose: (id: string) => void
}

export function PaymentNotificationComponent({ notification, onClose }: PaymentNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(notification.id), 300)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(notification.id), 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-emerald-600" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-600" />
      default:
        return <AlertCircle className="w-6 h-6 text-blue-600" />
    }
  }

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div
      className={`${getColors()} border-2 rounded-xl p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export function PaymentNotificationContainer() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([])

  useEffect(() => {
    // Listener para novas notificações
    const handleNewNotification = (event: CustomEvent<PaymentNotification>) => {
      setNotifications((prev) => [...prev, event.detail])
    }

    window.addEventListener('payment-notification' as any, handleNewNotification)

    return () => {
      window.removeEventListener('payment-notification' as any, handleNewNotification)
    }
  }, [])

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
      {notifications.map((notification) => (
        <PaymentNotificationComponent
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  )
}

// Helper para disparar notificações
export function showPaymentNotification(
  type: NotificationType,
  title: string,
  message: string,
  duration: number = 5000
) {
  const notification: PaymentNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    duration
  }

  const event = new CustomEvent('payment-notification', { detail: notification })
  window.dispatchEvent(event)
}

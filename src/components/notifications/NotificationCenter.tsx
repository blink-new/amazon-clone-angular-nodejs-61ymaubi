import React, { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Bell, X, Check, Clock, AlertCircle, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

interface Notification {
  id: string
  type: 'booking_confirmed' | 'event_reminder' | 'booking_cancelled' | 'system_update' | 'promotion'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  eventId?: string
  bookingId?: string
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const user = await blink.auth.me()
      if (user) {
        const sampleNotifications: Notification[] = [
          {
            id: 'notif_1',
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: 'Your booking for Avengers: Endgame has been confirmed!',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false,
            eventId: 'event_1'
          },
          {
            id: 'notif_2',
            type: 'event_reminder',
            title: 'Event Tomorrow',
            message: 'Don\'t forget: Taylor Swift Concert is tomorrow at 8:00 PM',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: false,
            eventId: 'event_2'
          },
          {
            id: 'notif_3',
            type: 'system_update',
            title: 'New Feature Available',
            message: 'You can now download your tickets as PDF files!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            read: true
          },
          {
            id: 'notif_4',
            type: 'promotion',
            title: 'Special Offer',
            message: 'Get 20% off your next booking with code SAVE20',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            read: true
          }
        ]
        setNotifications(sampleNotifications)
        setUnreadCount(sampleNotifications.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeNotifications = () => {
    const channel = blink.realtime.channel('user-notifications')
    
    const subscribeToNotifications = async () => {
      try {
        const user = await blink.auth.me()
        if (user) {
          await channel.subscribe({
            userId: user.id,
            metadata: { type: 'notification_listener' }
          })

          channel.onMessage((message) => {
            if (message.type === 'new_notification') {
              const newNotification = message.data as Notification
              setNotifications(prev => [newNotification, ...prev])
              setUnreadCount(prev => prev + 1)
              
              if (Notification.permission === 'granted') {
                new Notification(newNotification.title, {
                  body: newNotification.message,
                  icon: '/favicon.svg'
                })
              }
            }
          })
        }
      } catch (error) {
        console.error('Error setting up real-time notifications:', error)
      }
    }

    subscribeToNotifications()

    return () => {
      channel.unsubscribe()
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed':
        return <Check className="h-4 w-4 text-green-600" />
      case 'event_reminder':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'booking_cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'system_update':
        return <Info className="h-4 w-4 text-purple-600" />
      case 'promotion':
        return <Bell className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed':
        return 'bg-green-50 border-green-200'
      case 'event_reminder':
        return 'bg-blue-50 border-blue-200'
      case 'booking_cancelled':
        return 'bg-red-50 border-red-200'
      case 'system_update':
        return 'bg-purple-50 border-purple-200'
      case 'promotion':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  useEffect(() => {
    loadNotifications()
    const unsubscribe = setupRealtimeNotifications()
    return unsubscribe
  }, [])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} new</Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${getNotificationColor(notification.type)} ${!notification.read ? 'ring-2 ring-blue-200' : ''} transition-all hover:shadow-md cursor-pointer`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
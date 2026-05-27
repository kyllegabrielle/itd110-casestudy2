import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axiosInstance.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.notificationId === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      fetchNotifications, 
      markAsRead, 
      markAllAsRead 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

import React, { useState, useRef, useEffect } from 'react'
import { Bell, UserCircle, Search, CheckCircle, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

const Header = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markAsRead(n.notificationId);
    }
    // Optionally navigate to incident
    setShowNotifications(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm relative z-50">
      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-96 border border-slate-200">
        <Search className="text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search incidents, suspects..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <CheckCircle size={12} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.notificationId}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors relative ${!n.read ? 'bg-blue-50/30' : ''}`}
                    >
                      {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />}
                      <div className="flex gap-3">
                        <div className={`mt-1 p-1.5 rounded-lg ${!n.read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Info size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                            {n.createdAt && !isNaN(new Date(n.createdAt)) && formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="text-slate-400" size={24} />
                    </div>
                    <p className="text-sm text-slate-500">No notifications yet</p>
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                  <button className="text-[11px] text-slate-500 hover:text-slate-700 font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500">{user?.role || 'Guest'}</p>
          </div>
          <UserCircle className="text-slate-400" size={32} />
        </div>
      </div>
    </header>
  )
}

export default Header

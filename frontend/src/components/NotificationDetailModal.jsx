import React from 'react';
import { X, Info, Calendar, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Incident Alert</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</h4>
            <p className="text-lg font-bold text-slate-900">{notification.title}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Message</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-slate-700 leading-relaxed">{notification.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={14} />
                <span className="text-xs font-semibold uppercase">Date Received</span>
              </div>
              <p className="text-sm text-slate-800 font-medium">
                {notification.createdAt && !isNaN(new Date(notification.createdAt)) 
                  ? format(new Date(notification.createdAt), 'PPP') 
                  : 'Unknown'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} />
                <span className="text-xs font-semibold uppercase">Time</span>
              </div>
              <p className="text-sm text-slate-800 font-medium">
                {notification.createdAt && !isNaN(new Date(notification.createdAt)) 
                  ? format(new Date(notification.createdAt), 'p') 
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-all shadow-md active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;

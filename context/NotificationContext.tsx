import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { X, CalendarCheck, UserPlus } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'booking' | 'subscriber';
  message: string;
  timestamp: Date;
}

export interface NotificationContextType {
  notifications: Notification[];
  newBookingCount: number;
  newSubscriberCount: number;
  addNotification: (type: 'booking' | 'subscriber', data: any) => void;
  clearNewBookings: () => void;
  clearNewSubscribers: () => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newBookingCount, setNewBookingCount] = useState(0);
    const [newSubscriberCount, setNewSubscriberCount] = useState(0);
    const audioCtxRef = useRef<AudioContext | null>(null);
  
    useEffect(() => {
      const unlockAudio = () => {
          if (window.AudioContext && !audioCtxRef.current) {
              try {
                  audioCtxRef.current = new window.AudioContext();
              } catch (e) {
                  console.error("AudioContext not supported or blocked.", e);
              }
          }
          document.body.removeEventListener('click', unlockAudio);
      };
      document.body.addEventListener('click', unlockAudio);
      return () => { document.body.removeEventListener('click', unlockAudio); };
    }, []);
  
    const playSound = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current?.resume();
      }
      if (!audioCtxRef.current) return;
      const oscillator = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtxRef.current.currentTime); // C5
      gainNode.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
      oscillator.start(audioCtxRef.current.currentTime);
      oscillator.stop(audioCtxRef.current.currentTime + 0.5);
    };
  
    const addNotification = (type: 'booking' | 'subscriber', data: any) => {
      const id = crypto.randomUUID();
      let message = '';
      if (type === 'booking') {
        message = `New booking from ${data.customerName} for "${data.itemName}"`;
        setNewBookingCount(c => c + 1);
      } else {
        message = `New subscriber: ${data.email}`;
        setNewSubscriberCount(c => c + 1);
      }
      
      setNotifications(prev => [{ id, type, message, timestamp: new Date() }, ...prev].slice(0, 5));
      playSound();
    };
  
    const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
    const clearNewBookings = () => setNewBookingCount(0);
    const clearNewSubscribers = () => setNewSubscriberCount(0);
  
    const value = {
      notifications, newBookingCount, newSubscriberCount,
      addNotification, clearNewBookings, clearNewSubscribers, removeNotification,
    };
    
    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const NotificationToaster = () => {
    const { notifications, removeNotification } = useNotification();
    
    useEffect(() => {
      notifications.forEach(notification => {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, 5000); // Auto-dismiss after 5 seconds
        return () => clearTimeout(timer);
      });
    }, [notifications, removeNotification]);
  
    return (
      <div className="fixed top-4 right-4 z-[200] space-y-3 w-80">
        {notifications.map(n => (
          <div key={n.id} className="bg-white rounded-xl shadow-2xl p-4 border-l-4 border-brand-green flex items-start gap-3 animate-fade-in-up">
            <div className="bg-brand-light text-brand-green p-2 rounded-full mt-1">
              {n.type === 'booking' ? <CalendarCheck size={20} /> : <UserPlus size={20} />}
            </div>
            <p className="flex-grow text-sm text-gray-700 font-medium">{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="p-1 text-gray-400 hover:text-gray-700"><X size={16} /></button>
          </div>
        ))}
      </div>
    );
};

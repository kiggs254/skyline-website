
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { 
  LayoutDashboard, Package, Map as MapIcon, Users, CalendarCheck, Settings, 
  LogOut, Plus, Edit, Trash2, Save, X, ChevronRight, 
  List, Image as ImageIcon, AlignLeft, Layers, Clock, ChevronLeft, Globe,
  Code, Search, PlayCircle, Briefcase, Sparkles, Loader2, ExternalLink,
  MessageSquare, Quote as QuoteIcon, Star, FileText, Cpu, Lock, Mail, Upload, Link as LinkIcon,
  BrainCircuit, UserPlus, Menu, MoreVertical, Check, PlusCircle, Trash,
  ChevronDown, Database, Shield, AtSign, Server, EyeOff
} from 'lucide-react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { getDestinationInsights } from '../services/aiService';
import { Booking, DataContextType, GeneratedPlan, Package as PackageType, Destination, Service, Testimonial, FAQ, Post, SiteSettings } from '../types';
import { uploadFile as uploadFileService } from '../lib/storageService';
import { useNotification } from '../context/NotificationContext';


// --- CRM Component for Booking Details ---
const BookingDetails = ({ booking }: { booking: Booking }) => {
    const { updateBookingStatus } = useData();
    const [status, setStatus] = useState(booking.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    let structuredData: any = null;
    let plainNotes = booking.notes || 'No additional notes.';
    try {
        const parsed = JSON.parse(booking.notes || '{}');
        if (parsed && parsed.structured) {
            structuredData = parsed.structured;
            plainNotes = parsed.userNotes || 'No user notes.';
        }
    } catch (e) {
        // Not JSON, treat as plain text
    }

    const getStatusColor = (s: string) => {
        switch(s) {
          case 'New': return 'bg-green-100 text-green-800 border-green-200';
          case 'Contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Booked': return 'bg-purple-100 text-purple-800 border-purple-200';
          case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Booking['status'];
        setIsUpdating(true);
        setStatus(newStatus);
        const success = await updateBookingStatus(booking.id, newStatus);
        if (success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } else {
            setStatus(booking.status);
            alert("Failed to update status.");
        }
        setIsUpdating(false);
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div><strong>Booking Date:</strong> {new Date(booking.date).toLocaleString()}</div>
                
                <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <div className="relative flex items-center">
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            disabled={isUpdating}
                            className={`appearance-none font-bold text-xs rounded-full pl-3 pr-8 py-1 border focus:outline-none focus:ring-2 focus:ring-brand-green transition-colors ${getStatusColor(status)}`}
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Booked">Booked</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        {!isUpdating && !showSuccess && <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />}
                        {isUpdating && <Loader2 size={14} className="animate-spin absolute right-2 top-1/2 -translate-y-1/2" />}
                        {showSuccess && <Check size={14} className="text-green-600 absolute right-2 top-1/2 -translate-y-1/2" />}
                    </div>
                </div>

                <div className="col-span-2"><hr className="my-2"/></div>
                <div><strong>Customer:</strong> {booking.customerName}</div>
                <div><strong>Phone:</strong> <a href={`tel:${booking.customerPhone}`} className="text-blue-600 hover:underline">{booking.customerPhone}</a></div>
                <div className="col-span-2"><strong>Email:</strong> <a href={`mailto:${booking.customerEmail}`} className="text-blue-600 hover:underline">{booking.customerEmail}</a></div>
                <div className="col-span-2"><hr className="my-2"/></div>
                <div><strong>Service Type:</strong> {booking.serviceType}</div>
                <div><strong>Item:</strong> {booking.itemName}</div>
                
                {/* Structured Data Display */}
                {structuredData ? (
                    <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 my-2">
                        <h4 className="font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">Trip Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><strong>Res. Adults:</strong> {structuredData.resAdults}</div>
                            <div><strong>Non-Res Adults:</strong> {structuredData.nonResAdults}</div>
                            <div><strong>Res. Kids:</strong> {structuredData.resKids}</div>
                            <div><strong>Non-Res Kids:</strong> {structuredData.nonResKids}</div>
                            {(structuredData.resKids > 0 || structuredData.nonResKids > 0) && (
                                <div className="col-span-2"><strong>Kid Ages:</strong> {structuredData.kidAges || 'Not specified'}</div>
                            )}
                            <div><strong>Nights:</strong> {structuredData.nights}</div>
                            <div><strong>Rooms:</strong> {structuredData.rooms}</div>
                            <div><strong>Pref. Month:</strong> {structuredData.prefMonth}</div>
                        </div>
                    </div>
                ) : (
                    <>
                        {booking.travelDate && <div><strong>Travel Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</div>}
                        {booking.travelers && <div><strong>Travelers:</strong> {booking.travelers}</div>}
                    </>
                )}

                {booking.totalPrice != null && <div><strong>Total Price:</strong> <span className="font-mono font-bold">KES {Number(booking.totalPrice).toLocaleString()}</span></div>}
                
                <div className="col-span-2 mt-4">
                    <h4 className="font-bold text-gray-700 mb-2">Notes / Message</h4>
                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-800 max-h-48 overflow-y-auto">{plainNotes}</div>
                </div>
            </div>
        </div>
    );
};

// --- Reusable UI Components ---
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}
const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => {
  const handleContentClick = (e: React.MouseEvent) => e.stopPropagation();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={handleContentClick}
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-lg font-bold text-gray-800">{title || 'Details'}</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", required = false, placeholder = "" }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{label}</label>
    {type === 'textarea' ? (
      <textarea 
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
        rows={4}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    ) : (
      <input 
        type={type}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
);

const useUploader = () => {
    const { settings } = useData();
    const [isUploading, setIsUploading] = useState(false);

    const upload = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        try {
            const url = await uploadFileService(file, settings);
            return url;
        } catch (error) {
            console.error("Upload hook error:", error);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { upload, isUploading };
};

const ImagePicker = ({ label, value, onChange, placeholder = "https://..." }: { label: string, value: string, onChange: (url: string) => void, placeholder?: string }) => {
  const { upload, isUploading } = useUploader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const publicUrl = await upload(file);
    if (publicUrl) onChange(publicUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="w-full pl-9 p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50" title="Upload Image">
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
      {value && <img src={value} alt="Preview" className="w-full h-40 object-cover mt-2 rounded-lg border bg-gray-100" onError={(e: any) => e.target.style.display='none'} />}
    </div>
  );
};

// --- Specialized Form Components ---
const DynamicListEditor = ({ label, items, onChange }: { label: string, items: string[], onChange: (newItems: string[]) => void }) => {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };
  const handleAddItem = () => onChange([...items, ""]);
  const handleRemoveItem = (index: number) => onChange(items.filter((_, i) => i !== index));
  
  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50/50">
      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">{label}</label>
      <div className="space-y-2">
        {(items || []).map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input type="text" value={item} onChange={e => handleItemChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
            <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash size={16} /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={handleAddItem} className="mt-3 text-sm font-semibold text-brand-green flex items-center gap-1 hover:text-green-800"><PlusCircle size={16} /> Add Item</button>
    </div>
  );
};

const ItineraryEditor = ({ items, onChange }: { items: { day: number, title: string, description: string }[], onChange: (newItems: any) => void }) => {
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...(items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAddItem = () => {
    const newDay = items && items.length > 0 ? Math.max(...items.map(i => i.day)) + 1 : 1;
    onChange([...(items || []), { day: newDay, title: "", description: "" }]);
  };

  const handleRemoveItem = (index: number) => onChange((items || []).filter((_, i) => i !== index));

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50/50">
      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Detailed Itinerary</label>
      <div className="space-y-4">
        {(items || []).map((item, index) => (
          <div key={index} className="p-3 border rounded-md bg-white relative">
            <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash size={14} /></button>
            <div className="flex gap-4">
              <input type="number" value={item.day || ""} onChange={e => handleItemChange(index, 'day', parseInt(e.target.value))} className="w-16 p-2 border rounded-md text-center font-bold" placeholder="Day"/>
              <input type="text" value={item.title || ""} onChange={e => handleItemChange(index, 'title', e.target.value)} className="w-full p-2 border rounded-md font-semibold" placeholder="Title (e.g., Arrival in Mara)" />
            </div>
            <textarea value={item.description || ""} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full p-2 border rounded-md mt-2 text-sm" placeholder="Day's description..."></textarea>
          </div>
        ))}
      </div>
      <button type="button" onClick={handleAddItem} className="mt-3 text-sm font-semibold text-brand-green flex items-center gap-1 hover:text-green-800"><PlusCircle size={16} /> Add Day</button>
    </div>
  );
};

const ImageListEditor = ({ items, onChange }: { items: string[], onChange: (newItems: string[]) => void }) => {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { upload, isUploading } = useUploader();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...(items || [])];
    newItems[index] = value;
    onChange(newItems);
  };
  const handleAddItem = () => onChange([...(items || []), ""]);
  const handleRemoveItem = (index: number) => onChange((items || []).filter((_, i) => i !== index));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingIndex(index);
    const file = e.target.files[0];
    const publicUrl = await upload(file);
    if (publicUrl) {
      handleItemChange(index, publicUrl);
    }
    setUploadingIndex(null);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50/50">
      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Image Gallery</label>
      <div className="space-y-3">
        {(items || []).map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-start gap-2 p-2 border bg-white rounded-md">
            {item && <img src={item} alt="Preview" className="w-24 h-24 object-cover rounded-md border bg-gray-100 shrink-0" />}
            <div className="flex-grow w-full">
                <div className="flex gap-2">
                    <input type="text" value={item} onChange={e => handleItemChange(index, e.target.value)} placeholder="Image URL" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                    <button type="button" onClick={() => fileInputRefs.current[index]?.click()} disabled={uploadingIndex === index || isUploading} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md shrink-0 disabled:opacity-50">
                        {uploadingIndex === index ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    </button>
                    <input type="file" ref={el => { fileInputRefs.current[index] = el; }} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, index)} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter a URL or upload an image.</p>
            </div>
            <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full shrink-0"><Trash size={16} /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={handleAddItem} className="mt-3 text-sm font-semibold text-brand-green flex items-center gap-1 hover:text-green-800"><PlusCircle size={16} /> Add Image</button>
    </div>
  );
};


// --- Login Component ---
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 'error'|'success', text: string} | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
        const res = await fetch('https://yellow-salmon-323871.hostingersite.com/skylineapi.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.token) {
             localStorage.setItem('skyline_token', data.token);
             window.location.reload();
        } else {
             setMsg({type: 'error', text: data.error || 'Authentication failed'});
        }
    } catch (err: any) {
        setMsg({type: 'error', text: err.message || 'Authentication failed'});
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-green text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock size={32} />
            </div>
            <h2 className="text-3xl font-bold text-brand-dark">CMS Admin Panel</h2>
            <p className="text-gray-500 text-sm mt-2">Secure access for Skyline Savannah Tours</p>
        </div>
        {msg && <div className={`p-4 rounded-lg mb-6 text-sm font-medium flex items-start gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {msg.type === 'error' ? <X size={16} className="mt-0.5" /> : <Check size={16} className="mt-0.5" />}<span>{msg.text}</span></div>}
        <form onSubmit={handleAuth} className="space-y-5">
          <InputField label="Email Address" type="email" value={email} onChange={setEmail} required placeholder="admin@skyline.com" />
          <InputField label="Password" type="password" value={password} onChange={setPassword} required placeholder="••••••••" />
          <button type="submit" disabled={loading} className="w-full bg-brand-green text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-green-800 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Page Header Helper ---
const PageHeader = ({ title, onAdd, onSearch, searchTerm }: { title: string, onAdd?: () => void, onSearch?: (term: string) => void, searchTerm?: string }) => (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
            {onSearch && (
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => onSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white focus:ring-2 focus:ring-brand-green outline-none"
                    />
                </div>
            )}
            {onAdd && (
                <button onClick={onAdd} className="bg-brand-green text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-green-800 transition-colors shadow-md shrink-0">
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add New</span>
                </button>
            )}
        </div>
    </div>
);

// --- Stat Card Helper ---
const StatCard = ({ title, value, icon: Icon, change, colorClass = "text-brand-green" }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase">{title}</h3>
            <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                <Icon className={colorClass} />
            </div>
        </div>
        <p className="text-4xl font-bold text-gray-800">{value}</p>
        {change && <p className={`text-xs mt-2 font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>}
    </div>
);

// --- Dashboard View ---
const DashboardHome = () => {
    const { packages, bookings, generatedPlans, subscribers } = useData();
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const recentBookings = safeBookings.slice(0, 5);

    return (
        <div>
            <PageHeader title="Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Bookings" value={bookings.length} icon={CalendarCheck} change={`+${safeBookings.filter(b => b.status === 'New').length} New`} colorClass="text-green-600" />
                <StatCard title="AI Plans Generated" value={generatedPlans.length} icon={BrainCircuit} colorClass="text-indigo-600" />
                <StatCard title="Packages Offered" value={packages.length} icon={Package} colorClass="text-blue-600" />
                <StatCard title="Subscribers" value={subscribers.length} icon={UserPlus} colorClass="text-orange-600" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                    {recentBookings.map(b => (
                        <div key={b.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg hover:bg-gray-50">
                            <div>
                                <p className="font-bold text-gray-800">{b.customerName}</p>
                                <p className="text-sm text-gray-500">{b.itemName}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                <p className="text-sm font-mono text-brand-orange font-bold">KES {(b.totalPrice || 0).toLocaleString()}</p>
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">{b.status}</span>
                            </div>
                        </div>
                    ))}
                    {recentBookings.length === 0 && <p className="text-center text-gray-400 py-8">No recent bookings.</p>}
                </div>
            </div>
        </div>
    );
};

// --- CRUD Managers ---
const BookingsManager = ({ setModalContent }: { setModalContent: (content: React.ReactNode) => void }) => {
    const { bookings } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    
    const filteredBookings = safeBookings.filter(b => 
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (booking: Booking) => {
        setModalContent(<BookingDetails booking={booking} />);
    };

    return (
        <div>
            <PageHeader title="Bookings" onSearch={setSearchTerm} searchTerm={searchTerm} />
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 uppercase border-b">
                            <th className="p-3">Customer</th>
                            <th className="p-3">Item</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(b => (
                            <tr key={b.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-semibold">{b.customerName}</td>
                                <td className="p-3">{b.itemName}</td>
                                <td className="p-3">{new Date(b.date).toLocaleDateString()}</td>
                                <td className="p-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${b.status === 'New' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{b.status}</span></td>
                                <td className="p-3">
                                    <button onClick={() => handleViewDetails(b)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                                        <ChevronRight size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredBookings.length === 0 && <p className="text-center text-gray-400 py-12">No bookings found.</p>}
            </div>
        </div>
    );
};

const SubscribersManager = () => {
  const { subscribers, deleteSubscriber } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: string, email: string) => {
    if (window.confirm(`Are you sure you want to remove ${email}?`)) {
      await deleteSubscriber(id);
    }
  };

  const filteredSubscribers = (subscribers || []).filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <PageHeader title="Subscribers" onSearch={setSearchTerm} searchTerm={searchTerm} />
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 uppercase border-b">
              <th className="p-3">Email</th>
              <th className="p-3">Subscribed On</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{s.email}</td>
                <td className="p-3">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(s.id, s.email)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubscribers.length === 0 && <p className="text-center text-gray-400 py-12">No subscribers found.</p>}
      </div>
    </div>
  );
};

const GeneratedPlansManager = ({ setModalContent }: { setModalContent: (content: React.ReactNode) => void }) => {
    const { generatedPlans } = useData();

    const handleViewDetails = (plan: GeneratedPlan) => {
      setModalContent(
        <div className="text-sm">
          <h4 className="font-bold text-lg mb-4">{plan.response.tripTitle}</h4>
          <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
              <div><strong>Email:</strong> {plan.email}</div>
              <div><strong>Generated:</strong> {new Date(plan.created_at).toLocaleString()}</div>
              <div><strong>Destination:</strong> {plan.request.destination}</div>
              <div><strong>Days:</strong> {plan.request.days}</div>
              <div><strong>Budget:</strong> {plan.request.budget}</div>
              <div><strong>Travelers:</strong> {plan.request.travelers}</div>
              <div className="col-span-2"><strong>Interests:</strong> {plan.request.interests || 'N/A'}</div>
          </div>
          <p className="italic text-gray-600 mb-4">"{plan.response.summary}"</p>
          <div className="space-y-4">
            {plan.response.itinerary.map(day => (
              <div key={day.day}>
                <h5 className="font-bold text-brand-green">Day {day.day}: {day.title}</h5>
                <ul className="list-disc pl-5 text-gray-700">
                  {day.activities.map((act, i) => <li key={i}>{act}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
        <div>
            <PageHeader title="AI Generated Plans" />
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 uppercase border-b">
                            <th className="p-3">Trip Title</th>
                            <th className="p-3">User Email</th>
                            <th className="p-3">Destination</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(generatedPlans || []).map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-semibold">{p.response.tripTitle}</td>
                                <td className="p-3">{p.email}</td>
                                <td className="p-3">{p.request.destination}</td>
                                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button onClick={() => handleViewDetails(p)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                                        <ChevronRight size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CrmManager = ({ setModalContent }: { setModalContent: (content: React.ReactNode) => void }) => {
    const [activeTab, setActiveTab] = useState('bookings');
    
    return (
        <div>
            <PageHeader title="Customer Relations" />
            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 font-semibold ${activeTab === 'bookings' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}>Bookings</button>
                <button onClick={() => setActiveTab('subscribers')} className={`px-4 py-2 font-semibold ${activeTab === 'subscribers' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}>Subscribers</button>
                <button onClick={() => setActiveTab('plans')} className={`px-4 py-2 font-semibold ${activeTab === 'plans' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}>AI Plans</button>
            </div>
            {activeTab === 'bookings' && <BookingsManager setModalContent={setModalContent} />}
            {activeTab === 'subscribers' && <SubscribersManager />}
            {activeTab === 'plans' && <GeneratedPlansManager setModalContent={setModalContent} />}
        </div>
    );
};

// Generic Manager and Form creation functions to reduce boilerplate
function createManagerComponent<T extends { id: string; title?: string; name?: string }>(
    title: string,
    dataKey: keyof DataContextType,
    actionKeys: { add: keyof DataContextType; update: keyof DataContextType; remove: keyof DataContextType },
    FormComponent: React.FC<{ item: T | null; onSave: (item: T) => void; onCancel: () => void; dataContext: DataContextType }>
) {
    return ({ setModalContent }: { setModalContent: (content: React.ReactNode) => void }) => {
        const dataContext = useData();
        const items = (dataContext[dataKey] as unknown as T[]) || [];
        const [currentItem, setCurrentItem] = useState<T | null>(null);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');

        const filteredItems = items.filter(item => 
            (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const addAction = dataContext[actionKeys.add] as unknown as (item: Omit<T, 'id'>) => Promise<boolean>;
        const updateAction = dataContext[actionKeys.update] as unknown as (item: T) => Promise<boolean>;
        const removeAction = dataContext[actionKeys.remove] as unknown as (id: string) => Promise<boolean>;

        const handleAdd = () => { setCurrentItem(null); setIsModalOpen(true); };
        const handleEdit = (item: T) => { setCurrentItem(item); setIsModalOpen(true); };
        const handleDelete = async (id: string) => { if (window.confirm('Are you sure?')) await removeAction(id); };

        const handleSave = async (item: T) => {
            if (item.id) {
                await updateAction(item);
            } else {
                const { id, ...newItem } = item;
                await addAction(newItem as Omit<T, 'id'>);
            }
            setIsModalOpen(false);
        };
        
        return (
            <div>
                <PageHeader title={title} onAdd={handleAdd} onSearch={setSearchTerm} searchTerm={searchTerm} />
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 uppercase border-b">
                                <th className="p-3">Title</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-semibold">
                                        {item.title || item.name}
                                        {dataKey === 'destinations' && (
                                            <span className="ml-2 bg-brand-light text-brand-green text-xs font-bold px-2 py-0.5 rounded-full">
                                                {(dataContext.packages as any[]).filter(p => p.destination?.trim().toLowerCase() === (item.name || '').trim().toLowerCase()).length} Pkgs
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-200 rounded-full"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredItems.length === 0 && <p className="text-center text-gray-400 py-12">No items found.</p>}
                </div>
                {isModalOpen && (
                    <Modal onClose={() => setIsModalOpen(false)} title={currentItem ? `Edit ${title}` : `Add ${title}`}>
                        <FormComponent item={currentItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} dataContext={dataContext} />
                    </Modal>
                )}
            </div>
        );
    };
}

const GenericForm = ({ item, onSave, onCancel, fields }: { item: any, onSave: (item: any) => void, onCancel: () => void, fields: {name: string, label: string, type?: string}[] }) => {
    const [formData, setFormData] = useState(item || {});
    const handleChange = (name: string, value: any) => setFormData({ ...formData, [name]: value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit}>
            {fields.map(f => <InputField key={f.name} label={f.label} type={f.type} value={formData[f.name]} onChange={(val: any) => handleChange(f.name, val)} />)}
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-brand-green text-white hover:bg-green-800">Save</button>
            </div>
        </form>
    );
};

// --- REWRITTEN PACKAGE FORM (Dropdown + Featured Toggle) ---
const PackageForm: React.FC<{ item: PackageType | null, onSave: (item: any) => void, onCancel: () => void, dataContext: DataContextType }> = ({ item, onSave, onCancel, dataContext }) => {
    const [formData, setFormData] = useState<Partial<PackageType>>(item || {});
    const handleChange = (name: string, value: any) => setFormData({ ...formData, [name]: value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputField label="Title" value={formData.title} onChange={(v: string) => handleChange('title', v)} required />
                
                {/* Dynamic Destination Dropdown */}
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destination</label>
                    <select 
                        value={formData.destination || ""} 
                        onChange={e => handleChange('destination', e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                        required
                    >
                        <option value="">Select a Destination...</option>
                        {(dataContext?.destinations || []).map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Type</label>
                    <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                        <option>Safari</option><option>Honeymoon</option><option>Family</option>
                        <option>Luxury</option><option>Budget</option><option>International</option>
                    </select>
                </div>
                <InputField label="Price (KES)" type="number" value={formData.price} onChange={(v: string) => handleChange('price', parseFloat(v))} />
                <InputField label="Duration" value={formData.duration} onChange={(v: string) => handleChange('duration', v)} />
                <InputField label="Rating" type="number" value={formData.rating} onChange={(v: string) => handleChange('rating', parseFloat(v))} />
            </div>
            
            {/* Hide Price Toggle */}
            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer" onClick={() => handleChange('hidePrice', !formData.hidePrice)}>
                <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors ${formData.hidePrice ? 'bg-brand-green' : ''}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.hidePrice ? 'translate-x-6' : ''}`}></div>
                </div>
                <div className="flex items-center gap-2">
                    <EyeOff size={16} className="text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">Hide Price on Website</span>
                </div>
            </div>

            {/* Feature on Homepage Toggle */}
            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer" onClick={() => handleChange('isFeatured', !formData.isFeatured)}>
                <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors ${formData.isFeatured ? 'bg-brand-orange' : ''}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.isFeatured ? 'translate-x-6' : ''}`}></div>
                </div>
                <div className="flex items-center gap-2">
                    <Star size={16} className={formData.isFeatured ? "text-brand-orange" : "text-gray-500"} />
                    <span className="text-sm font-bold text-gray-700">Feature on Homepage</span>
                </div>
            </div>

            <InputField label="Description" type="textarea" value={formData.description} onChange={(v: string) => handleChange('description', v)} />
            <ImageListEditor items={formData.images || []} onChange={v => handleChange('images', v)} />
            <DynamicListEditor label="Inclusions" items={formData.inclusions || []} onChange={v => handleChange('inclusions', v)} />
            <DynamicListEditor label="Exclusions" items={formData.exclusions || []} onChange={v => handleChange('exclusions', v)} />
            <ItineraryEditor items={formData.detailedItinerary || []} onChange={v => handleChange('detailedItinerary', v)} />
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-brand-green text-white hover:bg-green-800">Save</button>
            </div>
        </form>
    );
};

// --- REWRITTEN DESTINATION FORM (Auto Package Count) ---
const DestinationForm: React.FC<{ item: Destination | null, onSave: (item: any) => void, onCancel: () => void, dataContext: DataContextType }> = ({ item, onSave, onCancel, dataContext }) => {
    const [formData, setFormData] = useState<Partial<Destination>>(item || {});
    const [isGenerating, setIsGenerating] = useState(false);
    const handleChange = (name: string, value: any) => setFormData({ ...formData, [name]: value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    const handleGenerateInsight = async () => {
        if (!formData.name) { alert("Please enter a destination name first."); return; }
        setIsGenerating(true);
        const insight = await getDestinationInsights(formData.name, dataContext.settings.aiProvider);
        handleChange('insight', insight);
        setIsGenerating(false);
    };

    // Calculate live package count
    const currentPackageCount = formData.name 
        ? dataContext.packages.filter(p => p.destination?.trim().toLowerCase() === formData.name?.trim().toLowerCase()).length 
        : 0;

    return (
        <form onSubmit={handleSubmit}>
            <InputField label="Name" value={formData.name} onChange={(v: string) => handleChange('name', v)} required />
            <ImagePicker label="Image" value={formData.image || ''} onChange={(v: string) => handleChange('image', v)} />
            <InputField label="Description" type="textarea" value={formData.description} onChange={(v: string) => handleChange('description', v)} />
            
            {/* Read-Only Package Count Display */}
            <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-200 flex justify-between items-center">
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Live Package Count</span>
                    <span className="text-xs text-gray-500">Automatically calculated based on linked packages.</span>
                </div>
                <div className="text-3xl font-bold text-brand-dark bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
                    {currentPackageCount}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer" onClick={() => handleChange('isFeatured', !formData.isFeatured)}>
                    <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors ${formData.isFeatured ? 'bg-brand-orange' : ''}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.isFeatured ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star size={16} className={formData.isFeatured ? "text-brand-orange" : "text-gray-500"} />
                        <span className="text-sm font-bold text-gray-700">Feature on Homepage</span>
                    </div>
                </div>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50/50 mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">AI Travel Guide</label>
                <button type="button" onClick={handleGenerateInsight} disabled={isGenerating} className="mb-2 bg-indigo-500 text-white px-3 py-1 text-xs rounded-full flex items-center gap-1 disabled:opacity-50">
                    {isGenerating ? <><Loader2 size={12} className="animate-spin"/> Generating...</> : <><Sparkles size={12}/> Generate Guide</>}
                </button>
                {formData.insight && (
                    <div className="bg-white p-2 rounded-md text-xs">
                        <p><strong>Content:</strong> {(formData.insight.content || "").substring(0, 100)}...</p>
                        <p><strong>Sources:</strong> {formData.insight.sources?.length || 0}</p>
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-brand-green text-white hover:bg-green-800">Save</button>
            </div>
        </form>
    );
};

const PostForm: React.FC<{ item: Post | null, onSave: (item: any) => void, onCancel: () => void }> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Post>>(item || { tags: [], status: 'draft' });
    const handleChange = (name: string, value: any) => setFormData({ ...formData, [name]: value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit}>
            <InputField label="Title" value={formData.title} onChange={(v: string) => handleChange('title', v)} required />
            <InputField label="Slug" value={formData.slug} onChange={(v: string) => handleChange('slug', v)} required />
            <InputField label="Author Name" value={formData.author_name} onChange={(v: string) => handleChange('author_name', v)} />
            <ImagePicker label="Featured Image" value={formData.featured_image || ''} onChange={(v: string) => handleChange('featured_image', v)} />
            <InputField label="Excerpt" type="textarea" value={formData.excerpt} onChange={(v: string) => handleChange('excerpt', v)} />
            <InputField label="Content (Markdown)" type="textarea" value={formData.content} onChange={(v: string) => handleChange('content', v)} />
            <DynamicListEditor label="Tags" items={formData.tags || []} onChange={(v: string[]) => handleChange('tags', v)} />
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-brand-green text-white hover:bg-green-800">Save</button>
            </div>
        </form>
    );
};

const SettingsForm = () => {
    const { settings, updateSettings, resetData } = useData();
    const [formData, setFormData] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => setFormData(settings), [settings]);

    const handleChange = (section: keyof SiteSettings, key: string, value: any) => {
        setFormData(prev => ({ ...prev, [section]: { ...(prev[section] as any), [key]: value } }));
    };
    const handleDirectChange = (key: keyof SiteSettings, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };
    const handleArrayChange = (key: keyof SiteSettings, index: number, value: string) => {
        const newArr = [...(formData[key] as string[])];
        newArr[index] = value;
        setFormData(prev => ({ ...prev, [key]: newArr }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateSettings(formData);
        setIsSaving(false);
        if (success) {
            alert("Settings saved successfully!");
        } else {
            alert("Failed to save settings. Please check the console for errors.");
        }
    };
    
    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'contact', label: 'Contact & Socials', icon: AtSign },
        { id: 'technical', label: 'Technical', icon: Cpu },
        { id: 'account', label: 'Account', icon: Shield },
    ];
    
    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Site Settings</h2>
                <button onClick={handleSave} disabled={isSaving} className="bg-brand-green text-white px-4 py-2 rounded-full flex items-center justify-center sm:justify-start gap-2 hover:bg-green-800 disabled:opacity-50 shadow-md">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
                </button>
            </div>

            <div className="flex border-b border-gray-200 mb-6 flex-wrap">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors ${activeTab === tab.id ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500 hover:text-brand-dark'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border">
                {activeTab === 'general' && <GeneralSettingsTab formData={formData} handleDirectChange={handleDirectChange} handleChange={handleChange} resetData={resetData} />}
                {activeTab === 'content' && <ContentSettingsTab formData={formData} handleChange={handleChange} />}
                {activeTab === 'contact' && <ContactSettingsTab formData={formData} handleDirectChange={handleDirectChange} handleArrayChange={handleArrayChange} handleChange={handleChange} />}
                {activeTab === 'technical' && <TechnicalSettingsTab formData={formData} handleDirectChange={handleDirectChange} handleChange={handleChange} />}
                {activeTab === 'account' && <AccountSettingsTab />}
            </div>
        </div>
    );
};

// --- Settings Tabs ---
const GeneralSettingsTab = ({ formData, handleDirectChange, handleChange, resetData }: any) => (
  <div>
    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={18}/> General</h3>
    <InputField label="Site Name" value={formData.siteName} onChange={(v: string) => handleDirectChange('siteName', v)} />
    <ImagePicker label="Logo URL" value={formData.logo || ''} onChange={(v: string) => handleDirectChange('logo', v)} />
    <ImagePicker label="Favicon URL" value={formData.favicon || ''} onChange={(v: string) => handleDirectChange('favicon', v)} />
    <ImagePicker label="White Logo URL (Transparent Header)" value={formData.logoWhite || ''} onChange={(v: string) => handleDirectChange('logoWhite', v)} />
    
    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer mb-6" onClick={() => handleDirectChange('enableServices', !formData.enableServices)}>
        <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors ${formData.enableServices !== false ? 'bg-brand-green' : ''}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.enableServices !== false ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="flex items-center gap-2">
            <Settings size={16} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-700">Enable "Services" Functionality</span>
        </div>
    </div>
    
    <div className="mt-6 pt-6 border-t">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Globe size={18}/> SEO</h3>
        <InputField label="Meta Title" value={formData.seo.title} onChange={(v: string) => handleChange('seo', 'title', v)} />
        <InputField label="Meta Description" value={formData.seo.description} onChange={(v: string) => handleChange('seo', 'description', v)} />
        <InputField label="Meta Keywords" value={formData.seo.keywords} onChange={(v: string) => handleChange('seo', 'keywords', v)} />
    </div>

    <div className="mt-6 pt-6 border-t border-red-200">
        <div className="p-4 border rounded-lg bg-red-50 border-red-200">
            <h4 className="font-bold text-red-700 mb-2">Danger Zone</h4>
            <button onClick={resetData} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">Reset All Data</button>
            <p className="text-xs text-red-600 mt-2">This will delete all content and restore the initial demo data. This action is irreversible.</p>
        </div>
    </div>
  </div>
);

const ContentSettingsTab = ({ formData, handleChange }: any) => {
    const handleAboutUsChange = (key: string, value: any) => {
        handleChange('aboutUsSection', key, value);
    };
    return (
    <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={18}/> Content Sections</h3>
        <div className="p-4 border rounded-lg bg-gray-50/50 mb-4">
          <label className="text-sm font-bold">Hero Section</label>
          <InputField label="Video URL" value={formData.hero.videoUrl} onChange={(v: string) => handleChange('hero', 'videoUrl', v)} />
          <InputField label="Fallback Image URL" value={formData.hero.fallbackImage} onChange={(v: string) => handleChange('hero', 'fallbackImage', v)} />
          <InputField label="Title" value={formData.hero.title} onChange={(v: string) => handleChange('hero', 'title', v)} />
          <InputField label="Subtitle" value={formData.hero.subtitle} onChange={(v: string) => handleChange('hero', 'subtitle', v)} />
        </div>
        <div className="p-4 border rounded-lg bg-gray-50/50 mb-4">
          <label className="text-sm font-bold">Homepage "Why Choose Us" Section</label>
          <ImagePicker label="Image 1 (Back, Angled)" value={formData.aboutUsSection.image1_url} onChange={(v: string) => handleAboutUsChange('image1_url', v)} />
          <ImagePicker label="Image 2 (Front, Straight)" value={formData.aboutUsSection.image2_url} onChange={(v: string) => handleAboutUsChange('image2_url', v)} />
          <InputField label="Review Rating" value={formData.aboutUsSection.review_rating} onChange={(v: string) => handleAboutUsChange('review_rating', v)} placeholder="e.g., 4.9/5" />
          <InputField label="Review Count" value={formData.aboutUsSection.review_count} onChange={(v: string) => handleAboutUsChange('review_count', v)} placeholder="e.g., 200+ Reviews" />
          <InputField label="Pre-Title" value={formData.aboutUsSection.pre_title} onChange={(v: string) => handleAboutUsChange('pre_title', v)} placeholder="e.g., Why Choose Us" />
          <InputField label="Title" value={formData.aboutUsSection.title} onChange={(v: string) => handleAboutUsChange('title', v)} />
          <InputField label="Feature 1" value={formData.aboutUsSection.feature1} onChange={(v: string) => handleAboutUsChange('feature1', v)} />
          <InputField label="Feature 2" value={formData.aboutUsSection.feature2} onChange={(v: string) => handleAboutUsChange('feature2', v)} />
          <InputField label="Feature 3" value={formData.aboutUsSection.feature3} onChange={(v: string) => handleAboutUsChange('feature3', v)} />
          <InputField label="Paragraph 1" type="textarea" value={formData.aboutUsSection.paragraph1} onChange={(v: string) => handleAboutUsChange('paragraph1', v)} />
          <InputField label="Paragraph 2" type="textarea" value={formData.aboutUsSection.paragraph2} onChange={(v: string) => handleAboutUsChange('paragraph2', v)} />
          <InputField label="Button Text" value={formData.aboutUsSection.button_text} onChange={(v: string) => handleAboutUsChange('button_text', v)} />
          <InputField label="Button Link" value={formData.aboutUsSection.button_link} onChange={(v: string) => handleAboutUsChange('button_link', v)} placeholder="e.g., /about" />
        </div>
        <div className="p-4 border rounded-lg bg-gray-50/50">
          <label className="text-sm font-bold">About Page</label>
          <InputField label="Title" value={formData.about.title} onChange={(v: string) => handleChange('about', 'title', v)} />
          <InputField label="Subtitle" value={formData.about.subtitle} onChange={(v: string) => handleChange('about', 'subtitle', v)} />
          <ImagePicker label="Image URL" value={formData.about.imageUrl} onChange={(v: string) => handleChange('about', 'imageUrl', v)} />
          <InputField label="Paragraph 1" type="textarea" value={formData.about.paragraph1} onChange={(v: string) => handleChange('about', 'paragraph1', v)} />
          <InputField label="Paragraph 2" type="textarea" value={formData.about.paragraph2} onChange={(v: string) => handleChange('about', 'paragraph2', v)} />
          <InputField label="Stat 1 Value" value={formData.about.stat1_value} onChange={(v: string) => handleChange('about', 'stat1_value', v)} />
          <InputField label="Stat 1 Label" value={formData.about.stat1_label} onChange={(v: string) => handleChange('about', 'stat1_label', v)} />
          <InputField label="Stat 2 Value" value={formData.about.stat2_value} onChange={(v: string) => handleChange('about', 'stat2_value', v)} />
          <InputField label="Stat 2 Label" value={formData.about.stat2_label} onChange={(v: string) => handleChange('about', 'stat2_label', v)} />
        </div>
        <div className="p-4 border rounded-lg bg-gray-50/50 mt-4">
            <h4 className="font-bold text-sm mb-4">Page Headers (Images & Titles)</h4>
            {/* Destinations Header */}
            <div className="mb-6 border-b pb-4">
                <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Destinations Page</h5>
                <ImagePicker label="Header Image" value={formData.pageHeaders?.destinations?.image || ''} onChange={(v: string) => handleChange('pageHeaders', 'destinations', { ...formData.pageHeaders?.destinations, image: v })} />
                <InputField label="Title" value={formData.pageHeaders?.destinations?.title} onChange={(v: string) => handleChange('pageHeaders', 'destinations', { ...formData.pageHeaders?.destinations, title: v })} />
                <InputField label="Subtitle" value={formData.pageHeaders?.destinations?.subtitle} onChange={(v: string) => handleChange('pageHeaders', 'destinations', { ...formData.pageHeaders?.destinations, subtitle: v })} />
            </div>
            {/* Tours Header */}
            <div className="mb-6 border-b pb-4">
                <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Packages/Tours Page</h5>
                <ImagePicker label="Header Image" value={formData.pageHeaders?.tours?.image || ''} onChange={(v: string) => handleChange('pageHeaders', 'tours', { ...formData.pageHeaders?.tours, image: v })} />
                <InputField label="Title" value={formData.pageHeaders?.tours?.title} onChange={(v: string) => handleChange('pageHeaders', 'tours', { ...formData.pageHeaders?.tours, title: v })} />
                <InputField label="Subtitle" value={formData.pageHeaders?.tours?.subtitle} onChange={(v: string) => handleChange('pageHeaders', 'tours', { ...formData.pageHeaders?.tours, subtitle: v })} />
            </div>
            {/* Services Header */}
            <div className="mb-6 border-b pb-4">
                <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Services Page</h5>
                <ImagePicker label="Header Image" value={formData.pageHeaders?.services?.image || ''} onChange={(v: string) => handleChange('pageHeaders', 'services', { ...formData.pageHeaders?.services, image: v })} />
                <InputField label="Title" value={formData.pageHeaders?.services?.title} onChange={(v: string) => handleChange('pageHeaders', 'services', { ...formData.pageHeaders?.services, title: v })} />
                <InputField label="Subtitle" value={formData.pageHeaders?.services?.subtitle} onChange={(v: string) => handleChange('pageHeaders', 'services', { ...formData.pageHeaders?.services, subtitle: v })} />
            </div>
            {/* Blog Header */}
            <div className="mb-6 border-b pb-4">
                <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Blog Page</h5>
                <ImagePicker label="Header Image" value={formData.pageHeaders?.blog?.image || ''} onChange={(v: string) => handleChange('pageHeaders', 'blog', { ...formData.pageHeaders?.blog, image: v })} />
                <InputField label="Title" value={formData.pageHeaders?.blog?.title} onChange={(v: string) => handleChange('pageHeaders', 'blog', { ...formData.pageHeaders?.blog, title: v })} />
                <InputField label="Subtitle" value={formData.pageHeaders?.blog?.subtitle} onChange={(v: string) => handleChange('pageHeaders', 'blog', { ...formData.pageHeaders?.blog, subtitle: v })} />
            </div>
            {/* Contact Header */}
            <div className="mb-6">
                <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Contact Page</h5>
                <ImagePicker label="Header Image" value={formData.pageHeaders?.contact?.image || ''} onChange={(v: string) => handleChange('pageHeaders', 'contact', { ...formData.pageHeaders?.contact, image: v })} />
                <InputField label="Title" value={formData.pageHeaders?.contact?.title} onChange={(v: string) => handleChange('pageHeaders', 'contact', { ...formData.pageHeaders?.contact, title: v })} />
                <InputField label="Subtitle" value={formData.pageHeaders?.contact?.subtitle} onChange={(v: string) => handleChange('pageHeaders', 'contact', { ...formData.pageHeaders?.contact, subtitle: v })} />
            </div>
        </div>
    </div>
)};

const ContactSettingsTab = ({ formData, handleDirectChange, handleArrayChange, handleChange }: any) => (
    <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AtSign size={18}/> Contact & Socials</h3>
        <InputField label="Admin Notification Email" value={formData.adminEmail} onChange={(v: string) => handleDirectChange('adminEmail', v)} />
        <InputField label="Phone 1" value={formData.phone[0]} onChange={(v: string) => handleArrayChange('phone', 0, v)} />
        <InputField label="Phone 2" value={formData.phone[1]} onChange={(v: string) => handleArrayChange('phone', 1, v)} />
        <InputField label="Email" value={formData.email} onChange={(v: string) => handleDirectChange('email', v)} />
        <InputField label="Address" value={formData.address} onChange={(v: string) => handleDirectChange('address', v)} />
        <InputField label="WhatsApp Number" value={formData.whatsapp} onChange={(v: string) => handleDirectChange('whatsapp', v)} />
        <InputField label="Facebook URL" value={formData.socials.facebook} onChange={(v: string) => handleChange('socials', 'facebook', v)} />
        <InputField label="Instagram URL" value={formData.socials.instagram} onChange={(v: string) => handleChange('socials', 'instagram', v)} />
        <InputField label="Twitter URL" value={formData.socials.twitter} onChange={(v: string) => handleChange('socials', 'twitter', v)} />
    </div>
);

const TechnicalSettingsTab = ({ formData, handleDirectChange, handleChange }: any) => (
    <div>
        <div className="mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BrainCircuit size={18}/> AI Provider</h3>
            <select value={formData.aiProvider} onChange={e => handleDirectChange('aiProvider', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
            </select>
        </div>
        <div className="mb-6 pt-6 border-t">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Database size={18}/> Storage Provider</h3>
            <select value={formData.storageProvider} onChange={e => handleDirectChange('storageProvider', e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                <option value="supabase">Supabase Storage</option>
                <option value="wasabi">Wasabi (S3 Compatible)</option>
            </select>
            {formData.storageProvider === 'wasabi' && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50/50">
                    <InputField label="Wasabi Access Key ID" value={formData.wasabi.accessKeyId} onChange={(v: string) => handleChange('wasabi', 'accessKeyId', v)} />
                    <InputField label="Wasabi Secret Access Key" type="password" value={formData.wasabi.secretAccessKey} onChange={(v: string) => handleChange('wasabi', 'secretAccessKey', v)} />
                    <InputField label="Wasabi Region" value={formData.wasabi.region} onChange={(v: string) => handleChange('wasabi', 'region', v)} placeholder="e.g., us-east-1" />
                    <InputField label="Wasabi Bucket Name" value={formData.wasabi.bucket} onChange={(v: string) => handleChange('wasabi', 'bucket', v)} />
                </div>
            )}
        </div>
        <div className="pt-6 border-t">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Server size={18}/> SMTP (for Email Notifications)</h3>
             <div className="p-4 border rounded-lg bg-gray-50/50">
                <InputField label="SMTP Server" value={formData.smtp.server} onChange={(v: string) => handleChange('smtp', 'server', v)} />
                <InputField label="SMTP Port" type="number" value={formData.smtp.port} onChange={(v: string) => handleChange('smtp', 'port', parseInt(v))} />
                <InputField label="SMTP User" value={formData.smtp.user} onChange={(v: string) => handleChange('smtp', 'user', v)} />
                <InputField label="SMTP Password" type="password" value={formData.smtp.pass} onChange={(v: string) => handleChange('smtp', 'pass', v)} />
             </div>
        </div>
    </div>
);

const AccountSettingsTab = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (password !== confirm) {
            setMessage({ text: 'Passwords do not match.', type: 'error' });
            return;
        }
        if (password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }
        setLoading(true);
        // Supabase update is disabled, using generic API response mockup for now as per api.php structure
        try {
            const res = await fetch('https://yellow-salmon-323871.hostingersite.com/skylineapi.php?action=change_password', {
                method: 'POST',
                body: JSON.stringify({ password }),
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('skyline_token')}` 
                }
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: 'Password updated successfully!', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Update failed', type: 'error' });
            }
        } catch (e) {
             setMessage({ text: 'Network error', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Shield size={18}/> Admin Account</h3>
            <form onSubmit={handleUpdate}>
                <InputField label="New Password" type="password" value={password} onChange={setPassword} required />
                <InputField label="Confirm New Password" type="password" value={confirm} onChange={setConfirm} required />
                {message && <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-brand-green text-white hover:bg-green-800 flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Update Password
                </button>
            </form>
        </div>
    );
};


// --- Manager Components ---
const PackagesManager = createManagerComponent('Packages', 'packages', { 
    add: 'addPackage', update: 'updatePackage', remove: 'deletePackage'
}, PackageForm as any);

const DestinationsManager = createManagerComponent('Destinations', 'destinations', {
    add: 'addDestination', update: 'updateDestination', remove: 'deleteDestination'
}, DestinationForm as any);

const ServicesManager = createManagerComponent('Services', 'services', {
    add: 'addService', update: 'updateService', remove: 'deleteService'
}, ({ item, onSave, onCancel }) => <GenericForm item={item} onSave={onSave} onCancel={onCancel} fields={[
    {name: 'id', label: 'ID (e.g., car-hire)'}, {name: 'title', label: 'Title'}, {name: 'iconName', label: 'Icon Name'},
    {name: 'description', label: 'Short Description', type: 'textarea'},
    {name: 'fullDescription', label: 'Full Description', type: 'textarea'},
    {name: 'image', label: 'Image URL'}
]} />);

const TestimonialsManager = createManagerComponent('Testimonials', 'testimonials', {
    add: 'addTestimonial', update: 'updateTestimonial', remove: 'deleteTestimonial'
}, ({ item, onSave, onCancel }) => <GenericForm item={item} onSave={onSave} onCancel={onCancel} fields={[
    {name: 'name', label: 'Name'}, {name: 'role', label: 'Role'}, 
    {name: 'content', label: 'Content', type: 'textarea'},
    {name: 'rating', label: 'Rating (1-5)', type: 'number'}
]} />);

const FaqsManager = createManagerComponent('FAQs', 'faqs', {
    add: 'addFaq', update: 'updateFaq', remove: 'deleteFaq'
}, ({ item, onSave, onCancel }) => <GenericForm item={item} onSave={onSave} onCancel={onCancel} fields={[
    {name: 'question', label: 'Question'}, {name: 'answer', label: 'Answer', type: 'textarea'}
]} />);

const PostsManager = createManagerComponent('Blog Posts', 'posts', {
    add: 'addPost', update: 'updatePost', remove: 'deletePost'
}, PostForm);

// --- Extracted Sidebar Components (Fixed Error #300) ---

const SidebarLink = ({ to, icon: Icon, text, notificationCount, onClick }: any) => {
    const location = useLocation();
    const fullPath = to === '' ? '/admin' : `/admin/${to}`;
    const isActive = location.pathname === fullPath || (to === '' && location.pathname === '/admin/');

    return (
        <Link 
            to={fullPath} 
            onClick={onClick} 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive ? 'bg-brand-green text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            <Icon size={18} />
            <span>{text}</span>
            {notificationCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{notificationCount}</span>}
        </Link>
    );
};

const AdminSidebar = ({ isOpen, onClose, handleLogout }: { isOpen: boolean, onClose: () => void, handleLogout: () => void }) => {
    const { settings } = useData(); 
    const { newBookingCount, newSubscriberCount } = useNotification(); 
    const showServices = settings.enableServices !== false;

    return (
        <aside className={`bg-white border-r border-gray-200 w-64 p-4 flex-shrink-0 flex flex-col fixed lg:relative h-full z-50 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2">
                    <img src={settings.logo} alt="Logo" className="h-12"/>
                    <span className="font-bold text-lg text-brand-dark">Admin</span>
                </Link>
                <button className="lg:hidden p-2" onClick={onClose}><X/></button>
            </div>
            <nav className="flex-grow space-y-2">
                <SidebarLink to="" icon={LayoutDashboard} text="Dashboard" onClick={onClose} />
                <SidebarLink to="crm" icon={Users} text="CRM" notificationCount={newBookingCount + newSubscriberCount} onClick={onClose} />
                <SidebarLink to="packages" icon={Package} text="Packages" onClick={onClose} />
                <SidebarLink to="destinations" icon={MapIcon} text="Destinations" onClick={onClose} />
                {showServices && <SidebarLink to="services" icon={Briefcase} text="Services" onClick={onClose} />}
                <SidebarLink to="testimonials" icon={QuoteIcon} text="Testimonials" onClick={onClose} />
                <SidebarLink to="faqs" icon={MessageSquare} text="FAQs" onClick={onClose} />
                <SidebarLink to="blog" icon={FileText} text="Blog" onClick={onClose} />
            </nav>
            <div className="mt-auto">
                <SidebarLink to="settings" icon={Settings} text="Settings" onClick={onClose} />
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 w-full">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

// --- Main AdminPage Layout ---
const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('skyline_token');
    if (token) setIsAuthenticated(true);
    setLoadingSession(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('skyline_token');
    setIsAuthenticated(false);
    navigate('/admin');
  };

  if (loadingSession) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin text-brand-green" size={48} /></div>;

  if (!isAuthenticated) return <Login />;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} handleLogout={handleLogout} />
      
      <div className="flex-grow flex flex-col w-full lg:w-auto">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b p-4 lg:hidden z-40 flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2"><Menu /></button>
            <span className="font-bold">Admin Panel</span>
        </header>
        <main className="flex-grow p-6 md:p-8">
            <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="crm" element={<CrmManager setModalContent={setModalContent} />} />
                <Route path="packages" element={<PackagesManager setModalContent={setModalContent} />} />
                <Route path="destinations" element={<DestinationsManager setModalContent={setModalContent} />} />
                <Route path="services" element={<ServicesManager setModalContent={setModalContent} />} />
                <Route path="testimonials" element={<TestimonialsManager setModalContent={setModalContent} />} />
                <Route path="faqs" element={<FaqsManager setModalContent={setModalContent} />} />
                <Route path="blog" element={<PostsManager setModalContent={setModalContent} />} />
                <Route path="settings" element={<SettingsForm />} />
            </Routes>
        </main>
      </div>
      {modalContent && (
        <Modal onClose={() => setModalContent(null)} title="Details">
            {modalContent}
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;

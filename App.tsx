
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Menu, X, Instagram, Facebook, Twitter, 
  Plane, Hotel, CarFront, Map as MapIcon, Camera, CalendarHeart, 
  ChevronRight, Star, CheckCircle, ArrowRight, Sparkles, Loader2,
  ExternalLink, Info, Calendar, UserCheck, Users, Check, XCircle,
  Clock, ShieldCheck, Quote, BookOpen, Sun, Landmark, ChevronLeft,
  ChevronDown, User, Tag, Lock, Send, BellRing, UserPlus,
  CalendarCheck, Package as PackageIcon, Search, Globe, Compass, Mountain, Palmtree
} from 'lucide-react';
import { generateTripPlan } from './services/aiService';
import { AIItineraryResponse, TripPlanRequest, DestinationInsight, Booking, Package, Service, Destination } from './types';
import { DataProvider, useData } from './context/DataContext';
import AdminPage from './pages/Admin';
import { NotificationProvider, NotificationToaster, useNotification } from './context/NotificationContext';

// --- reusable UI components ---

const SectionHeading = ({ title, subtitle, light = false }: { title: string, subtitle: string, light?: boolean }) => (
  <div className="text-center mb-16">
    <h2 className={`text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight ${light ? 'text-white' : 'text-brand-dark'}`}>{title}</h2>
    <p className={`max-w-2xl mx-auto text-lg ${light ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</p>
    <div className={`w-24 h-1.5 rounded-full mx-auto mt-6 ${light ? 'bg-brand-orange' : 'bg-brand-green'}`}></div>
  </div>
);

const Button = ({ children, primary = true, onClick, className = "", type = "button", disabled = false }: any) => (
  <button 
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-8 py-3.5 rounded-full font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 ${
      disabled ? 'opacity-70 cursor-not-allowed' : ''
    } ${
      primary 
        ? 'bg-brand-green text-white hover:bg-green-800 shadow-lg hover:shadow-green-900/20' 
        : 'bg-brand-orange text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-600/20'
    } ${className}`}
  >
    {children}
  </button>
);

const ServiceIcon = ({ type, className = "w-6 h-6 text-brand-green" }: { type: string, className?: string }) => {
  switch (type) {
    case 'Flights': return <Plane className={className} />;
    case 'Hotels': return <Hotel className={className} />;
    case 'CarHire': return <CarFront className={className} />;
    case 'Tours': return <MapIcon className={className} />;
    case 'Events': return <CalendarHeart className={className} />;
    case 'Photo': return <Camera className={className} />;
    default: return <MapIcon className={className} />;
  }
};

// --- SEO & Scripts Handler ---
const SEOHandler = () => {
  const { settings } = useData();
  
  useEffect(() => {
    if (settings.seo) {
      document.title = settings.seo.title || 'Skyline Savannah Tours';
      
      // Update Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', settings.seo.description || '');

      // Update Meta Keywords
      let metaKeys = document.querySelector('meta[name="keywords"]');
      if (!metaKeys) {
        metaKeys = document.createElement('meta');
        metaKeys.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeys);
      }
      metaKeys.setAttribute('content', settings.seo.keywords || '');
    }
  }, [settings.seo]);

  return null;
};

// --- Favicon Handler ---
const FaviconHandler = () => {
  const { settings } = useData();

  useEffect(() => {
    if (settings.favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.favicon]);

  return null;
};


// --- Scroll To Top Component ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- Loader Component ---
const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-brand-green font-semibold">Loading...</p>
      </div>
    </div>
  );
};

// --- Animation Wrapper Component (No longer animated) ---
interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ children, className = "" }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// --- Package Card Component with Carousel (New Design) ---

const PackageCard: React.FC<{ pkg: Package }> = ({ pkg }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Robust image extraction
  const rawImages = (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) 
    ? pkg.images 
    : (pkg.image ? [pkg.image] : []);
  
  const images = rawImages.filter(url => url && url.trim() !== '');
  
  if (images.length === 0) {
    images.push('https://placehold.co/800x600?text=No+Image');
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link to={`/tours/${pkg.id}`} className="block h-full">
      <div 
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 h-96 w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image / Carousel Layer */}
        <div className="absolute inset-0 bg-gray-200">
           <img 
            src={images[currentImg]} 
            alt={pkg.title} 
            className="w-full h-full object-cover transition-opacity duration-300" 
          />
           
           {/* Carousel Controls */}
           {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-1.5 rounded-full text-white transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-1.5 rounded-full text-white transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Dots */}
              <div className="absolute top-4 left-0 w-full flex justify-center gap-1.5 z-20">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${currentImg === idx ? 'bg-white w-3' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-4 right-4 z-20">
             <span className="bg-brand-orange/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 uppercase tracking-wide">
                {pkg.type}
             </span>
        </div>

        {/* Bottom Overlay Content */}
        <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="bg-black/70 rounded-xl p-5 text-white backdrop-blur-md border border-white/10 transition-all duration-300 group-hover:bg-black/80 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-serif truncate w-full pr-2 group-hover:text-brand-orange transition-colors">{pkg.title}</h3>
                    <div className="flex items-center gap-1 text-brand-gold bg-white/10 px-2 py-0.5 rounded-lg backdrop-blur-sm shrink-0">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{pkg.rating}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-300 mb-4">
                     <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-orange"/> {pkg.destination}</span>
                     <span className="flex items-center gap-1"><Clock size={12} className="text-brand-orange"/> {pkg.duration}</span>
                </div>

                <div className="border-t border-dashed border-white/30 pt-3 flex justify-between items-center text-sm">
                    <div>
                        {pkg.hidePrice ? (
                            <span className="text-white font-bold italic">Contact for Price</span>
                        ) : (
                            <>
                                <span className="text-xs text-gray-400 block">From</span>
                                <span className="font-bold text-brand-orange text-lg">KES {(Number(pkg.price) || 0).toLocaleString()}</span>
                            </>
                        )}
                    </div>
                    <span className="bg-white/20 p-2 rounded-full hover:bg-brand-green hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                        <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
};

// --- Destination Card Component ---
const DestinationCard = ({ destination }: { destination: Destination }) => {
  const { packages } = useData();
  
  // Dynamic calculation of packages for this destination
  const packageCount = packages 
    ? packages.filter(p => p && p.destination && p.destination.trim().toLowerCase() === destination.name.trim().toLowerCase()).length 
    : 0;

  return (
    <Link to={`/destinations/${destination.id}`} className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
      <div className="relative h-96">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover transition-opacity duration-300" 
          onError={(e: any) => e.target.src = 'https://placehold.co/800x600?text=Image'} 
        />
        
        {/* Main overlay with content */}
        <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="bg-black/70 rounded-xl p-5 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-black/80 border border-white/10">
                <h3 className="text-2xl font-bold font-serif mb-2 truncate group-hover:text-brand-orange transition-colors">{destination.name}</h3>
                <p className="text-sm text-gray-200 mb-4 line-clamp-2 h-10">{destination.description}</p>
                <div className="border-t border-dashed border-white/30 pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-brand-gold flex items-center gap-2">
                        <PackageIcon size={16} />
                        {packageCount} Packages
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-brand-orange">
                        Explore <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
};


// --- Cinematic Navbar Component ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { settings } = useData();

  // Admin route check
  if (location.pathname.startsWith('/admin')) return null;

  const isHome = location.pathname === '/';

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if background should be transparent or solid
      setScrolled(currentScrollY > 50);

      // Determine visibility (Hide on scroll down, show on scroll up)
      if (!isOpen) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
           setIsVisible(false);
        } else {
           setIsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Determine styles based on scroll state and page
  const isTransparent = isHome && !scrolled && !isOpen;
  const navClass = isTransparent 
    ? "bg-transparent text-white py-6" 
    : "bg-white/90 backdrop-blur-md text-brand-dark py-3 shadow-md";

  const linkClass = isTransparent
    ? "text-white hover:text-brand-orange"
    : "text-gray-700 hover:text-brand-green";

  const buttonClass = isTransparent
    ? "bg-white/20 hover:bg-white hover:text-brand-green text-white border border-white/40 backdrop-blur-sm"
    : "bg-brand-green text-white hover:bg-brand-dark";

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Services', path: '/services' },
    { name: 'Tours', path: '/tours' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  // Logic to determine which logo to show
  const activeLogo = (isTransparent && settings.logoWhite) ? settings.logoWhite : settings.logo;

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ease-in-out ${navClass} ${(isVisible || isOpen) ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo Construction */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            {activeLogo ? (
              <img src={activeLogo} alt={settings.siteName} className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-12' : 'h-16'}`} />
            ) : (
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center border-2 rounded-lg p-1 transition-all duration-300 ${scrolled ? 'w-10 h-10 border-brand-green' : 'w-12 h-12 border-white'}`}>
                  <Camera className={`w-full h-full ${scrolled ? 'text-brand-green' : 'text-white'}`} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className={`font-handwriting font-bold transition-all ${scrolled ? 'text-2xl text-brand-green' : 'text-3xl text-white'}`}>
                    {settings.siteName?.split(' ')[0] || 'Skyline'}
                  </span>
                  <span className={`font-serif font-bold transition-all ${scrolled ? 'text-lg text-brand-orange' : 'text-xl text-brand-orange'}`}>
                    {settings.siteName?.split(' ').slice(1).join(' ') || 'Savannah Tours'}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-all duration-300 relative group ${linkClass}`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isTransparent ? 'bg-brand-orange' : 'bg-brand-green'}`}></span>
              </Link>
            ))}
            <Link to="/contact">
              <button className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shadow-lg ${buttonClass}`}>
                  Get a Quote
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`xl:hidden p-2 transition-colors relative z-50 ${isTransparent ? 'text-white' : 'text-brand-dark'}`} 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={32} className="text-white" /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* Full Screen Mobile Menu Overlay - OUTSIDE nav to avoid transform clipping */}
      <div className={`fixed inset-0 bg-brand-dark/95 backdrop-blur-xl z-[49] transition-all duration-300 flex flex-col justify-center items-center ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        {/* Close button inside overlay for safety, though the main toggle works too */}
        <button className="absolute top-6 right-6 text-white p-2" onClick={() => setIsOpen(false)}>
           <X size={32} />
        </button>
        
        <div className="flex flex-col space-y-6 text-center max-h-screen overflow-y-auto w-full p-4">
            {navLinks.map((link, idx) => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-3xl font-serif font-bold text-white hover:text-brand-orange transition-colors"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setIsOpen(false)} className="mt-8">
               <button className="bg-brand-green text-white px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:bg-white hover:text-brand-green transition-all">
                  Book Your Trip
               </button>
            </Link>
        </div>
      </div>
    </>
  );
};


// --- Immersive Hero Section with Floating Search ---

const TripFinderWidget = () => {
  const { destinations } = useData();
  const navigate = useNavigate();
  const [dest, setDest] = useState('');
  const [type, setType] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/tours'); // In a real app, pass query params like `?dest=${dest}&type=${type}`
  };

  const safeDestinations = Array.isArray(destinations) ? destinations.filter(d => d) : [];

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 items-center max-w-5xl mx-auto border border-gray-100">
      
      <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 px-2 md:px-4">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          <MapPin size={14} className="text-brand-orange"/> Where to?
        </label>
        <select 
          className="w-full bg-transparent font-bold text-gray-800 outline-none cursor-pointer appearance-none text-sm md:text-base"
          value={dest}
          onChange={(e) => setDest(e.target.value)}
        >
          <option value="">All Destinations</option>
          {safeDestinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 px-2 md:px-4">
         <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
           <Tag size={14} className="text-brand-orange"/> Experience
         </label>
         <select 
           className="w-full bg-transparent font-bold text-gray-800 outline-none cursor-pointer appearance-none text-sm md:text-base"
           value={type}
           onChange={(e) => setType(e.target.value)}
         >
           <option value="">Any Type</option>
           <option value="Safari">Safari Adventure</option>
           <option value="Honeymoon">Honeymoon</option>
           <option value="Family">Family Trip</option>
           <option value="Luxury">Luxury Escape</option>
         </select>
      </div>

      <div className="w-full md:w-32 border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 px-2 md:px-4">
         <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Users size={14} className="text-brand-orange"/> Guests
         </label>
         <input 
           type="number" min="1" max="20"
           className="w-full bg-transparent font-bold text-gray-800 outline-none text-sm md:text-base"
           value={guests}
           onChange={(e) => setGuests(e.target.value)}
         />
      </div>

      <button type="submit" className="w-full md:w-auto bg-brand-green text-white h-12 md:h-14 px-8 rounded-xl md:rounded-2xl font-bold text-lg hover:bg-green-800 transition-all shadow-lg flex items-center justify-center gap-2 group">
         <Search size={20} className="transition-opacity"/> 
         <span className="md:hidden">Search</span>
      </button>
    </form>
  );
};

const Hero = () => {
  const { settings } = useData();
  const hero = settings.hero || {
    videoUrl: 'https://cdn.pixabay.com/video/2022/03/10/110362-687206285_large.mp4',
    fallbackImage: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?q=80&w=2067&auto=format&fit=crop',
    title: 'Discover. Explore.',
    subtitle: ''
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center pt-20 md:pt-0 bg-brand-green">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={hero.videoUrl} type="video/mp4" />
          <img src={hero.fallbackImage} alt="Landscape" className="w-full h-full object-cover" />
        </video>
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60"></div>
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full px-4 text-center py-10 md:py-0">
        <div className="max-w-5xl mx-auto">
            <p className="text-brand-orange font-bold uppercase tracking-[0.2em] mb-2 md:mb-4 text-xs md:text-base">
              Welcome to {settings.siteName || 'Skyline'}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-2xl">
              {hero.title || "The Spirit of Africa"}
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-gray-200 font-light max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed drop-shadow-md px-2">
              {hero.subtitle || "Curated safaris, pristine beaches, and unforgettable memories tailored just for you."}
            </p>
            
            {/* The Trip Finder Widget - Overlapping Bottom */}
            <div className="w-full transform translate-y-0 md:translate-y-8">
               <TripFinderWidget />
            </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity z-20 hidden md:flex"
        onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}
      >
         <span className="text-white text-[10px] uppercase tracking-widest">Scroll to Explore</span>
         <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full"></div>
         </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const location = useLocation();
  const { settings, addSubscriber } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  if (location.pathname.startsWith('/admin')) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('submitting');
      if (!email) return;
      
      const success = await addSubscriber(email);
      if (success) {
          setStatus('success');
          setEmail('');
      } else {
          setStatus('error');
      }
  };

  return (
  <footer className="bg-white text-gray-800 pt-16 pb-8 border-t-4 border-brand-orange shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
    <RevealOnScroll>
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
      <div>
        <div className="mb-6">
          {settings.logo ? (
             <img src={settings.logo} alt={settings.siteName} className="h-16 w-auto object-contain" />
          ) : (
             <div className="flex items-baseline gap-1">
              <span className="text-4xl font-handwriting font-bold text-brand-green">
                 {settings.siteName?.split(' ')[0] || 'Skyline'}
              </span>
              <span className="text-2xl font-serif font-bold text-brand-orange">
                 {settings.siteName?.split(' ').slice(1).join(' ') || 'Savannah Tours'}
              </span>
             </div>
          )}
        </div>
        <p className="text-gray-500 mb-8 leading-relaxed text-sm">Local & International Travel Made Easy. Discover, Explore, and Experience the world with us.</p>
        <div className="flex gap-4">
          <a href={settings.socials.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-brand-light text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-white transition-colors cursor-pointer">
             <Instagram size={20} />
          </a>
          <a href={settings.socials.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-brand-light text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-white transition-colors cursor-pointer">
             <Facebook size={20} />
          </a>
          <a href={settings.socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-brand-light text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-white transition-colors cursor-pointer">
             <Twitter size={20} />
          </a>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-bold mb-6 text-gray-900">Quick Links</h4>
        <ul className="space-y-3 text-gray-600 text-sm font-medium">
          <li><Link to="/destinations" className="hover:text-brand-green hover:translate-x-1 transition-all inline-block">Destinations</Link></li>
          <li><Link to="/tours" className="hover:text-brand-green hover:translate-x-1 transition-all inline-block">Safari Packages</Link></li>
          <li><Link to="/services" className="hover:text-brand-green hover:translate-x-1 transition-all inline-block">Services</Link></li>
          <li><Link to="/blog" className="hover:text-brand-green hover:translate-x-1 transition-all inline-block">Blog</Link></li>
          <li><Link to="/about" className="hover:text-brand-green hover:translate-x-1 transition-all inline-block">About Us</Link></li>
          <li><Link to="/faq" className="hover:text-brand-green hover:translate-x-1 transition-all inline-block">FAQs</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-6 text-gray-900">Contact Us</h4>
        <ul className="space-y-4 text-gray-600 text-sm">
          <li className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-orange group-hover:bg-brand-green group-hover:text-white transition-colors">
                <Phone size={14} />
            </div> 
            <span>{settings.phone[0]}</span>
          </li>
          <li className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-orange group-hover:bg-brand-green group-hover:text-white transition-colors">
                <Mail size={14} />
            </div>
            <span>{settings.email}</span>
          </li>
          <li className="flex items-start gap-3 group">
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-orange shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors mt-1">
                <MapPin size={14} />
            </div>
            <span className="leading-relaxed">{settings.address}</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-6 text-gray-900">Newsletter</h4>
        <p className="text-sm text-gray-500 mb-4">Subscribe for exclusive deals and travel tips.</p>
        {status === 'success' ? (
             <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm border border-green-200 flex items-center gap-2">
                 <CheckCircle size={16} /> Subscribed successfully!
             </div>
        ) : (
            <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your Email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all" 
              />
              <button disabled={status === 'submitting'} className="bg-brand-orange text-white px-4 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-brand-orange/20 hover:-translate-y-0.5 disabled:opacity-70">
                 {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
              </button>
              {status === 'error' && <p className="text-xs text-red-500">Something went wrong. Try again.</p>}
            </form>
        )}
      </div>
    </div>
    </RevealOnScroll>
    <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
      © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
    </div>
  </footer>
  );
};

const FloatingWhatsApp = () => {
  const { settings } = useData();
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  
  return (
    <a 
      href={`https://wa.me/${settings.whatsapp}`} 
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl transition-opacity hover:opacity-90 flex items-center justify-center border-2 border-white animate-bounce-slow"
    >
      <Phone className="w-6 h-6 fill-current" />
    </a>
  );
};

// --- Specific Page Components ---

const AITripPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AIItineraryResponse | null>(null);
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  
  const { addSubscriber, checkAiUsage, saveGeneratedPlan, settings } = useData();
  
  const [formData, setFormData] = useState<TripPlanRequest>({
    destination: '',
    days: 5,
    budget: 'Moderate',
    travelers: 2,
    interests: ''
  });

  const handleVerifyEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      setAccessError(null);
      setLoading(true);
      
      if (!email.includes('@')) {
          setAccessError("Please enter a valid email address.");
          setLoading(false);
          return;
      }

      const subscribeSuccess = await addSubscriber(email);
      if (!subscribeSuccess) {
          setAccessError("Could not verify your email. Please try again.");
          setLoading(false);
          return;
      }

      const allowed = await checkAiUsage(email);
      setLoading(false);

      if (allowed) {
          setIsVerified(true);
      } else {
          setAccessError("Usage limit reached. Please contact us to book.");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateTripPlan(formData, settings.aiProvider);
      setPlan(result);
      await saveGeneratedPlan(email, formData, result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24 bg-brand-dark overflow-hidden text-white">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-green/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Column: Form & Intro */}
          <RevealOnScroll className="w-full lg:w-1/2">
            <div className="mb-10">
              <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-sm mb-3 block flex items-center gap-2">
                <Sparkles size={16} /> The Dream Weaver
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-300">Perfect Safari</span>
              </h2>
              <p className="text-gray-300 text-lg font-light leading-relaxed">
                Experience the magic of AI. Tell us your dream, and our digital concierge will craft a bespoke itinerary in seconds, tailored just for you.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {!isVerified ? (
                  <div className="space-y-6 relative z-10">
                      <p className="text-gray-400 text-sm">To access the AI planner, please verify your email.</p>
                      <form onSubmit={handleVerifyEmail} className="space-y-4">
                          <input 
                            type="email" 
                            required 
                            placeholder="your@email.com" 
                            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all"
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                          />
                          {accessError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg">{accessError}</div>}
                          <Button type="submit" className="w-full justify-center mt-4 bg-gradient-to-r from-brand-green to-emerald-800 border-none" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Start Planning'}
                          </Button>
                      </form>
                  </div>
              ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Destination</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g., Maasai Mara, Zanzibar..." 
                          className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                          value={formData.destination} 
                          onChange={e => setFormData({...formData, destination: e.target.value})} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Duration (Days)</label>
                          <input 
                            type="number" min="1" max="30" 
                            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                            value={formData.days} 
                            onChange={e => setFormData({...formData, days: parseInt(e.target.value)})} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Travelers</label>
                          <input 
                            type="number" min="1" 
                            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                            value={formData.travelers} 
                            onChange={e => setFormData({...formData, travelers: parseInt(e.target.value)})} 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                         <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Budget</label>
                            <select 
                              className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange outline-none transition-all appearance-none cursor-pointer"
                              value={formData.budget} 
                              onChange={e => setFormData({...formData, budget: e.target.value as any})}
                            >
                                <option value="Budget" className="text-black">Budget Friendly</option>
                                <option value="Moderate" className="text-black">Moderate</option>
                                <option value="Luxury" className="text-black">Luxury</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Interests</label>
                            <input 
                              type="text" 
                              placeholder="Photography, Culture..." 
                              className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                              value={formData.interests} 
                              onChange={e => setFormData({...formData, interests: e.target.value})} 
                            />
                         </div>
                      </div>
                      
                      <Button type="submit" className="w-full justify-center mt-6 bg-gradient-to-r from-brand-orange to-red-500 hover:from-orange-600 hover:to-red-600 border-none text-white shadow-lg shadow-orange-500/20" disabled={loading}>
                        {loading ? <><Loader2 className="animate-spin" /> Generating Magic...</> : 'Generate Itinerary'}
                      </Button>
                  </form>
              )}
            </div>
          </RevealOnScroll>

          {/* Right Column: Result Display */}
          <RevealOnScroll delay={200} className="w-full lg:w-1/2 min-h-[500px] flex flex-col justify-center items-center relative">
             
             {/* Decor elements for empty state */}
             {!plan && !loading && (
               <div className="text-center opacity-40 animate-pulse-slow">
                  <div className="w-64 h-64 border border-dashed border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                     <Globe className="w-32 h-32 text-white/20" strokeWidth={0.5} />
                     <div className="absolute w-full h-full border-t border-brand-orange/50 rounded-full animate-spin duration-[10s]"></div>
                  </div>
                  <h3 className="text-2xl font-serif font-medium text-gray-400">Your journey awaits...</h3>
               </div>
             )}

             {loading && (
                <div className="text-center space-y-6">
                   <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-brand-orange rounded-full border-t-transparent animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto text-white animate-pulse" />
                   </div>
                   <p className="text-xl font-medium text-brand-orange animate-pulse">Consulting the digital oracle...</p>
                </div>
             )}

             {plan && (
               <div className="w-full bg-white text-gray-900 rounded-3xl shadow-2xl p-8 border-4 border-white/10 animate-fade-in-up relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light rounded-bl-full -mr-10 -mt-10 z-0"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-gray-100 pb-6">
                      <div>
                        <span className="text-brand-green text-xs font-bold uppercase tracking-wider mb-2 block">Your Custom Plan</span>
                        <h3 className="text-3xl font-serif font-bold text-brand-dark leading-tight">{plan.tripTitle}</h3>
                        <p className="text-gray-500 mt-2 text-sm italic">"{plan.summary}"</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                         <div className="bg-brand-dark text-white px-5 py-2 rounded-xl text-center shadow-lg">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Estimated Cost</p>
                            <p className="text-xl font-bold font-mono text-brand-orange">{plan.estimatedCost}</p>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {plan.itinerary.map((day) => (
                        <div key={day.day} className="flex gap-5 group">
                           <div className="flex-col items-center hidden sm:flex">
                              <div className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center font-bold shadow-md transition-opacity z-10">
                                {day.day}
                              </div>
                              <div className="w-0.5 h-full bg-gray-200 -mt-2 -mb-4"></div>
                           </div>
                           <div className="flex-grow bg-gray-50 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-gray-100 group-hover:border-brand-green/30">
                              <div className="flex items-center gap-3 mb-3 sm:hidden">
                                 <span className="bg-brand-green text-white text-xs font-bold px-2 py-1 rounded-full">Day {day.day}</span>
                              </div>
                              <h4 className="font-bold text-lg text-brand-dark mb-3">{day.title}</h4>
                              <ul className="space-y-2">
                                 {day.activities.map((act, idx) => (
                                   <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                      <CheckCircle size={14} className="text-brand-orange mt-0.5 shrink-0" />
                                      <span>{act}</span>
                                   </li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                       <Link to="/contact" state={{ plan: plan, request: formData, customerEmail: email }}>
                          <Button primary className="shadow-xl shadow-brand-green/20">Book This Journey <ArrowRight size={18}/></Button>
                       </Link>
                    </div>
                  </div>
               </div>
             )}
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const { testimonials } = useData();
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];
  
  // Helper to get initials
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
        {/* Background Texture/Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4A5B43 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="container mx-auto px-4 relative z-10">
            <RevealOnScroll>
                <SectionHeading title="Voices of the Wild" subtitle="Stories from travelers who ventured into the unknown with us." />
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {safeTestimonials.map((t, index) => (
                    <RevealOnScroll key={t.id} delay={index * 100}>
                        <div className="bg-white p-8 rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl shadow-xl hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border border-stone-100 relative group h-full flex flex-col">
                            {/* Decorative Quote Icon */}
                            <div className="absolute -top-6 -right-4 bg-brand-orange text-white p-4 rounded-full shadow-lg transition-opacity duration-200">
                                <Quote size={24} fill="currentColor" />
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-1 text-brand-gold mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill={i < t.rating ? "currentColor" : "none"} className={i < t.rating ? "text-brand-gold" : "text-gray-200"} />
                                    ))}
                                </div>
                                <p className="text-gray-700 italic text-lg leading-relaxed font-medium font-serif">
                                    "{t.content}"
                                </p>
                            </div>

                            <div className="mt-auto flex items-center gap-4 pt-6 border-t border-stone-100">
                                <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold text-xl border-2 border-white shadow-md">
                                    {getInitials(t.name)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{t.name}</h4>
                                    <p className="text-brand-green text-xs font-bold uppercase tracking-widest">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>
                ))}
            </div>

            {/* Trust Badges (Simulated) */}
            <RevealOnScroll delay={300}>
                <div className="mt-20 pt-10 border-t border-stone-200/60 text-center">
                    <p className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-6">Trusted By Travelers On</p>
                    <div className="flex justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                        {/* Simulated Logos with text/icons for demo purposes */}
                        <div className="flex items-center gap-2 font-bold text-2xl text-[#00AA6C]"><span className="w-8 h-8 rounded-full bg-[#00AA6C]"></span> TripAdvisor</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-[#4285F4]"><span className="text-2xl">G</span> Google Reviews</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-[#FF5A5F]"><span className="w-8 h-8 rounded-full border-2 border-[#FF5A5F]"></span> Airbnb</div>
                    </div>
                </div>
            </RevealOnScroll>
        </div>
    </section>
  );
};


const FeaturedPackages = () => {
  const { packages } = useData();
  const scrollRef = useRef<HTMLDivElement>(null);

  const featuredPackages = (packages || []).filter(p => p.isFeatured);
  const displayPackages = featuredPackages.length > 0 ? featuredPackages : (packages || []).slice(0, 5);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
  <section className="py-20 bg-white relative overflow-hidden">
    <div className="container mx-auto px-4">
      <RevealOnScroll>
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-green mb-2 font-serif">Featured Experiences</h2>
                <div className="w-24 h-1 bg-brand-orange"></div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => scroll('left')} className="p-2 rounded-full border border-gray-300 hover:bg-brand-green hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={() => scroll('right')} className="p-2 rounded-full border border-gray-300 hover:bg-brand-green hover:text-white transition-colors"><ChevronRight size={20}/></button>
            </div>
        </div>
      </RevealOnScroll>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayPackages.map((pkg) => (
            <div key={pkg.id} className="min-w-[300px] md:min-w-[350px] lg:min-w-[400px] snap-start">
                <PackageCard pkg={pkg} />
            </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link to="/tours">
          <button className="px-8 py-3 rounded-full font-semibold transition-all duration-300 border-2 border-brand-green text-brand-green bg-transparent hover:bg-brand-green hover:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5">
            View All Packages
          </button>
        </Link>
      </div>
    </div>
  </section>
  );
};

const PopularDestinations = () => {
  const { destinations } = useData();
  const scrollRef = useRef<HTMLDivElement>(null);

  const featuredDestinations = (destinations || []).filter(d => d.isFeatured);
  const displayDestinations = featuredDestinations.length > 0 ? featuredDestinations : (destinations || []).slice(0, 5);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-4">
      <RevealOnScroll>
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-green mb-2 font-serif">Trending Destinations</h2>
                <div className="w-24 h-1 bg-brand-orange"></div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => scroll('left')} className="p-2 rounded-full border border-gray-300 hover:bg-brand-green hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={() => scroll('right')} className="p-2 rounded-full border border-gray-300 hover:bg-brand-green hover:text-white transition-colors"><ChevronRight size={20}/></button>
            </div>
        </div>
      </RevealOnScroll>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayDestinations.map((dest) => (
            <div key={dest.id} className="min-w-[280px] md:min-w-[320px] lg:min-w-[380px] snap-start">
              <DestinationCard destination={dest} />
            </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link to="/destinations" className="text-brand-green font-semibold hover:text-brand-orange flex items-center justify-center gap-2 hover:gap-3 transition-all">
          Explore All Destinations <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
  );
};

const LatestPosts = () => {
    const { posts } = useData();
    const recentPosts = (posts || [])
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

    if (recentPosts.length === 0) return null;

    return (
        <section className="py-20 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <RevealOnScroll>
                    <SectionHeading title="Travel Insights" subtitle="Stories, tips, and guides from our experts" />
                </RevealOnScroll>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recentPosts.map((post, idx) => (
                        <RevealOnScroll key={post.id} delay={idx * 100}>
                            <Link to={`/blog/${post.slug}`} className="group block h-full">
                                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-opacity duration-300" />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-green shadow-sm">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-brand-orange transition-colors line-clamp-2">{post.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                                        <div className="mt-auto flex items-center text-brand-green font-semibold text-sm">
                                            Read Article <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
};

const AboutUsSection = () => {
  const { settings } = useData();
  const about = settings.aboutUsSection;

  if (!about) return null; // Or a loading/fallback component

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <RevealOnScroll>
            <div className="relative h-[500px] flex items-center justify-center">
              {/* Image 1 (Back, Angled) */}
              <div className="absolute w-[60%] h-[70%] top-0 left-0 bg-white p-3 rounded-2xl shadow-xl transform -rotate-12 transition-transform duration-300 hover:rotate-0">
                <img 
                  src={about.image1_url} 
                  alt="Safari adventure" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e: any) => e.target.src = 'https://placehold.co/800x600?text=Image+1'}
                />
              </div>
              {/* Image 2 (Front, Straight) */}
              <div className="relative w-[70%] h-[80%] bg-white p-4 rounded-2xl shadow-2xl transition-opacity duration-300 z-10">
                <img 
                  src={about.image2_url} 
                  alt="Zebras in the wild" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e: any) => e.target.src = 'https://placehold.co/800x600?text=Image+2'}
                />
              </div>
              
              {/* Reviews floating element */}
              <div className="absolute top-1/4 right-4 md:-right-10 lg:-right-16 z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-4 animate-fade-in-up">
                <div className="flex -space-x-4">
                  <img src="https://i.pravatar.cc/40?img=1" alt="Reviewer 1" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  <img src="https://i.pravatar.cc/40?img=2" alt="Reviewer 2" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-orange text-white flex items-center justify-center font-bold text-sm">+</div>
                </div>
                <div>
                  <p className="font-bold text-brand-dark flex items-center gap-1">{about.review_rating} <Star size={14} className="text-brand-gold" fill="currentColor"/></p>
                  <p className="text-xs text-gray-500">{about.review_count}</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Text Column */}
          <RevealOnScroll delay={200}>
            <p className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-3">{about.pre_title}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark font-serif mb-6 leading-tight">
              {about.title}
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-brand-green font-semibold">
              <span className="flex items-center gap-2"><Check className="text-brand-orange"/> {about.feature1}</span>
              <span className="flex items-center gap-2"><Check className="text-brand-orange"/> {about.feature2}</span>
              <span className="flex items-center gap-2"><Check className="text-brand-orange"/> {about.feature3}</span>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {about.paragraph1}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {about.paragraph2}
            </p>
            <Link to={about.button_link || '/about'}>
              <Button primary={false} className="bg-brand-orange hover:bg-orange-600">{about.button_text}</Button>
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};


// --- Pages ---

const HomePage = () => {
  // Helper to get initials for avatar
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);
  const { testimonials, settings, destinations, packages } = useData();
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);
  const imagesToLoad = useRef<string[]>([]);
  const totalImagesToLoad = useRef(0);

  // Collect images to load
  useEffect(() => {
    const images: string[] = [];
    
    // Hero fallback image
    const hero = settings.hero;
    if (hero && hero.fallbackImage) images.push(hero.fallbackImage);
    
    // First 3 destination images
    const firstDestinations = (destinations || []).slice(0, 3);
    firstDestinations.forEach(dest => {
      if (dest.image) images.push(dest.image);
    });
    
    // First 3 package images
    const firstPackages = (packages || []).slice(0, 3);
    firstPackages.forEach(pkg => {
      const pkgImages = (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) 
        ? pkg.images 
        : (pkg.image ? [pkg.image] : []);
      if (pkgImages.length > 0) images.push(pkgImages[0]);
    });
    
    imagesToLoad.current = images;
    totalImagesToLoad.current = images.length;
    
    if (images.length === 0) {
      setImagesLoaded(true);
      return;
    }
    
    // Load images
    let loaded = 0;
    images.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        setLoadedImagesCount(loaded);
        if (loaded === images.length) {
          setTimeout(() => setImagesLoaded(true), 300);
        }
      };
      img.onerror = () => {
        loaded++;
        setLoadedImagesCount(loaded);
        if (loaded === images.length) {
          setTimeout(() => setImagesLoaded(true), 300);
        }
      };
      img.src = src;
    });
  }, [settings, destinations, packages]);

  if (!imagesLoaded) {
    return <Loader />;
  }

  return (
    <>
      <Hero />
      <PopularDestinations />
      <AboutUsSection />
      <FeaturedPackages />
      <AITripPlanner />
      <LatestPosts />
      <TestimonialsSection />
    </>
  );
};

const FaqPage = () => {
  const { faqs } = useData();
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <RevealOnScroll>
          <SectionHeading title="Frequently Asked Questions" subtitle="Find answers to common questions about our services, booking process, and travel policies." />
        </RevealOnScroll>
        <div className="space-y-4">
          {safeFaqs.map((faq, index) => (
            <RevealOnScroll key={faq.id} delay={index * 50}>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <button
                  className={`w-full flex justify-between items-center p-5 text-left transition-colors duration-300 ${openFaq === index ? 'bg-brand-green text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-lg">{faq.question}</span>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
          {safeFaqs.length === 0 && (
            <p className="text-center text-gray-500 py-10">No FAQs have been added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};


const AboutPage = () => {
  const { settings, faqs } = useData();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const safeFaqs = Array.isArray(faqs) ? faqs.slice(0, 4) : [];
  const about = settings.about;
  const header = settings.pageHeaders?.about || {
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1920&q=80',
    title: 'About Us',
    subtitle: 'The story behind the journeys.'
  };

  return (
    <div className="bg-white">
      {/* Dynamic Header */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src={header.image} 
          alt={header.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 animate-fade-in-up">{header.title}</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light animate-fade-in-up delay-100">{header.subtitle}</p>
        </div>
      </div>

      <div className="py-20">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <SectionHeading title={about.title} subtitle={about.subtitle} />
        </RevealOnScroll>
        <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
          <RevealOnScroll className="w-full md:w-1/2">
            <img src={about.imageUrl} alt="Our Team" className="rounded-xl shadow-xl border-4 border-brand-light transition-opacity duration-300" />
          </RevealOnScroll>
          <RevealOnScroll delay={200} className="w-full md:w-1/2">
            <p className="text-gray-600 mb-4 leading-relaxed text-lg">
              {about.paragraph1}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
              {about.paragraph2}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-brand-light p-6 rounded-xl text-center border-l-4 border-brand-orange shadow-sm">
                <h4 className="text-4xl font-bold text-brand-orange mb-1">{about.stat1_value}</h4>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{about.stat1_label}</p>
              </div>
              <div className="bg-brand-light p-6 rounded-xl text-center border-l-4 border-brand-green shadow-sm">
                <h4 className="text-4xl font-bold text-brand-green mb-1">{about.stat2_value}</h4>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{about.stat2_label}</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-brand-dark font-serif mb-3">Frequently Asked Questions</h3>
              <p className="text-gray-500">A few of our most common questions.</p>
            </div>
          </RevealOnScroll>
          
          <div className="space-y-4">
            {safeFaqs.map((faq, index) => (
              <RevealOnScroll key={faq.id} delay={index * 100}>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  <button
                    className={`w-full flex justify-between items-center p-5 text-left transition-colors duration-300 ${openFaq === index ? 'bg-brand-green text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-bold text-lg">{faq.question}</span>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-6 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={300}>
            <div className="text-center mt-8">
              <Link to="/faq" className="font-semibold text-brand-green hover:underline">
                See All FAQs &rarr;
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ service }: { service: Service }) => {
  return (
    <Link to={`/services/${service.id}`} className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
      <div className="relative h-96">
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-full object-cover transition-opacity duration-300" 
          onError={(e: any) => e.target.src = 'https://placehold.co/800x600?text=Service'} 
        />
        
        {/* Main overlay with content */}
        <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="bg-black/70 rounded-xl p-5 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-black/80">
                <h3 className="text-2xl font-bold font-serif mb-2 truncate">{service.title}</h3>
                <p className="text-sm text-gray-200 mb-4 line-clamp-2 h-10">{service.description}</p>
                <div className="border-t border-dashed border-white/30 pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-brand-gold flex items-center gap-2">
                        <ServiceIcon type={service.iconName || 'Tours'} className="w-4 h-4 text-brand-gold" />
                        Service
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                        Learn More <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
};

const ServicesPage = () => {
  const { services, settings } = useData();
  const safeServices = Array.isArray(services) ? services : [];
  const header = settings.pageHeaders?.services || {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
    title: 'Our Services',
    subtitle: 'Comprehensive travel solutions tailored for you.'
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src={header.image} 
          alt={header.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 animate-fade-in-up">{header.title}</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light animate-fade-in-up delay-100">{header.subtitle}</p>
        </div>
      </div>

      <div className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeServices.map((s, idx) => (
            <RevealOnScroll key={s.id} delay={idx * 100}>
              <ServiceCard service={s} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const { services, addBooking } = useData();
  const safeServices = Array.isArray(services) ? services : [];
  const service = safeServices.find(s => s.id === id);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  if (!service) return <div className="p-20 text-center">Service not found. <Link to="/services" className="text-brand-green underline">View all services</Link></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    const success = await addBooking({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      serviceType: 'Service', // Correctly categorize the booking type
      itemName: service.title, // Use the service title as the specific item name
      travelDate: date,
      status: 'New',
      notes: notes
    });

    if (success) {
      setSubmitStatus('success');
    } else {
      setSubmitStatus('idle'); // Reset form on failure
      alert('Sorry, there was an error submitting your request. Please try again or contact us directly.');
    }
  };

  // Robust markdown-like parser that correctly handles lists
  const renderDescription = (text?: string) => {
    if (!text) return <p>No details available.</p>;

    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-4 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-600 leading-relaxed">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    text.split('\n').forEach((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('**')) {
        flushList();
        elements.push(<h4 key={i} className="font-bold text-lg mt-4 mb-2 text-gray-800">{trimmedLine.replace(/\*\*/g, '')}</h4>);
      } else if (trimmedLine.startsWith('- ')) {
        listItems.push(trimmedLine.substring(2).trim());
      } else {
        flushList();
        if (trimmedLine) {
            elements.push(<p key={i} className="mb-3 text-gray-600 leading-relaxed">{trimmedLine}</p>);
        }
      }
    });

    flushList(); // Flush any remaining list items
    return elements;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
       {/* Hero */}
       <div className="relative h-[50vh] w-full animate-fade-in">
          <img src={service.image} alt={service.title} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/1200x600?text=Service'} />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
             <div className="text-center text-white px-4 max-w-4xl">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold border border-white/20 animate-bounce-slow">
                   <ServiceIcon type={service.iconName || 'Tours'} className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">{service.title}</h1>
                <p className="text-xl text-gray-200">{service.description}</p>
             </div>
          </div>
       </div>

       <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
             {/* Content */}
             <div className="w-full lg:w-2/3">
                <RevealOnScroll>
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                     <h2 className="text-2xl font-bold text-brand-green mb-6 border-b pb-4">Service Details</h2>
                     <div className="prose max-w-none text-gray-600">
                        {renderDescription(service.fullDescription)}
                     </div>
                  </div>
                </RevealOnScroll>
                
                {/* Why Choose Us Block */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                   <RevealOnScroll delay={100} className="bg-brand-light p-6 rounded-xl text-center">
                      <ShieldCheck className="w-10 h-10 mx-auto text-brand-orange mb-4" />
                      <h3 className="font-bold mb-2">Reliable & Safe</h3>
                      <p className="text-sm text-gray-600">Trusted by thousands of travelers.</p>
                   </RevealOnScroll>
                   <RevealOnScroll delay={200} className="bg-brand-light p-6 rounded-xl text-center">
                      <Clock className="w-10 h-10 mx-auto text-brand-orange mb-4" />
                      <h3 className="font-bold mb-2">Timely Service</h3>
                      <p className="text-sm text-gray-600">We respect your time and schedule.</p>
                   </RevealOnScroll>
                   <RevealOnScroll delay={300} className="bg-brand-light p-6 rounded-xl text-center">
                      <Users className="w-10 h-10 mx-auto text-brand-orange mb-4" />
                      <h3 className="font-bold mb-2">Expert Team</h3>
                      <p className="text-sm text-gray-600">Professionals dedicated to your needs.</p>
                   </RevealOnScroll>
                </div>
             </div>

             {/* Booking Form */}
             <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-xl shadow-xl p-8 sticky top-24 border-t-4 border-brand-green animate-fade-in">
                   <h3 className="text-xl font-bold mb-2">Enquire Now</h3>
                   <p className="text-sm text-gray-500 mb-6">Fill out the form below to get a quote or book this service.</p>

                   {submitStatus === 'success' ? (
                      <div className="text-center py-8">
                         <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                           <CheckCircle size={32} />
                         </div>
                         <h3 className="text-xl font-bold text-green-800 mb-2">Request Sent!</h3>
                         <p className="text-gray-600 text-sm mb-6">
                           We have received your enquiry for <span className="font-bold">{service.title}</span>. Our team will contact you shortly.
                         </p>
                         <button onClick={() => { setSubmitStatus('idle'); setName(''); setNotes(''); }} className="text-brand-green font-bold text-sm hover:underline">
                           Send another enquiry
                         </button>
                      </div>
                   ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                           <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                           <input 
                             type="text" required 
                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
                             value={name} onChange={e => setName(e.target.value)}
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                           <input 
                             type="tel" required 
                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
                             value={phone} onChange={e => setPhone(e.target.value)}
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                           <input 
                             type="email" required 
                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
                             value={email} onChange={e => setEmail(e.target.value)}
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Preferred Date (Optional)</label>
                           <input 
                             type="date" 
                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
                             value={date} onChange={e => setDate(e.target.value)}
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Additional Details / Requirements</label>
                           <textarea 
                             rows={4}
                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
                             value={notes} onChange={e => setNotes(e.target.value)}
                             placeholder="Tell us more about what you need..."
                           ></textarea>
                         </div>
                         <Button primary type="submit" className="w-full justify-center" disabled={submitStatus === 'submitting'}>
                            {submitStatus === 'submitting' ? <><Loader2 className="animate-spin" /> Sending...</> : 'Send Enquiry'}
                         </Button>
                      </form>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const ToursPage = () => {
  const { packages, settings } = useData();
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Safari', 'Honeymoon', 'Family', 'International'];
  const header = settings.pageHeaders?.tours || {
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
    title: 'Safari Packages',
    subtitle: 'Curated itineraries for the ultimate adventure.'
  };
  
  const safePackages = Array.isArray(packages) ? packages.filter(p => p) : [];

  const filteredPackages = filter === 'All' ? safePackages : safePackages.filter(p => p && p.type === filter);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src={header.image} 
          alt={header.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 animate-fade-in-up">{header.title}</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light animate-fade-in-up delay-100">{header.subtitle}</p>
        </div>
      </div>

      <div className="py-24">
      <div className="container mx-auto px-4">
        
        {/* Filter Bar */}
        <RevealOnScroll className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat 
                ? 'bg-brand-green text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg, index) => (
            <RevealOnScroll key={pkg.id} delay={index * 100}>
               <PackageCard pkg={pkg} />
            </RevealOnScroll>
          ))}
        </div>
        {filteredPackages.length === 0 && <p className="text-center text-gray-500 italic mt-10">No packages found in this category.</p>}
      </div>
      </div>
    </div>
  );
};

const PackageDetailsPage = () => {
  const { id } = useParams();
  const { packages, addBooking, settings } = useData();

  const safePackages = Array.isArray(packages) ? packages : [];
  const pkg = safePackages.find(p => p && p.id === id);

  // New Detailed Form State
  const [resAdults, setResAdults] = useState(0);
  const [nonResAdults, setNonResAdults] = useState(0);
  const [resKids, setResKids] = useState(0);
  const [nonResKids, setNonResKids] = useState(0);
  const [kidAges, setKidAges] = useState('');
  const [nights, setNights] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [prefMonth, setPrefMonth] = useState('');

  // Basic Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Carousel State
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    // Calculate total travelers
    const totalTravelers = resAdults + nonResAdults + resKids + nonResKids;
    const finalTravelers = totalTravelers > 0 ? totalTravelers : 1; // Default to 1 if not filled correctly

    // Construct structured notes for CRM
    const structuredNotes = {
        structured: {
            resAdults,
            nonResAdults,
            resKids,
            nonResKids,
            kidAges,
            nights,
            rooms,
            prefMonth
        },
        userNotes: "" // Can add a specific user notes field later if needed
    };

    await addBooking({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      serviceType: 'Package',
      itemName: pkg?.title,
      travelDate: date || prefMonth, // Use preferred month if date not picked
      travelers: finalTravelers,
      totalPrice: pkg?.hidePrice ? undefined : (pkg?.price || 0) * finalTravelers,
      status: 'New',
      notes: JSON.stringify(structuredNotes) // Store detailed info in notes field as JSON
    });
    
    setSubmitStatus('success');
  };

  if (!pkg) return <div className="p-20 text-center text-xl">Package not found. <Link to="/tours" className="text-brand-green underline">Return to Tours</Link></div>;

  const totalGuests = resAdults + nonResAdults + resKids + nonResKids;
  const totalPrice = (pkg.price || 0) * (totalGuests || 1); // Basic calculation

  // Robust image extraction
  const rawImages = (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0)
    ? pkg.images
    : (pkg.image ? [pkg.image] : []);

  const images = rawImages.filter(url => url && url.trim() !== '');
  if (images.length === 0) images.push('https://placehold.co/800x600?text=No+Image');

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImgIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const nextImage = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
       {/* Responsive Height Carousel Hero */}
       <div className="relative h-[70vh] w-full overflow-hidden bg-black group">
          {images.map((img, idx) => (
             <div
               key={idx}
               className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${idx === currentImgIndex ? 'opacity-100' : 'opacity-0'}`}
             >
                <img src={img} alt={pkg.title} className="w-full h-full object-cover" />
                {/* Cinematic Gradient Overlay - Stronger at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
             </div>
          ))}

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm p-3 rounded-full transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft size={32} />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm p-3 rounded-full transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={32} />
              </button>
              <div className="absolute bottom-12 left-0 w-full flex justify-center gap-2 z-20">
                 {images.map((_, idx) => (
                   <button key={idx} onClick={() => setCurrentImgIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-brand-orange w-8' : 'bg-white/50'}`} />
                 ))}
              </div>
            </>
          )}

          {/* Hero Content Centered */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
             <div className="text-center text-white px-4 max-w-4xl animate-fade-in-up pointer-events-auto">
                <span className="inline-block bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow-lg">{pkg.type} Experience</span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight drop-shadow-2xl">{pkg.title}</h1>
                <div className="flex justify-center items-center gap-6 text-lg font-medium text-gray-200 backdrop-blur-sm bg-black/20 inline-flex px-6 py-2 rounded-full border border-white/10">
                   <span className="flex items-center gap-2"><MapPin size={20} className="text-brand-orange" /> {pkg.destination}</span>
                   <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                   <span className="flex items-center gap-2"><Clock size={20} className="text-brand-orange" /> {pkg.duration}</span>
                </div>
             </div>
          </div>
       </div>

       <div className="container mx-auto px-4 -mt-20 relative z-20">
         <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Main Content (Left) */}
            <div className="w-full lg:w-2/3 space-y-8">
               
               {/* Overview Card */}
               <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-brand-dark font-serif">Trip Overview</h2>
                      <div className="flex items-center gap-1 text-brand-gold bg-brand-light px-3 py-1 rounded-lg">
                          <Star size={16} fill="currentColor" />
                          <span className="font-bold text-brand-dark">{pkg.rating}</span>
                      </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">{pkg.description}</p>
                  
                  {/* Highlights */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
                      {[
                          { icon: ShieldCheck, label: 'Secure', sub: 'Verified' },
                          { icon: Users, label: 'Small Group', sub: 'Max 6' },
                          { icon: UserCheck, label: 'Expert Guide', sub: 'Certified' },
                          { icon: Calendar, label: 'Flexible', sub: 'Cancellation' }
                      ].map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center text-center">
                              <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-green mb-2">
                                  <item.icon size={20} />
                              </div>
                              <span className="font-bold text-sm text-gray-800">{item.label}</span>
                              <span className="text-xs text-gray-500">{item.sub}</span>
                          </div>
                      ))}
                  </div>
               </div>

               {/* Visual Itinerary Timeline */}
               <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-brand-dark font-serif mb-8">Your Journey</h2>
                  <div className="relative pl-4 md:pl-8 border-l-2 border-brand-light space-y-12">
                     {pkg.detailedItinerary && pkg.detailedItinerary.map((day, idx) => (
                       <div key={day.day} className="relative group">
                         <div className="absolute -left-[25px] md:-left-[41px] top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-brand-green flex items-center justify-center shadow-md z-10 transition-opacity">
                           <span className="text-xs font-bold text-brand-green">{day.day}</span>
                         </div>
                         <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{day.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">{day.description}</p>
                         </div>
                       </div>
                     ))}
                     {(!pkg.detailedItinerary || pkg.detailedItinerary.length === 0) && (
                        <p className="text-gray-500 italic">Detailed itinerary available upon request.</p>
                     )}
                  </div>
               </div>

               {/* Inclusions */}
               <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                   <h2 className="text-2xl font-bold text-brand-dark font-serif mb-6">What's Included</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-green-50/50 rounded-xl p-6 border border-green-100">
                        <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg">
                            <CheckCircle size={20} className="fill-green-200 text-green-700" /> Included
                        </h4>
                        <ul className="space-y-3">
                          {pkg.inclusions && pkg.inclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <Check size={16} className="text-green-600 mt-0.5 shrink-0" strokeWidth={3} /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50/50 rounded-xl p-6 border border-red-100">
                        <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-lg">
                            <XCircle size={20} className="fill-red-200 text-red-700" /> Not Included
                        </h4>
                        <ul className="space-y-3">
                          {pkg.exclusions && pkg.exclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <X size={16} className="text-red-500 mt-0.5 shrink-0" strokeWidth={3} /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                   </div>
               </div>
            </div>

            {/* Sticky Booking Sidebar (Right) */}
            <div className="w-full lg:w-1/3" id="booking-section">
               <div className="sticky top-24 space-y-6">
                  {/* Price Card */}
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
                      {/* Decorative Header Pattern */}
                      <div className="h-3 bg-gradient-to-r from-brand-green to-brand-orange"></div>
                      <div className="p-6 pb-0">
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-1">Total Price from</p>
                          {pkg.hidePrice ? (
                               <p className="text-3xl font-bold text-brand-dark">Contact Us</p>
                          ) : (
                               <div className="flex items-baseline gap-1">
                                   <span className="text-sm font-bold text-brand-orange">KES</span>
                                   <span className="text-4xl font-bold text-brand-dark font-serif">{(Number(pkg.price) || 0).toLocaleString()}</span>
                                   <span className="text-gray-400 text-sm">/ person</span>
                               </div>
                          )}
                      </div>

                      <div className="p-6">
                          {submitStatus === 'success' ? (
                            <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
                              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                              </div>
                              <h3 className="text-xl font-bold text-green-800 mb-2">Request Received!</h3>
                              <p className="text-green-700 text-sm mb-6 px-4">
                                Thank you, {name}. We'll contact you at {phone} shortly.
                              </p>
                              <button onClick={() => setSubmitStatus('idle')} className="text-brand-green font-bold text-sm hover:underline">
                                Book another
                              </button>
                            </div>
                          ) : (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                              {/* Detailed Booking Fields */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                  <label className="block text-xs font-bold text-gray-500 uppercase">Guest Details</label>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div>
                                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Res Adult</label>
                                          <input type="number" min="0" value={resAdults} onChange={e => setResAdults(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded-md text-sm text-center font-bold" />
                                      </div>
                                      <div>
                                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Non-Res Adult</label>
                                          <input type="number" min="0" value={nonResAdults} onChange={e => setNonResAdults(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded-md text-sm text-center font-bold" />
                                      </div>
                                      <div>
                                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Res Kid</label>
                                          <input type="number" min="0" value={resKids} onChange={e => setResKids(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded-md text-sm text-center font-bold" />
                                      </div>
                                      <div>
                                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Non-Res Kid</label>
                                          <input type="number" min="0" value={nonResKids} onChange={e => setNonResKids(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded-md text-sm text-center font-bold" />
                                      </div>
                                  </div>
                                  {(resKids > 0 || nonResKids > 0) && (
                                      <div>
                                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Kid Ages (comma separated)</label>
                                          <input type="text" placeholder="e.g. 5, 8, 12" value={kidAges} onChange={e => setKidAges(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                                      </div>
                                  )}
                              </div>

                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                  <label className="block text-xs font-bold text-gray-500 uppercase">Trip Details</label>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div>
                                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Nights</label>
                                          <input type="number" min="1" value={nights} onChange={e => setNights(parseInt(e.target.value) || 1)} className="w-full p-2 border rounded-md text-sm text-center font-bold" />
                                      </div>
                                      <div>
                                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Rooms</label>
                                          <input type="number" min="1" value={rooms} onChange={e => setRooms(parseInt(e.target.value) || 1)} className="w-full p-2 border rounded-md text-sm text-center font-bold" />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] text-gray-500 font-bold block mb-1">Preferred Safari Month</label>
                                      <select value={prefMonth} onChange={e => setPrefMonth(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white">
                                          <option value="">Select Month...</option>
                                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="text-[10px] text-gray-500 font-bold block mb-1">Preferred Start Date (Optional)</label>
                                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white" />
                                  </div>
                              </div>
                              
                              <input type="text" required placeholder="Full Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" onChange={(e) => setName(e.target.value)} />
                              <input type="tel" required placeholder="Phone Number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" onChange={(e) => setPhone(e.target.value)} />
                              <input type="email" required placeholder="Email Address" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" onChange={(e) => setEmail(e.target.value)} />

                              {!pkg.hidePrice && (
                                  <div className="flex justify-between items-center pt-2 text-sm">
                                    <span className="text-gray-500">Total Estimated</span>
                                    <span className="font-bold text-lg text-brand-dark">KES {(totalPrice * nights).toLocaleString()}</span>
                                  </div>
                              )}

                              <button type="submit" disabled={submitStatus === 'submitting'} className="w-full bg-brand-green text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-green/30 hover:bg-green-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                {submitStatus === 'submitting' ? <Loader2 className="animate-spin" /> : 'Send Booking Request'}
                              </button>
                              <p className="text-[10px] text-center text-gray-400">No payment required to submit request.</p>
                            </form>
                          )}
                      </div>
                  </div>

                  {/* Support Card */}
                  <div className="bg-brand-dark text-white p-6 rounded-2xl shadow-lg flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-brand-orange shrink-0">
                          <Phone size={24} />
                      </div>
                      <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Questions?</p>
                          <p className="font-bold text-lg leading-none">{settings.phone[0]}</p>
                          <p className="text-xs text-gray-400 mt-1">Available 24/7</p>
                      </div>
                  </div>
               </div>
            </div>

         </div>
       </div>
    </div>
  );
};

const DestinationDetailsPage = () => {
  const { id } = useParams();
  const { destinations, packages } = useData();
  
  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  const safePackages = Array.isArray(packages) ? packages : [];

  const destination = safeDestinations.find(d => d && d.id === id);
  const [activeTab, setActiveTab] = useState<'packages' | 'guide'>('packages');
  const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  
  // No more useState/useEffect for insights - use the persisted data
  const insights = destination?.insight;

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        setIsSticky(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!destination) return <div className="p-20 text-center">Destination not found</div>;

  // Case-insensitive matching for destination linking
  const relatedPackages = safePackages.filter(pkg => 
    pkg && (pkg.destination?.trim().toLowerCase() === destination.name.trim().toLowerCase() || 
    pkg.title.toLowerCase().includes(destination.name.toLowerCase()))
  );

  // Enhanced Content Renderer
  const renderContent = (content: string) => {
    const sections = content.split('##').filter(s => s.trim());
    return sections.map((section, idx) => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      const body = lines.slice(1).join('\n').trim();

      let Icon = Info;
      let colorClass = "text-brand-green";
      if (title.toLowerCase().includes('time')) { Icon = Calendar; colorClass = "text-orange-500"; }
      else if (title.toLowerCase().includes('attraction')) { Icon = Camera; colorClass = "text-blue-500"; }
      else if (title.toLowerCase().includes('culture') || title.toLowerCase().includes('tip')) { Icon = BookOpen; colorClass = "text-green-600"; }
      else if (title.toLowerCase().includes('weather')) { Icon = Sun; colorClass = "text-yellow-500"; }
      else { Icon = Landmark; }

      const formatBody = (text: string) => {
        const textLines = text.split('\n');
        return textLines.map((line, i) => {
          if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
             const cleanLine = line.trim().substring(1).trim();
             const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
             return (
               <li key={i} className="flex items-start gap-3 mb-3 text-gray-700 text-base leading-relaxed group">
                  <span className={`mt-2 w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0 transition-opacity`}></span>
                  <span>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                  </span>
               </li>
             );
          }
           if (line.trim() === "") return null;
           const parts = line.split(/(\*\*.*?\*\*)/g);
           return (
             <p key={i} className="mb-4 text-gray-600 text-base leading-relaxed">
               {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
             </p>
           );
        });
      };

      return (
        <div key={idx} className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 bg-white rounded-xl shadow-sm border border-gray-100 ${colorClass}`}>
               <Icon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 font-serif">{title.trim()}</h3>
          </div>
          <div className="pl-2 md:pl-4 border-l-2 border-gray-100 ml-5">
             {title.toLowerCase().includes('attraction') || title.toLowerCase().includes('tip') 
                ? <ul className="space-y-1">{formatBody(body)}</ul> 
                : <div>{formatBody(body)}</div>
             }
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* Parallax Hero - FIXED to Absolute for Stability */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full">
            <img 
              src={destination.image} 
              alt={destination.name} 
              className="w-full h-full object-cover transition-opacity duration-300" 
              onError={(e: any) => e.target.src = 'https://placehold.co/1200x600?text=Destination'} 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-16 z-10 pb-24 md:pb-32"> {/* Added padding bottom to push text up slightly */}
            <div className="container mx-auto">
                <div className="max-w-4xl">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 drop-shadow-lg animate-fade-in-up leading-tight">
                        {destination.name}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 font-light animate-fade-in-up delay-100 line-clamp-2 md:line-clamp-none">
                        {destination.description}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 container mx-auto px-4 -mt-20 md:-mt-24">
         <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left Content Area (Packages & Guide) */}
            <div className="w-full lg:w-2/3 order-2 lg:order-1">
                {/* Tabs & Content Box */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
                    {/* Tab Header */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50">
                        <button
                          onClick={() => setActiveTab('packages')}
                          className={`flex-1 py-4 md:py-6 font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all ${activeTab === 'packages' ? 'bg-white text-brand-green border-t-4 border-brand-green shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          <PackageIcon size={18} /> <span>Packages ({relatedPackages.length})</span>
                        </button>
                        <div className="w-px bg-gray-200"></div>
                        <button
                          onClick={() => setActiveTab('guide')}
                          className={`flex-1 py-4 md:py-6 font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all ${activeTab === 'guide' ? 'bg-white text-brand-green border-t-4 border-brand-green shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          <Sparkles size={18} /> <span>AI Travel Guide</span>
                        </button>
                    </div>

                    <div className="p-6 md:p-10">
                        {activeTab === 'packages' && (
                           <div className="animate-fade-in">
                             {relatedPackages.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8">
                                  {relatedPackages.map((pkg, index) => (
                                    <RevealOnScroll key={pkg.id} delay={index * 100}>
                                       <div className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                                          <PackageCard pkg={pkg} />
                                       </div>
                                    </RevealOnScroll>
                                  ))}
                                </div>
                             ) : (
                                <div className="text-center py-16">
                                   <CalendarHeart className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                                   <h3 className="text-2xl font-bold text-gray-400 mb-2">No packages found</h3>
                                   <p className="text-gray-400 mb-8">We can create a custom itinerary for you.</p>
                                   <Link to="/contact"><Button primary>Plan Custom Trip</Button></Link>
                                </div>
                             )}
                           </div>
                        )}

                        {activeTab === 'guide' && (
                           <div className="animate-fade-in">
                              {insights ? (
                                <>
                                  <div className="prose max-w-none">
                                     {renderContent(insights.content)}
                                  </div>
                                  <div className="mt-12 pt-8 border-t border-gray-100">
                                     <h5 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                       <ExternalLink size={14} /> Verified Sources
                                     </h5>
                                     <div className="flex flex-wrap gap-3">
                                       {insights.sources?.map((source, i) => (
                                         <a key={i} href={source.url} target="_blank" rel="noreferrer" className="text-xs bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-brand-green hover:text-white transition-colors truncate max-w-[250px]">
                                           {source.title || "Source Link"}
                                         </a>
                                       ))}
                                     </div>
                                  </div>
                                </>
                              ) : (
                                 <div className="text-center py-16">
                                     <Sparkles className="w-16 h-16 text-brand-orange mx-auto mb-4 animate-pulse" />
                                     <p className="text-xl font-serif font-bold text-gray-600">Generating Magic...</p>
                                     <p className="text-gray-400">Guide content is not available yet.</p>
                                 </div>
                              )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Quick Facts) */}
            <div className="w-full lg:w-1/3 order-1 lg:order-2">
                <div className="sticky top-24 space-y-6">
                    {/* Quick Facts Card */}
                    <div className="bg-brand-dark text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="text-2xl font-serif font-bold mb-6 relative z-10">Quick Facts</h3>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Known For</p>
                                <p className="font-medium text-lg leading-snug">{destination.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Best Time</p>
                                    <p className="font-bold text-brand-orange">June - Oct</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Ideal Stay</p>
                                    <p className="font-bold text-brand-orange">3 - 5 Days</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <Link to="/contact" className="flex items-center justify-between group">
                                <span className="font-bold">Plan a Trip Here</span>
                                <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center transition-opacity">
                                    <ArrowRight size={16} />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Need Help Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
                        <div className="w-14 h-14 rounded-full bg-brand-light mx-auto flex items-center justify-center text-brand-green mb-4">
                            <Phone size={24} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Expert Advice</h4>
                        <p className="text-gray-500 text-sm mb-6">Talk to our local experts to plan your perfect {destination.name} experience.</p>
                        <Link to="/contact">
                            <button className="w-full py-3 rounded-xl border-2 border-brand-green text-brand-green font-bold hover:bg-brand-green hover:text-white transition-colors">
                                Contact Us
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

         </div>
      </div>
    </div>
  );
};

const CreativeDestinationCard: React.FC<{ destination: Destination; size?: "normal" | "large" | "wide" }> = ({ destination, size = "normal" }) => {
  const { packages } = useData();
  
  // Dynamic calculation of packages for this destination
  const packageCount = packages 
    ? packages.filter(p => p && p.destination && p.destination.trim().toLowerCase() === destination.name.trim().toLowerCase()).length 
    : 0;

  // Helper to allow "wide" or "large" cards in Bento Grid
  let gridClass = "";
  if (size === "large") gridClass = "md:col-span-2 md:row-span-2";
  else if (size === "wide") gridClass = "md:col-span-2";
  
  return (
    <Link 
      to={`/destinations/${destination.id}`} 
      className={`group relative block rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${gridClass} min-h-[300px]`}
    >
      <img 
        src={destination.image} 
        alt={destination.name} 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
        onError={(e: any) => e.target.src = 'https://placehold.co/800x600?text=Destination'} 
      />
      
      {/* Gradient Overlay - Always visible but deepens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        {/* Floating Tag - Visible on Hover */}
        <div className="absolute -top-12 left-8 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
           <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30 flex items-center gap-2">
              <PackageIcon size={12} /> {packageCount} Packages
           </span>
        </div>

        <h3 className={`${size === 'large' ? 'text-3xl md:text-5xl' : 'text-2xl'} font-serif font-bold mb-2 drop-shadow-md`}>
          {destination.name}
        </h3>
        
        <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-300 ease-in-out">
           <p className="text-gray-200 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
             {destination.description}
           </p>
        </div>

        <div className="flex items-center gap-2 text-brand-orange font-bold text-sm tracking-widest uppercase group-hover:gap-4 transition-all duration-300">
           <span>Explore</span> <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
};

const DestinationsPage = () => {
  const { destinations, settings } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const header = settings.pageHeaders?.destinations || {
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80',
    title: 'Wanderlust Awaits',
    subtitle: 'Explore our top rated destinations.'
  };
  
  const safeDestinations = Array.isArray(destinations) ? destinations.filter(d => d) : [];

  const categories = [
    { name: "All", icon: Globe },
    { name: "Safari", icon: Compass },
    { name: "Beach", icon: Palmtree },
    { name: "Mountain", icon: Mountain },
  ];

  const filteredDestinations = safeDestinations.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" 
      ? true 
      : (filter === "Safari" && (d.name.includes("Mara") || d.name.includes("Amboseli") || d.name.includes("Park"))) ||
        (filter === "Beach" && (d.name.includes("Diani") || d.name.includes("Zanzibar") || d.name.includes("Coast"))) ||
        (filter === "Mountain" && (d.name.includes("Kenya") || d.name.includes("Kilimanjaro")));
    
    return matchesSearch && matchesFilter;
  });

  // Determine Layout Size for Bento Grid
  const getSizeForIndex = (index: number): "normal" | "large" | "wide" => {
    // Pattern: Large (0), Normal (1,2), Wide (3), Normal (4,5)...
    if (index === 0) return "large";
    if (index === 3 || index === 6) return "wide";
    return "normal";
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* Parallax Hero Header */}
      <div className="relative h-[60vh] overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 bg-black/40 z-10"></div>
         <img 
           src={header.image} 
           alt={header.title} 
           className="absolute inset-0 w-full h-full object-cover animate-pulse-slow" 
         />
         
         <div className="relative z-20 text-center text-white px-4 mt-10">
            <p className="text-brand-orange font-bold tracking-[0.3em] text-sm mb-4 uppercase animate-fade-in">The World Is Yours</p>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 animate-fade-in-up">{header.title}</h1>
            
            {/* Floating Search Bar */}
            <div className="bg-white/10 backdrop-blur-md border border-white/30 p-2 rounded-full max-w-lg mx-auto flex items-center shadow-2xl animate-fade-in-up delay-200">
               <div className="pl-4 pr-2 text-white/70">
                  <Search size={20} />
               </div>
               <input 
                 type="text" 
                 placeholder="Find your paradise..." 
                 className="bg-transparent border-none outline-none text-white placeholder-white/60 flex-grow py-3 px-2"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 py-4 shadow-sm">
         <div className="container mx-auto px-4 flex justify-center gap-4 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
               <button
                 key={cat.name}
                 onClick={() => setFilter(cat.name)}
                 className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                   filter === cat.name 
                   ? 'bg-brand-green text-white shadow-lg' 
                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                 }`}
               >
                 <cat.icon size={14} /> {cat.name}
               </button>
            ))}
         </div>
      </div>

      {/* Bento Grid Content */}
      <div className="container mx-auto px-4 py-16">
         <RevealOnScroll>
            <div className="mb-12 text-center">
               <h2 className="text-3xl text-gray-800 font-serif font-bold">
                  {filter === 'All' ? 'Explore All Destinations' : `Explore ${filter} Destinations`}
               </h2>
               <p className="text-gray-500 mt-2">{filteredDestinations.length} locations found</p>
            </div>
         </RevealOnScroll>

         {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
               {filteredDestinations.map((dest, index) => (
                  <CreativeDestinationCard 
                    key={dest.id} 
                    destination={dest} 
                    size={getSizeForIndex(index)} 
                  />
               ))}
            </div>
         ) : (
            <div className="text-center py-20 opacity-50">
               <MapIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
               <p className="text-xl font-medium text-gray-500">No destinations match your search.</p>
               <button onClick={() => {setSearchTerm(''); setFilter('All');}} className="text-brand-green mt-4 underline">Clear Filters</button>
            </div>
         )}
      </div>
    </div>
  );
};

const ContactPage = () => {
  const { settings, addBooking } = useData();
  const location = useLocation();
  const header = settings.pageHeaders?.contact || {
    image: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1920&q=80',
    title: 'Contact Us',
    subtitle: "We'd love to hear from you."
  };
  
  // Extract AI Plan details if available
  const aiPlanState = location.state as { plan: AIItineraryResponse, request: TripPlanRequest, customerEmail: string } | undefined;

  // Form handling
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(aiPlanState?.customerEmail || '');
  const [message, setMessage] = useState(aiPlanState ? `I am interested in the AI generated plan for ${aiPlanState.plan.tripTitle}. Est. Budget: ${aiPlanState.plan.estimatedCost}` : '');
  const [service, setService] = useState(aiPlanState ? 'AI Plan' : 'Tours & Safaris');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    await addBooking({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      serviceType: service,
      status: 'New',
      notes: message + (aiPlanState ? `\n\n[AI Plan JSON attached in backend]` : '')
    });
    
    setSubmitStatus('success');
  };

  return (
  <div className="bg-gray-50 min-h-screen">
    {/* Header */}
    <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <img src={header.image} alt={header.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative z-20 text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 animate-fade-in-up">{header.title}</h1>
        <p className="text-xl max-w-2xl mx-auto font-light animate-fade-in-up delay-100">{header.subtitle}</p>
      </div>
    </div>

    <div className="py-24">
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        {/* Info Panel */}
        <div className="lg:w-2/5 bg-brand-green text-white p-10 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6">Get in touch</h3>
            <p className="text-gray-200 mb-8">
              Visit us at our offices or send us a message. We are available 24/7 for support.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><Phone className="text-brand-orange" /></div>
                <div>
                  <p className="text-xs text-gray-300 uppercase tracking-wide font-bold">Call Us</p>
                  {settings.phone.map((p, i) => (
                    <p key={i} className="font-medium">{p}</p>
                  ))}
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><Mail className="text-brand-orange" /></div>
                <div>
                  <p className="text-xs text-gray-300 uppercase tracking-wide font-bold">Email</p>
                  <p className="font-medium">{settings.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><MapPin className="text-brand-orange" /></div>
                <div>
                  <p className="text-xs text-gray-300 uppercase tracking-wide font-bold">Visit Us</p>
                  <p className="font-medium">{settings.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.819917806137!2d36.8198!3d-1.2841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTcnMDMuMCJTIDM2wrA0OScxMS4zIkU!5e0!3m2!1sen!2ske!4v1635762345678!5m2!1sen!2ske" 
               width="100%" 
               height="200" 
               style={{border:0, borderRadius: '0.5rem', opacity: 0.8}} 
               allowFullScreen={true} 
               loading="lazy"
               title="Office Location"
             ></iframe>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:w-3/5 p-10">
          {submitStatus === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-8 max-w-md">Thanks for reaching out, <span className="font-bold text-brand-green">{name}</span>. We have received your message and will get back to you shortly.</p>
                <Button onClick={() => { setSubmitStatus('idle'); setName(''); setMessage(''); setEmail(''); setPhone(''); }}>Send Another Message</Button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
              {aiPlanState && (
                   <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100 flex gap-3 items-start">
                       <Sparkles className="text-brand-green shrink-0 mt-1" size={18} />
                       <div>
                           <p className="text-sm font-bold text-brand-green">AI Itinerary Inquiry</p>
                           <p className="text-xs text-gray-600">We've pre-filled some details based on your generated plan for <strong>{aiPlanState.plan.tripTitle}</strong>.</p>
                       </div>
                   </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input type="text" disabled={submitStatus === 'submitting'} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none disabled:opacity-50" placeholder="John Doe" required onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" disabled={submitStatus === 'submitting'} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none disabled:opacity-50" placeholder="+254..." required onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" disabled={submitStatus === 'submitting'} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none disabled:opacity-50" placeholder="john@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Interested In</label>
                  <select 
                    disabled={submitStatus === 'submitting'} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none disabled:opacity-50" 
                    onChange={e => setService(e.target.value)}
                    value={service}
                  >
                    <option>Tours & Safaris</option>
                    <option>Car Hire</option>
                    <option>Flights</option>
                    <option>Events</option>
                    <option>AI Plan</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} disabled={submitStatus === 'submitting'} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none disabled:opacity-50" placeholder="Tell us about your plans..." value={message} onChange={e => setMessage(e.target.value)}></textarea>
                </div>

                <Button primary type="submit" className="w-full justify-center" disabled={submitStatus === 'submitting'}>
                   {submitStatus === 'submitting' ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} /> Sending...
                      </>
                   ) : 'Send Message'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  </div>
  );
};

// --- BLOG PAGES ---
const BlogPage = () => {
  const { posts, settings } = useData();
  const safePosts = Array.isArray(posts) ? posts.filter(p => p.status === 'published') : [];
  const header = settings.pageHeaders?.blog || {
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80',
    title: 'Travel Journal',
    subtitle: 'Stories, tips, and inspiration from the wild.'
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img src={header.image} alt={header.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 animate-fade-in-up">{header.title}</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light animate-fade-in-up delay-100">{header.subtitle}</p>
        </div>
      </div>

      <div className="py-24">
      <div className="container mx-auto px-4">
        {safePosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safePosts.map((post, idx) => (
              <RevealOnScroll key={post.id} delay={idx * 100}>
                <Link to={`/blog/${post.slug}`} className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col hover:-translate-y-1">
                  <div className="h-56 overflow-hidden rounded-t-xl">
                    <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-opacity duration-300" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-brand-green transition-colors mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5"><User size={12} /> {post.author_name}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">{post.excerpt}</p>
                    <div className="mt-auto pt-4 border-t border-gray-50">
                       <span className="text-brand-green font-semibold text-sm group-hover:underline">Read More &rarr;</span>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No blog posts have been published yet. Check back soon!</p>
        )}
      </div>
      </div>
    </div>
  );
};

const PostDetailsPage = () => {
  const { slug } = useParams();
  const { posts } = useData();
  const safePosts = Array.isArray(posts) ? posts : [];
  const post = safePosts.find(p => p.slug === slug);

  if (!post) return <div className="p-20 text-center">Post not found.</div>;

  // More robust markdown-like renderer
  const renderContent = (content: string) => {
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-2 my-4">
                    {listItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };

    content.split('\n').forEach((line, i) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**')) {
            flushList();
            elements.push(<h3 key={i} className="text-xl font-bold mt-6 mb-3 text-gray-800">{trimmedLine.replace(/\*\*/g, '')}</h3>);
        } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
            listItems.push(trimmedLine.substring(2).trim());
        } else {
            flushList();
            if (trimmedLine) {
                elements.push(<p key={i} className="mb-4 text-gray-700 leading-relaxed">{trimmedLine}</p>);
            }
        }
    });

    flushList(); // Flush any remaining list items
    return elements;
  };

  return (
    <div className="bg-white py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <article className="animate-fade-in">
          <header className="mb-12 text-center border-b pb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-green mb-4">{post.title}</h1>
            <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2"><User size={14} /> By {post.author_name}</span>
              <span className="flex items-center gap-2"><Calendar size={14} /> Published on {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6 flex justify-center flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-brand-light text-brand-green text-xs font-bold px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </header>

          <div className="prose lg:prose-lg max-w-none mx-auto">
            <img src={post.featured_image} alt={post.title} className="w-full rounded-xl shadow-lg mb-12" />
            <div className="whitespace-pre-wrap">
              {renderContent(post.content)}
            </div>
          </div>
        </article>
        
        <div className="mt-16 pt-8 border-t text-center">
            <Link to="/blog" className="text-brand-green font-semibold hover:underline flex items-center justify-center gap-2">
                <ChevronLeft size={16} /> Back to All Articles
            </Link>
        </div>
      </div>
    </div>
  );
};


const App = () => {
  return (
    <NotificationProvider>
      <DataProvider>
        <FaviconHandler />
        <SEOHandler />
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white overflow-x-hidden">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailsPage />} />
                <Route path="/tours" element={<ToursPage />} />
                <Route path="/tours/:id" element={<PackageDetailsPage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<PostDetailsPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
            <FloatingWhatsApp />
            <NotificationToaster />
          </div>
        </Router>
      </DataProvider>
    </NotificationProvider>
  );
};

export default App;

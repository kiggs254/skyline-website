import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Package, Destination, Testimonial, Service, Car, SiteSettings, Booking, DataContextType, FAQ, Post, Subscriber, GeneratedPlan, TripPlanRequest, AIItineraryResponse } from '../types';
import { PACKAGES, DESTINATIONS, TESTIMONIALS, CARS, CONTACT_INFO, INITIAL_FAQS, INITIAL_POSTS, INITIAL_SERVICES } from '../constants';
import { api } from '../lib/api';
import { useNotification } from './NotificationContext';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Skyline Savannah Tours',
  logo: 'https://i.ibb.co/pwnL1Xh/skyline-savannah-logo.png',
  logoWhite: '',
  favicon: 'https://i.ibb.co/pwnL1Xh/skyline-savannah-logo.png',
  enableServices: true,
  phone: CONTACT_INFO.phone,
  email: CONTACT_INFO.email,
  address: CONTACT_INFO.address,
  whatsapp: CONTACT_INFO.whatsapp,
  socials: { 
    facebook: 'https://www.facebook.com/profile.php?id=61585145977815&ref=1', 
    instagram: '#', 
    twitter: 'https://x.com/SkylineSavTours' 
  },
  hero: {
    videoUrl: 'https://cdn.pixabay.com/video/2022/03/10/110362-687206285_large.mp4', 
    fallbackImage: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?q=80&w=2067&auto=format&fit=crop',
    title: 'Discover. Explore.',
    subtitle: ''
  },
  pageHeaders: {
    destinations: {
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80',
      title: 'Wanderlust Awaits',
      subtitle: 'Explore our top rated destinations across East Africa and beyond.'
    },
    tours: {
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
      title: 'Safari Packages',
      subtitle: 'Curated itineraries for the ultimate adventure.'
    },
    services: {
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
      title: 'Our Services',
      subtitle: 'Comprehensive travel solutions tailored for you.'
    },
    blog: {
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80',
      title: 'Travel Journal',
      subtitle: 'Stories, tips, and inspiration from the wild.'
    },
    contact: {
      image: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1920&q=80',
      title: 'Contact Us',
      subtitle: "We're here to help plan your perfect trip."
    },
    about: {
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1920&q=80',
      title: 'About Us',
      subtitle: 'The story behind the journeys.'
    }
  },
  about: {
    title: "Our Story",
    subtitle: "Experience Kenya with dignity, authenticity, and respect.",
    imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80",
    paragraph1: "Skyline Savannah Tours was born from a single belief — that Kenya’s beauty, culture, and wildlife should be experienced with dignity, authenticity, and respect. After years of travelling, exploring, and engaging with communities across the country, our founder realized something was missing in the tourism space: a service that truly understands the needs of today’s traveller, especially those seeking family-oriented and culturally respectful journeys.",
    paragraph2: "So Skyline Savannah Tours was created — not just as a tour company, but as a movement. A movement to showcase Kenya’s breathtaking savannahs, ancient cultures, warm hospitality, and vibrant cities in a way that is thoughtful, safe, and deeply personal. We curate each itinerary with care, ensuring that every guest feels understood, valued, and welcomed. Our story begins with a simple dream: To connect people with the heart of Africa, one unforgettable experience at a time. From the golden horizons of the Maasai Mara, to the spiritual stillness of coastal Swahili towns, to the modern pulse of Nairobi — our journeys are designed to honour both nature and culture. Every sunrise game drive, every shared meal, every cultural encounter becomes part of a larger story — your story. Today, Skyline Savannah Tours stands as a proud Kenyan company carving out a niche in premium safari experiences, committed to excellence, integrity, and the true spirit of adventure. And our story is just beginning. We invite you to explore Kenya with us — respectfully, beautifully, and without compromise.",
    stat1_value: "15+",
    stat1_label: "Years Experience",
    stat2_value: "100+",
    stat2_label: "Curated Journeys"
  },
  aboutUsSection: {
    image1_url: "https://images.unsplash.com/photo-1525092029991-13f5c7146523?q=80&w=1887&auto=format&fit=crop",
    image2_url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2071&auto=format&fit=crop",
    review_rating: "4.9/5",
    review_count: "200+ Reviews",
    pre_title: "Why Choose Us",
    title: "Crafting Journeys Into The Wild",
    feature1: "Years of Experience",
    feature2: "Local Expert Guides",
    feature3: "50+ Wild Tours",
    paragraph1: "At Wild Trails, we believe that true adventure begins where the road ends. Our mission is to connect travelers with nature's untouched beauty through carefully curated wild travel experiences.",
    paragraph2: "With 12 years of experience in jungle expeditions, mountain trekking, and remote safari tours, we bring you face-to-face with the raw and real. Every journey is guided by local experts, ensuring safety, authenticity, and unforgettable memories.",
    button_text: "Explore Now",
    button_link: "/about"
  },
  seo: {
    title: 'Skyline Savannah Tours | Discover. Explore. Experience.',
    description: 'Premium Kenyan safari experiences. Discover, explore, and experience the heart of Africa with us.',
    keywords: 'safari, kenya, travel, tours, maasai mara, amboseli'
  },
  scripts: { header: '', body: '' },
  aiProvider: 'gemini',
  storageProvider: 'supabase',
  wasabi: {
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    bucket: ''
  },
  smtp: {
    server: '',
    port: 587,
    user: '',
    pass: ''
  },
  adminEmail: 'admin@example.com'
};

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-brand-green">
      <div className="flex space-x-2 mb-4">
         <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
         <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
         <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="text-white font-serif text-xl tracking-widest uppercase animate-pulse">Loading Adventure</p>
    </div>
  );
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlan[]>([]);
  const [settings, setSettingsState] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  
  const { addNotification } = useNotification();

  const fetchAllData = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) setIsLoading(true);

    try {
      const response = await api.get('get_all_data');
      if (response) {
          if (response.packages) setPackages(response.packages);
          if (response.destinations) setDestinations(response.destinations);
          if (response.services) setServices(response.services);
          if (response.cars) setCars(response.cars);
          if (response.testimonials) setTestimonials(response.testimonials);
          if (response.faqs) setFaqs(response.faqs);
          if (response.posts) setPosts(response.posts);
          
          if (response.settings && response.settings.siteName) {
              setSettingsState({ ...INITIAL_SETTINGS, ...response.settings });
          }
      } else {
          // Fallback if API fails
          console.warn("API request failed, using static fallback.");
          setPackages(PACKAGES);
          setDestinations(DESTINATIONS);
          setServices(INITIAL_SERVICES as Service[]); 
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (!isBackgroundRefresh) setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
      const response = await api.get('get_admin_data');
      if (response) {
          if (response.bookings) setBookings(response.bookings);
          if (response.subscribers) setSubscribers(response.subscribers);
          if (response.generated_plans) setGeneratedPlans(response.generated_plans);
      }
  };

  useEffect(() => {
    fetchAllData();
    // Check if admin is logged in (token exists) then fetch admin data
    if (localStorage.getItem('skyline_token')) {
        fetchAdminData();
    }
  }, []);

  // Generic CRUD Helper using PHP API
  const createCrudActions = <T extends { id: string }>(tableName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => ({
    add: async (item: Omit<T, 'id'>): Promise<boolean> => {
      const res = await api.post('crud', { table: tableName, op: 'create', data: item });
      if (res && res.success) {
          // Re-fetch to be safe or append locally
          setter(prev => [...prev, { ...item, id: res.id } as T]);
          return true;
      }
      return false;
    },
    update: async (item: T): Promise<boolean> => {
      const res = await api.post('crud', { table: tableName, op: 'update', data: item });
      if (res && res.success) {
          setter(prev => prev.map(p => p.id === item.id ? item : p));
          return true;
      }
      return false;
    },
    remove: async (id: string): Promise<boolean> => {
      const res = await api.post('crud', { table: tableName, op: 'delete', id });
      if (res && res.success) {
          setter(prev => prev.filter(p => p.id !== id));
          return true;
      }
      return false;
    }
  });

  const packageActions = createCrudActions<Package>('packages', setPackages);
  const destinationActions = createCrudActions<Destination>('destinations', setDestinations);
  const serviceActions = createCrudActions<Service>('services', setServices);
  const testimonialActions = createCrudActions<Testimonial>('testimonials', setTestimonials);
  const faqActions = createCrudActions<FAQ>('faqs', setFaqs);
  const postActions = createCrudActions<Post>('posts', setPosts);
  const subscriberActions = createCrudActions<Subscriber>('subscribers', setSubscribers);

  const addBooking = async (booking: Omit<Booking, 'id' | 'date'>): Promise<boolean> => {
    const res = await api.post('create_booking', booking);
    if (res && res.success) {
        addNotification('booking', booking);
        // Optimistic update if we are in admin view, though mostly for public side
        return true;
    }
    return false;
  };

  const updateBookingStatus = async (id: string, status: Booking['status']): Promise<boolean> => {
    const res = await api.post('crud', { table: 'bookings', op: 'update', data: { id, status } });
    if (res && res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        return true;
    }
    return false;
  };

  const addSubscriber = async (email: string): Promise<boolean> => {
    const res = await api.post('add_subscriber', { email });
    if (res && res.success) {
        addNotification('subscriber', { email });
        return true;
    }
    return false;
  };

  const saveGeneratedPlan = async (email: string, request: TripPlanRequest, response: AIItineraryResponse): Promise<boolean> => {
    const res = await api.post('save_plan', { email, request, response });
    return !!(res && res.success);
  };

  const checkAiUsage = async (email: string): Promise<boolean> => {
    const res = await api.get('check_ai_usage', { email });
    return res ? res.allowed : false;
  };

  const updateSettings = async (newSettings: SiteSettings): Promise<boolean> => {
    const res = await api.post('update_settings', newSettings);
    if (res && res.success) {
        setSettingsState(newSettings);
        return true;
    }
    return false;
  };

  const resetData = async () => {
    if (!window.confirm('Resetting data is not implemented in this version safely via frontend.')) return;
  };

  const value: DataContextType = {
    packages, destinations, testimonials, faqs, posts, cars, services, settings,
    bookings, subscribers, generatedPlans,
    addPackage: packageActions.add as any, updatePackage: packageActions.update, deletePackage: packageActions.remove,
    addDestination: destinationActions.add as any, updateDestination: destinationActions.update, deleteDestination: destinationActions.remove,
    addService: serviceActions.add, updateService: serviceActions.update, deleteService: serviceActions.remove,
    addTestimonial: testimonialActions.add as any, updateTestimonial: testimonialActions.update, deleteTestimonial: testimonialActions.remove,
    addFaq: faqActions.add as any, updateFaq: faqActions.update, deleteFaq: faqActions.remove,
    addPost: postActions.add as any, updatePost: postActions.update, deletePost: postActions.remove,
    addBooking, updateBookingStatus, addSubscriber, deleteSubscriber: subscriberActions.remove, saveGeneratedPlan, checkAiUsage, updateSettings, resetData,
  };

  return (
    <DataContext.Provider value={value}>
      {isLoading ? <LoadingScreen /> : children}
    </DataContext.Provider>
  );
};
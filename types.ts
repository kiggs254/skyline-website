
import React from 'react';

export interface Package {
  id: string;
  title: string;
  destination: string;
  type: 'Safari' | 'Honeymoon' | 'Family' | 'Luxury' | 'Budget' | 'International';
  price: number; // in KES
  hidePrice?: boolean; // Option to hide price
  isFeatured?: boolean; // New: Feature on homepage
  duration: string;
  image: string; // Keep for backward compatibility (main thumbnail)
  images: string[]; // New: Gallery images
  description: string;
  rating: number;
  inclusions: string[];
  exclusions: string[];
  detailedItinerary: { day: number; title: string; description: string }[];
}

export interface Car {
  id: string;
  name: string;
  type: 'SUV' | 'Sedan' | 'Luxury' | 'Van' | 'Bus';
  pricePerDay: number;
  image: string;
  passengers: number;
  transmission: 'Automatic' | 'Manual';
  luggage: number;
}

export interface Service {
  id: string;
  title: string;
  icon?: React.ReactNode; 
  iconName?: string; 
  description: string; 
  fullDescription?: string; 
  image: string; 
}

export interface Testimonial {
  id:string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Post {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface DestinationInsight {
  content: string;
  sources: { title: string; url: string }[];
}

export interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  packageCount: number;
  isFeatured?: boolean; // New: Feature on homepage
  insight?: DestinationInsight; 
}

// AI Trip Planner Types
export interface TripPlanRequest {
  destination: string;
  days: number;
  budget: 'Budget' | 'Moderate' | 'Luxury';
  travelers: number;
  interests: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface AIItineraryResponse {
  tripTitle: string;
  summary: string;
  estimatedCost: string;
  itinerary: ItineraryDay[];
}

// CMS Specific Types
export interface AboutUsSectionSettings {
  image1_url: string;
  image2_url: string;
  review_rating: string;
  review_count: string;
  pre_title: string;
  title: string;
  feature1: string;
  feature2: string;
  feature3: string;
  paragraph1: string;
  paragraph2: string;
  button_text: string;
  button_link: string;
}

export interface PageHeaderSettings {
  image: string;
  title: string;
  subtitle: string;
}

export interface SiteSettings {
  logo?: string;
  logoWhite?: string; 
  favicon?: string;
  siteName?: string;
  enableServices?: boolean;
  phone: string[];
  email: string;
  address: string;
  whatsapp: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  hero: {
    videoUrl: string;
    fallbackImage: string;
    title: string;
    subtitle: string;
  };
  pageHeaders: {
    destinations: PageHeaderSettings;
    tours: PageHeaderSettings;
    services: PageHeaderSettings;
    blog: PageHeaderSettings;
    contact: PageHeaderSettings;
    about: PageHeaderSettings;
  };
  about: {
    title: string;
    subtitle: string;
    imageUrl: string;
    paragraph1: string;
    paragraph2: string;
    stat1_value: string;
    stat1_label: string;
    stat2_value: string;
    stat2_label: string;
  };
  aboutUsSection: AboutUsSectionSettings;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  scripts: {
    header: string;
    body: string;
  };
  aiProvider: 'gemini' | 'openai';
  storageProvider: 'supabase' | 'wasabi';
  wasabi: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
  smtp: {
    server: string;
    port: number;
    user: string;
    pass: string;
  };
  adminEmail: string;
}

export interface Booking {
  id: string;
  date: string; // ISO string
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string; // 'Package', 'Car', 'Custom', 'AI Plan'
  itemName?: string; // e.g. "Maasai Mara Safari"
  travelDate?: string;
  travelers?: number;
  totalPrice?: number;
  status: 'New' | 'Contacted' | 'Booked' | 'Cancelled';
  notes?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface GeneratedPlan {
  id: string;
  email: string;
  request: TripPlanRequest;
  response: AIItineraryResponse;
  created_at: string;
}

export interface DataContextType {
  packages: Package[];
  destinations: Destination[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  posts: Post[];
  cars: Car[];
  services: Service[];
  settings: SiteSettings;
  bookings: Booking[];
  subscribers: Subscriber[];
  generatedPlans: GeneratedPlan[];
  
  // Actions
  addPackage: (pkg: Omit<Package, 'id'>) => Promise<boolean>;
  updatePackage: (pkg: Package) => Promise<boolean>;
  deletePackage: (id: string) => Promise<boolean>;
  
  addDestination: (dest: Omit<Destination, 'id'>) => Promise<boolean>;
  updateDestination: (dest: Destination) => Promise<boolean>;
  deleteDestination: (id: string) => Promise<boolean>;

  addService: (service: Omit<Service, 'id'>) => Promise<boolean>;
  updateService: (service: Service) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;

  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => Promise<boolean>;
  updateTestimonial: (testimonial: Testimonial) => Promise<boolean>;
  deleteTestimonial: (id: string) => Promise<boolean>;

  addFaq: (faq: Omit<FAQ, 'id'>) => Promise<boolean>;
  updateFaq: (faq: FAQ) => Promise<boolean>;
  deleteFaq: (id: string) => Promise<boolean>;
  
  addPost: (post: Omit<Post, 'id' | 'created_at'>) => Promise<boolean>;
  updatePost: (post: Post) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;

  addBooking: (booking: Omit<Booking, 'id' | 'date'>) => Promise<boolean>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<boolean>;

  addSubscriber: (email: string) => Promise<boolean>;
  deleteSubscriber: (id: string) => Promise<boolean>;
  saveGeneratedPlan: (email: string, request: TripPlanRequest, response: AIItineraryResponse) => Promise<boolean>;
  checkAiUsage: (email: string) => Promise<boolean>; // Returns true if allowed

  updateSettings: (settings: SiteSettings) => Promise<boolean>;
  
  resetData: () => void;
}

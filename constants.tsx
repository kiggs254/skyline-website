import { Package, Car, Testimonial, Destination, FAQ, Post, Service } from './types';

export const PACKAGES: Package[] = [
  {
    id: '1',
    title: 'Maasai Mara Migration',
    destination: 'Kenya',
    type: 'Safari',
    price: 45000,
    duration: '3 Days',
    image: 'https://picsum.photos/id/1074/800/600',
    images: [
      'https://picsum.photos/id/1074/800/600',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Witness the great migration in the world-famous Maasai Mara. Includes game drives and luxury tented camp accommodation.',
    rating: 4.9,
    inclusions: [
      'Transport in a customized safari cruiser',
      '2 Nights accommodation',
      'Full board meals',
      'Park entrance fees',
      'Professional English-speaking guide',
      'Drinking water'
    ],
    exclusions: [
      'Tips and gratuities',
      'Alcoholic drinks',
      'Personal insurance',
      'Hot Air Balloon Safari (Optional)'
    ],
    detailedItinerary: [
      { day: 1, title: 'Nairobi to Maasai Mara', description: 'Depart Nairobi early morning. Drive through the Great Rift Valley stopping at the viewpoint. Arrive in Mara for lunch. Afternoon game drive.' },
      { day: 2, title: 'Full Day Game Viewing', description: 'Spend the entire day exploring the vast savannah. Look out for the Big 5 and the migration crossing (seasonal). Picnic lunch in the wild.' },
      { day: 3, title: 'Morning Drive & Return', description: 'Early morning game drive to catch predators in action. Breakfast at camp, then depart for Nairobi arriving in the afternoon.' }
    ]
  },
  {
    id: '2',
    title: 'Dubai Luxury Escape',
    destination: 'Dubai',
    type: 'International',
    price: 120000,
    duration: '5 Days',
    image: 'https://picsum.photos/id/1040/800/600',
    images: [
      'https://picsum.photos/id/1040/800/600',
      'https://images.unsplash.com/photo-1512453979798-5ea904ac6605?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Experience the glitz and glamour of Dubai with desert safaris, marina cruises, and shopping festivals.',
    rating: 4.8,
    inclusions: [
      'Return economy flights from Nairobi',
      'Airport transfers',
      '4 Nights accommodation in 4-star hotel',
      'Daily Breakfast',
      'Desert Safari with BBQ Dinner',
      'Marina Dhow Cruise'
    ],
    exclusions: [
      'Visa fees',
      'Tourism Dirham fee',
      'Personal expenses',
      'Optional tours (Burj Khalifa)'
    ],
    detailedItinerary: [
      { day: 1, title: 'Arrival', description: 'Arrival at DXB airport, transfer to hotel. Evening at leisure.' },
      { day: 2, title: 'City Tour & Dhow Cruise', description: 'Half-day Dubai city tour. Evening Dhow Cruise with dinner at the Marina.' },
      { day: 3, title: 'Desert Safari', description: 'Morning free for shopping. Afternoon pick up for thrilling dune bashing, camel riding and BBQ dinner.' },
      { day: 4, title: 'Leisure / Shopping', description: 'Full day at leisure to explore Dubai Mall or visit Atlantis The Palm.' },
      { day: 5, title: 'Departure', description: 'Check out and transfer to airport for flight home.' }
    ]
  },
  {
    id: '3',
    title: 'Diani Beach Relaxation',
    destination: 'Kenya',
    type: 'Honeymoon',
    price: 35000,
    duration: '4 Days',
    image: 'https://picsum.photos/id/1039/800/600',
    images: [
      'https://picsum.photos/id/1039/800/600',
      'https://images.unsplash.com/photo-1540202404-a6718dcb10e4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586861635167-e5223aeb4227?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'White sands and turquoise waters await you at the award-winning Diani Beach. Perfect for couples.',
    rating: 4.7,
    inclusions: [
      'Return SGR tickets (Economy)',
      'Transfers from Mombasa Terminus',
      '3 Nights accommodation',
      'Half Board Meals',
      'Use of hotel amenities'
    ],
    exclusions: [
      'Water sports activities',
      'Lunch',
      'Personal items'
    ],
    detailedItinerary: [
      { day: 1, title: 'Arrival', description: 'Train from Nairobi to Mombasa. Transfer to Diani. Check-in and beach relaxation.' },
      { day: 2, title: 'Beach & Pool', description: 'Full day enjoying the resort facilities and the white sandy beach.' },
      { day: 3, title: 'Wasini Island (Optional)', description: 'Optional day trip to Wasini Island for dolphin watching and snorkeling, or relax at the hotel.' },
      { day: 4, title: 'Return', description: 'Morning swim. Transfer to SGR station for afternoon train to Nairobi.' }
    ]
  },
  {
    id: '4',
    title: 'Amboseli Elephant Haven',
    destination: 'Kenya',
    type: 'Family',
    price: 40000,
    duration: '3 Days',
    image: 'https://picsum.photos/id/1064/800/600',
    images: [
       'https://picsum.photos/id/1064/800/600',
       'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'See huge herds of elephants against the backdrop of Mt. Kilimanjaro.',
    rating: 4.6,
    inclusions: [
      'Transport in Safari Van',
      '2 Nights full board accommodation',
      'Park fees',
      'Game drives'
    ],
    exclusions: ['Tips', 'Drinks', 'Laundry'],
    detailedItinerary: [
      { day: 1, title: 'Nairobi to Amboseli', description: 'Drive to Amboseli National Park. Lunch. Evening game drive viewing Mt. Kilimanjaro.' },
      { day: 2, title: 'Full Day Amboseli', description: 'Morning and afternoon game drives. Visit the observation hill for a panoramic view of the swamps and elephants.' },
      { day: 3, title: 'Return to Nairobi', description: 'Early morning game drive. Breakfast. Drive back to Nairobi.' }
    ]
  },
  {
    id: '5',
    title: 'Zanzibar Cultural Tour',
    destination: 'Tanzania',
    type: 'International',
    price: 85000,
    duration: '5 Days',
    image: 'https://picsum.photos/id/1015/800/600',
    images: [
      'https://picsum.photos/id/1015/800/600',
      'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Explore Stone Town, spice farms, and pristine beaches in this historic island paradise.',
    rating: 4.8,
    inclusions: [
      'Flights from Nairobi',
      'Airport transfers',
      'Stone Town Tour',
      'Spice Farm Tour',
      'Bed & Breakfast'
    ],
    exclusions: ['Blue Safari ($50)', 'Infrastructure tax', 'Lunch & Dinner'],
    detailedItinerary: [
        { day: 1, title: 'Arrival in Zanzibar', description: 'Fly to Zanzibar. Transfer to Stone Town hotel. Sunset at Forodhani Gardens.' },
        { day: 2, title: 'Stone Town & Spice Tour', description: 'Walking tour of the historic city. Afternoon spice farm tour.' },
        { day: 3, title: 'Transfer to Beach', description: 'Transfer to Nungwi or Kendwa (North Coast). Check in to beach resort.' },
        { day: 4, title: 'Beach Relaxation', description: 'Full day at leisure on the beach.' },
        { day: 5, title: 'Departure', description: 'Transfer to airport for flight back to Nairobi.' }
    ]
  },
    {
    id: '6',
    title: 'Mount Kenya Climb',
    destination: 'Kenya',
    type: 'Budget',
    price: 30000,
    duration: '4 Days',
    image: 'https://picsum.photos/id/1018/800/600',
    images: [
      'https://picsum.photos/id/1018/800/600',
      'https://images.unsplash.com/photo-1650875468053-956d2d33f5c4?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Challenge yourself to scale the second highest peak in Africa. Sirimon route.',
    rating: 4.9,
    inclusions: [
        'Transport to/from Nanyuki',
        'Mountain Guide & Porters',
        'All meals on the mountain',
        'Camping gear (excluding sleeping bag)',
        'Park & Camping fees'
    ],
    exclusions: ['Hiking gear', 'Sleeping bag', 'Tips'],
    detailedItinerary: [
        { day: 1, title: 'Nairobi to Old Moses', description: 'Drive to Sirimon Gate. Hike to Old Moses Camp (3300m).' },
        { day: 2, title: 'Old Moses to Shipton', description: 'Hike through the Mackinder Valley to Shipton Camp (4200m).' },
        { day: 3, title: 'Summit Attempt', description: 'Pre-dawn summit attempt to Point Lenana (4985m). Descend to Old Moses.' },
        { day: 4, title: 'Return', description: 'Descent to Sirimon Gate. Drive back to Nairobi.' }
    ]
  }
];

export const CARS: Car[] = [
  {
    id: 'c1',
    name: 'Toyota Land Cruiser V8',
    type: 'Luxury',
    pricePerDay: 15000,
    image: 'https://picsum.photos/seed/landcruiser/600/400',
    passengers: 5,
    transmission: 'Automatic',
    luggage: 4
  },
  {
    id: 'c2',
    name: 'Toyota Prado TX',
    type: 'SUV',
    pricePerDay: 8000,
    image: 'https://picsum.photos/seed/prado/600/400',
    passengers: 5,
    transmission: 'Automatic',
    luggage: 3
  },
  {
    id: 'c3',
    name: 'Safari Land Cruiser',
    type: 'SUV',
    pricePerDay: 18000,
    image: 'https://picsum.photos/seed/safari/600/400',
    passengers: 7,
    transmission: 'Manual',
    luggage: 5
  },
  {
    id: 'c4',
    name: 'Toyota Noah',
    type: 'Van',
    pricePerDay: 6000,
    image: 'https://picsum.photos/seed/noah/600/400',
    passengers: 7,
    transmission: 'Automatic',
    luggage: 4
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'Travel Enthusiast',
    content: 'Skyline Savannah Tours planned our honeymoon in Diani perfectly. Every detail was taken care of!',
    rating: 5
  },
  {
    id: 't2',
    name: 'David Kamau',
    role: 'Corporate Client',
    content: 'Reliable car hire services for our company retreat. The drivers were professional and punctual.',
    rating: 5
  },
  {
    id: 't3',
    name: 'Emily Chen',
    role: 'Solo Traveler',
    content: 'The AI trip planner suggested a hidden gem in Naivasha that I would have never found on my own.',
    rating: 4
  }
];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq1',
    question: "How do I book a trip with Skyline Savannah Tours?",
    answer: "Booking is easy! You can browse our packages online and send an enquiry via the 'Book Now' button. Alternatively, reach out to us directly via WhatsApp, email, or phone. Our team will finalize the itinerary with you and guide you through the payment process."
  },
  {
    id: 'faq2',
    question: "What payment options are available?",
    answer: "We accept payments via M-Pesa, Bank Transfer (EFT/RTGS), and Credit/Debit Cards. A deposit of 20-40% is typically required to secure your booking, with the balance payable before the travel date."
  },
  {
    id: 'faq3',
    question: "Do you handle visa applications?",
    answer: "Yes, for international trips (e.g., Dubai, Zanzibar), we provide guidance and assistance with visa applications. However, the final approval lies with the respective embassy or immigration authority."
  },
  {
    id: 'faq4',
    question: "Is travel insurance included in the packages?",
    answer: "Most standard packages do not include personal travel insurance unless stated otherwise. We strongly recommend that all travelers purchase comprehensive travel insurance to cover medical emergencies, cancellations, and luggage loss."
  },
  {
    id: 'faq5',
    question: "Can I customize an existing itinerary?",
    answer: "Absolutely! We specialize in tailor-made experiences. If you see a package you like but want to add extra days, change hotels, or include different activities, just let us know and we will customize it to suit your needs."
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post1',
    created_at: new Date().toISOString(),
    title: 'Top 5 Things to Do in the Maasai Mara',
    slug: 'top-5-things-maasai-mara',
    content: 'The Maasai Mara is more than just a safari destination; it is a place of breathtaking beauty and vibrant culture.\n\n**1. Witness the Great Migration:** The annual movement of millions of wildebeest and zebra is a sight to behold.\n\n**2. Hot Air Balloon Safari:** Get a bird\'s eye view of the savannah at sunrise. It is a magical experience.\n\n**3. Visit a Maasai Village:** Interact with the local community and learn about their fascinating traditions.\n\n**4. Go on a Night Game Drive:** Discover the nocturnal creatures of the Mara.\n\n**5. Bush Dinners:** Enjoy a gourmet meal under the stars, surrounded by the sounds of the African wilderness.',
    excerpt: 'Discover the ultimate experiences in the Maasai Mara, from the Great Migration to magical hot air balloon rides.',
    featured_image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    author_name: 'Skyline Staff',
    tags: ['safari', 'kenya', 'maasai mara', 'travel tips'],
    status: 'published'
  },
  {
    id: 'post2',
    created_at: new Date().toISOString(),
    title: 'Packing Guide for a Kenyan Safari',
    slug: 'kenyan-safari-packing-guide',
    content: 'Packing for a safari can be tricky. You want to be comfortable without overpacking. Here is a quick guide:\n\n*   **Layered Clothing:** Neutral colors (khaki, green, brown) are best. Pack lightweight long-sleeved shirts, t-shirts, and a warm fleece or jacket for chilly mornings and evenings.\n*   **Comfortable Shoes:** A pair of sturdy walking shoes or hiking boots is essential.\n*   **Sun Protection:** A wide-brimmed hat, sunglasses, and high-SPF sunscreen are non-negotiable.\n*   **Binoculars:** Don\'t miss out on distant wildlife sightings.\n*   **Camera Gear:** Bring extra batteries and memory cards.\n\nRemember to pack in a soft-sided duffel bag, as these are easier to fit into the luggage compartments of safari vehicles.',
    excerpt: 'Not sure what to pack for your safari adventure? Our essential guide covers everything you need for a comfortable and memorable trip.',
    featured_image: 'https://images.unsplash.com/photo-1599834571168-187d59b24075?auto=format&fit=crop&w=800&q=80',
    author_name: 'Jane Doe',
    tags: ['safari', 'packing', 'kenya', 'guide'],
    status: 'published'
  }
];

export const DESTINATIONS: Destination[] = [
  {
    id: 'd1',
    name: 'Maasai Mara',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    description: 'Home of the Great Migration and vast savannahs.',
    packageCount: 12
  },
  {
    id: 'd2',
    name: 'Diani Beach',
    image: 'https://images.unsplash.com/photo-1540202404-a6718dcb10e4?auto=format&fit=crop&w=800&q=80',
    description: 'Pristine white sands and turquoise waters.',
    packageCount: 8
  },
  {
    id: 'd3',
    name: 'Dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea904ac6605?auto=format&fit=crop&w=800&q=80',
    description: 'Futuristic architecture, luxury shopping, and desert adventures.',
    packageCount: 5
  },
  {
    id: 'd4',
    name: 'Zanzibar',
    image: 'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?auto=format&fit=crop&w=800&q=80',
    description: 'Historic Stone Town and spice plantations.',
    packageCount: 6
  },
  {
    id: 'd5',
    name: 'Amboseli',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    description: 'Large herds of elephants with Mt. Kilimanjaro backdrop.',
    packageCount: 4
  },
  {
    id: 'd6',
    name: 'Mount Kenya',
    image: 'https://images.unsplash.com/photo-1650875468053-956d2d33f5c4?auto=format&fit=crop&w=800&q=80',
    description: "Africa's second-highest peak and diverse wildlife.",
    packageCount: 3
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Tours & Safaris',
    iconName: 'Map',
    description: 'Customized safari itineraries to all major national parks and reserves in East Africa.',
    fullDescription: 'Experience the magic of the wild with our expertly crafted safari packages. Whether you want to witness the Great Migration or explore the vast savannahs of Tsavo, we have something for everyone.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's2',
    title: 'Car Hire',
    iconName: 'CarFront',
    description: 'Reliable car rental services ranging from saloon cars to 4x4 safari land cruisers.',
    fullDescription: 'Travel at your own pace with our reliable car hire services. We offer a wide range of vehicles, from economy cars for city driving to rugged 4x4s for off-road adventures.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's3',
    title: 'Hotel Booking',
    iconName: 'Hotel',
    description: 'Best rates for hotels, lodges, and tented camps across Kenya and beyond.',
    fullDescription: 'We partner with the best hotels and lodges to provide you with comfortable and luxurious accommodation options suited to your budget.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's4',
    title: 'Airport Transfers',
    iconName: 'Plane',
    description: 'Seamless airport pickups and drop-offs for individuals and groups.',
    fullDescription: 'Start your trip stress-free with our punctual and professional airport transfer services. Our drivers will be waiting for you upon arrival.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'
  }
];

export const CONTACT_INFO = {
  phone: ['+254 788 818 001', '+254 724 633 223'],
  email: 'hello@skylinesavannah.com',
  address: '680 Hotel Building, 5th Floor, Room 507, Nairobi, Kenya',
  whatsapp: '254788818001' 
};
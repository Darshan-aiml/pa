import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'package_pro.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('Seeding PackagePro enterprise database with 8 Indian & International destinations...');

db.exec(`
  DROP TABLE IF EXISTS package_activities;
  DROP TABLE IF EXISTS packages;
  DROP TABLE IF EXISTS transportation;
  DROP TABLE IF EXISTS activities;
  DROP TABLE IF EXISTS hotels;
  DROP TABLE IF EXISTS destinations;
  DROP TABLE IF EXISTS bookings;

  CREATE TABLE destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    popular_season TEXT NOT NULL,
    currency TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    destination_id TEXT NOT NULL,
    name TEXT NOT NULL,
    tier TEXT NOT NULL,
    stars REAL NOT NULL,
    rating REAL NOT NULL,
    price_per_night REAL NOT NULL,
    room_type TEXT NOT NULL,
    amenities TEXT NOT NULL,
    image_url TEXT NOT NULL,
    address TEXT NOT NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    destination_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    duration_hours REAL NOT NULL,
    rating REAL NOT NULL,
    price_per_person REAL NOT NULL,
    description TEXT NOT NULL,
    included_items TEXT NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
  );

  CREATE TABLE IF NOT EXISTS transportation (
    id TEXT PRIMARY KEY,
    destination_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    price REAL NOT NULL,
    is_per_person INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'standard',
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
  );

  CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    destination_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    default_nights INTEGER NOT NULL,
    default_travelers INTEGER NOT NULL,
    default_hotel_id TEXT NOT NULL,
    default_transport_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT NOT NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    FOREIGN KEY (default_hotel_id) REFERENCES hotels(id),
    FOREIGN KEY (default_transport_id) REFERENCES transportation(id)
  );

  CREATE TABLE IF NOT EXISTS package_activities (
    package_id TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    PRIMARY KEY (package_id, activity_id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL UNIQUE,
    package_id TEXT,
    destination_name TEXT NOT NULL,
    traveler_name TEXT NOT NULL,
    traveler_email TEXT NOT NULL,
    travelers INTEGER NOT NULL,
    nights INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    hotel_name TEXT NOT NULL,
    hotel_tier TEXT NOT NULL,
    transport_name TEXT NOT NULL,
    activities_list TEXT NOT NULL,
    final_total REAL NOT NULL,
    price_per_traveler REAL NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

db.exec(`
  DELETE FROM package_activities;
  DELETE FROM packages;
  DELETE FROM transportation;
  DELETE FROM activities;
  DELETE FROM hotels;
  DELETE FROM destinations;
  DELETE FROM bookings;
`);

const insertDest = db.prepare(`
  INSERT INTO destinations (id, name, country, region, description, image_url, popular_season, currency)
  VALUES (@id, @name, @country, @region, @description, @image_url, @popular_season, @currency)
`);

const insertHotel = db.prepare(`
  INSERT INTO hotels (id, destination_id, name, tier, stars, rating, price_per_night, room_type, amenities, image_url, address)
  VALUES (@id, @destination_id, @name, @tier, @stars, @rating, @price_per_night, @room_type, @amenities, @image_url, @address)
`);

const insertActivity = db.prepare(`
  INSERT INTO activities (id, destination_id, name, category, duration_hours, rating, price_per_person, description, included_items, image_url)
  VALUES (@id, @destination_id, @name, @category, @duration_hours, @rating, @price_per_person, @description, @included_items, @image_url)
`);

const insertTransport = db.prepare(`
  INSERT INTO transportation (id, destination_id, name, type, provider, price, is_per_person, description, image_url, tier)
  VALUES (@id, @destination_id, @name, @type, @provider, @price, @is_per_person, @description, @image_url, @tier)
`);

const insertPackage = db.prepare(`
  INSERT INTO packages (id, destination_id, title, subtitle, description, default_nights, default_travelers, default_hotel_id, default_transport_id, image_url, tags)
  VALUES (@id, @destination_id, @title, @subtitle, @description, @default_nights, @default_travelers, @default_hotel_id, @default_transport_id, @image_url, @tags)
`);

const insertPkgAct = db.prepare(`
  INSERT INTO package_activities (package_id, activity_id) VALUES (?, ?)
`);

const insertBooking = db.prepare(`
  INSERT INTO bookings (
    id, booking_code, package_id, destination_name, traveler_name, traveler_email,
    travelers, nights, start_date, hotel_name, hotel_tier, transport_name,
    activities_list, final_total, price_per_traveler, status, created_at
  ) VALUES (
    @id, @booking_code, @package_id, @destination_name, @traveler_name, @traveler_email,
    @travelers, @nights, @start_date, @hotel_name, @hotel_tier, @transport_name,
    @activities_list, @final_total, @price_per_traveler, @status, @created_at
  )
`);

const transaction = db.transaction(() => {
  // 1. Destinations (8 Options)
  const destinations = [
    {
      id: 'dest_goa',
      name: 'Goa',
      country: 'India',
      region: 'West Coast / Konkan',
      description: 'Sun-drenched beaches, Portuguese villas, beach shacks, water sports and vibrant nightlife.',
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'October – March',
      currency: 'INR',
    },
    {
      id: 'dest_kashmir',
      name: 'Kashmir & Ladakh',
      country: 'India',
      region: 'North India / Himalayas',
      description: 'The Paradise on Earth — Dal Lake houseboats, Gulmarg Gondola cable cars, and snow-clad Himalayan peaks.',
      image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'All Year (Snow: Dec-Feb, Blooms: Apr-Jun)',
      currency: 'INR',
    },
    {
      id: 'dest_kerala',
      name: 'Kerala (God’s Own Country)',
      country: 'India',
      region: 'South India',
      description: 'Munnar mist-covered tea gardens, Alleppey serene backwaters, Ayurvedic wellness and spice plantations.',
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'September – March',
      currency: 'INR',
    },
    {
      id: 'dest_rajasthan',
      name: 'Rajasthan (Jaipur & Udaipur)',
      country: 'India',
      region: 'Royal Rajasthan',
      description: 'Regal palaces, lakeside heritage havelis, impenetrable desert forts, and cultural folk dances.',
      image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'October – March',
      currency: 'INR',
    },
    {
      id: 'dest_himachal',
      name: 'Himachal (Manali & Solang)',
      country: 'India',
      region: 'North India / Himalayas',
      description: 'Cedar pine forests, Beas river valley, high-altitude Rohtang Pass, paragliding and cozy mountain cafes.',
      image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'March – June & Oct – Feb',
      currency: 'INR',
    },
    {
      id: 'dest_andaman',
      name: 'Andaman & Nicobar Islands',
      country: 'India',
      region: 'Bay of Bengal Islands',
      description: 'Pristine turquoise waters, Havelock coral scuba diving, white sands of Radhanagar Beach and Cellular Jail.',
      image_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'October – May',
      currency: 'INR',
    },
    {
      id: 'dest_uttarakhand',
      name: 'Uttarakhand (Rishikesh & Corbett)',
      country: 'India',
      region: 'Himalayan Foothills',
      description: 'Ganges white-water rafting, yoga ashrams, sunset Ganga Aarti, and Bengal tiger safaris in Jim Corbett.',
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'September – May',
      currency: 'INR',
    },
    {
      id: 'dest_dubai',
      name: 'Dubai & Abu Dhabi',
      country: 'UAE (Ex-India)',
      region: 'Middle East Gateway',
      description: 'Burj Khalifa skyline, Arabian desert dune bashing, luxury dhow cruises, and high-end shopping souks.',
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      popular_season: 'November – April',
      currency: 'INR',
    },
  ];

  for (const d of destinations) {
    insertDest.run(d);
  }

  // 2. Hotels (Goa)
  insertHotel.run({
    id: 'hotel_goa_budget',
    destination_id: 'dest_goa',
    name: 'Zostel Plus Morjim Beachfront',
    tier: 'budget',
    stars: 3.5,
    rating: 4.4,
    price_per_night: 2800,
    room_type: 'Private AC Deluxe Room with Balcony',
    amenities: JSON.stringify(['High-Speed Wi-Fi', 'Swimming Pool', 'Beach Access (2 min)', 'Cafe & Workspaces', 'Scooter Rental Desk']),
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    address: 'Morjim Beach Road, North Goa',
  });
  insertHotel.run({
    id: 'hotel_goa_standard',
    destination_id: 'dest_goa',
    name: 'Sterling Goa Varca Palms Resort',
    tier: 'standard',
    stars: 4.0,
    rating: 4.6,
    price_per_night: 6500,
    room_type: 'Premium Pool View Suite',
    amenities: JSON.stringify(['Complimentary Buffet Breakfast', 'Multiple Swimming Pools', 'Ayurvedic Spa', 'Kids Play Area', 'Beach Shuttles']),
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    address: 'Varca Beach, South Goa',
  });
  insertHotel.run({
    id: 'hotel_goa_luxury',
    destination_id: 'dest_goa',
    name: 'Taj Exotica Resort & Spa, Benaulim',
    tier: 'luxury',
    stars: 5.0,
    rating: 4.9,
    price_per_night: 22000,
    room_type: 'Mediterranean Sea-Facing Villa Room',
    amenities: JSON.stringify(['Private Beachfront', 'Jiva Spa & Wellness', '5 Fine Dining Restaurants', 'Golf Course & Tennis', 'Butler Service']),
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    address: 'Calwaddo, Benaulim, South Goa',
  });

  // Hotels (Kashmir)
  insertHotel.run({
    id: 'hotel_kashmir_budget',
    destination_id: 'dest_kashmir',
    name: 'Mughal Heritage Houseboat on Dal Lake',
    tier: 'budget',
    stars: 3.5,
    rating: 4.5,
    price_per_night: 3200,
    room_type: 'Carved Walnut Wood Deluxe Room',
    amenities: JSON.stringify(['Warm Electric Blankets', 'Authentic Kahwa Tea', 'Lake View Balcony', 'Free Shikara Crossings', 'Home Cooked Kashmiri Meals']),
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    address: 'Ghat No. 7, Boulevard Road, Dal Lake, Srinagar',
  });
  insertHotel.run({
    id: 'hotel_kashmir_standard',
    destination_id: 'dest_kashmir',
    name: 'Radisson Srinagar Luxury Hotel',
    tier: 'standard',
    stars: 4.0,
    rating: 4.7,
    price_per_night: 8500,
    room_type: 'Executive Mountain View Room',
    amenities: JSON.stringify(['Central Heating', 'Heated Outdoor Pool', 'Wazwan & Multi-Cuisine Dining', 'Spa & Fitness Centre', 'Airport Pickup']),
    image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    address: 'Moulana Azad Road, Srinagar',
  });
  insertHotel.run({
    id: 'hotel_kashmir_luxury',
    destination_id: 'dest_kashmir',
    name: 'The Khyber Himalayan Resort & Spa, Gulmarg',
    tier: 'luxury',
    stars: 5.0,
    rating: 4.95,
    price_per_night: 28000,
    room_type: 'Premier Snow Valley Balcony Room',
    amenities: JSON.stringify(['Affarwat Peak Views', 'Heated Glass-Enclosed Pool', 'L’Occitane Luxury Spa', 'Walking Distance to Gondola', 'Ski Concierge']),
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    address: 'Near Gondola Station, Gulmarg, Kashmir',
  });

  // Hotels (Kerala)
  insertHotel.run({
    id: 'hotel_kerala_budget',
    destination_id: 'dest_kerala',
    name: 'Munnar Green Tea Cottages',
    tier: 'budget',
    stars: 3.5,
    rating: 4.3,
    price_per_night: 2400,
    room_type: 'Plantation View Valley Room',
    amenities: JSON.stringify(['Free Breakfast', 'Campfire Evening', 'Tea Garden Guided Walk', 'Wi-Fi']),
    image_url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    address: 'Chithirapuram, Munnar',
  });
  insertHotel.run({
    id: 'hotel_kerala_standard',
    destination_id: 'dest_kerala',
    name: 'Fragrant Nature Backwater Resort & Ayurveda',
    tier: 'standard',
    stars: 4.5,
    rating: 4.7,
    price_per_night: 7200,
    room_type: 'Lake View Premium Jacuzzi Villa',
    amenities: JSON.stringify(['Authentic Ayurvedic Doctor Consult', 'Infinity Pool over Lake', 'Sunset Cruise Included', 'Traditional Kerala Buffet']),
    image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    address: 'Kollam - Alleppey Waterway, Kerala',
  });
  insertHotel.run({
    id: 'hotel_kerala_luxury',
    destination_id: 'dest_kerala',
    name: 'Kumarakom Lake Resort (Heritage Luxury)',
    tier: 'luxury',
    stars: 5.0,
    rating: 4.95,
    price_per_night: 26000,
    room_type: 'Heritage Meandering Pool Villa',
    amenities: JSON.stringify(['Direct Pool Access from Bedroom', 'Private Speedboat Tours', 'World Famous Ayurmana Spa', 'Prince Charles Royal Heritage Suite']),
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    address: 'Vembanad Lake, Kumarakom, Kerala',
  });

  // Hotels (Rajasthan)
  insertHotel.run({
    id: 'hotel_raj_standard',
    destination_id: 'dest_rajasthan',
    name: 'Alsisar Haveli Heritage Palace Hotel',
    tier: 'standard',
    stars: 4.0,
    rating: 4.7,
    price_per_night: 6800,
    room_type: 'Royal Rajputana Heritage Room',
    amenities: JSON.stringify(['Central Courtyard Pool', 'Frescoed Ceilings', 'Puppet Shows & Folk Music', 'Royal Dining Hall']),
    image_url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80',
    address: 'Sansar Chandra Road, Jaipur',
  });
  insertHotel.run({
    id: 'hotel_raj_luxury',
    destination_id: 'dest_rajasthan',
    name: 'Taj Lake Palace, Udaipur',
    tier: 'luxury',
    stars: 5.0,
    rating: 4.98,
    price_per_night: 42000,
    room_type: 'Palace Lake View Luxury Suite',
    amenities: JSON.stringify(['Private Boat Transfer across Lake Pichola', 'Jiva Spa Boat', 'Royal Butler Service', 'Astrologer Session', 'Private Rooftop Dinners']),
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    address: 'Pichola Lake, Udaipur',
  });

  // Hotels (Himachal)
  insertHotel.run({
    id: 'hotel_himachal_standard',
    destination_id: 'dest_himachal',
    name: 'Snow Valley Resorts & Spa, Manali',
    tier: 'standard',
    stars: 4.0,
    rating: 4.6,
    price_per_night: 4800,
    room_type: 'Apple Orchard Balcony Suite',
    amenities: JSON.stringify(['Free Buffet Breakfast', 'Heated Bedding', 'Kids Play Area', 'Bonfire Nights', 'Mountain View Deck']),
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    address: 'Log Huts Area, Manali',
  });
  insertHotel.run({
    id: 'hotel_himachal_luxury',
    destination_id: 'dest_himachal',
    name: 'The Himalayan Luxury Castle Resort',
    tier: 'luxury',
    stars: 5.0,
    rating: 4.9,
    price_per_night: 18500,
    room_type: 'Victorian Gothic Heritage Cottage',
    amenities: JSON.stringify(['Fireplace in Bedroom', 'Outdoor Thermal Pool', 'Fine Dining Dungeon Restaurant', 'Mountain Wellness Spa']),
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    address: 'Hadimba Road, Manali',
  });

  // Hotels (Andaman)
  insertHotel.run({
    id: 'hotel_andaman_standard',
    destination_id: 'dest_andaman',
    name: 'Symphony Palms Beach Resort, Havelock',
    tier: 'standard',
    stars: 4.0,
    rating: 4.6,
    price_per_night: 7500,
    room_type: 'Lagoon Villa near Private Beach',
    amenities: JSON.stringify(['Private White Sand Beach', 'In-house Dive Centre', 'Beachfront Candlelight Dinners', 'Cocktail Shack']),
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    address: 'Govind Nagar Beach, Havelock Island',
  });
  insertHotel.run({
    id: 'hotel_andaman_luxury',
    destination_id: 'dest_andaman',
    name: 'Taj Exotica Resort & Spa, Radhanagar Beach',
    tier: 'luxury',
    stars: 5.0,
    rating: 4.95,
    price_per_night: 32000,
    room_type: 'Luxury Andamanese Timber Villa',
    amenities: JSON.stringify(['Direct Radhanagar Beach Access', 'Olympic Sized Pool', 'Jiva Spa', 'Private Coral Reef Snorkeling', 'Chef Tastings']),
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    address: 'Radhanagar Beach No. 7, Havelock',
  });

  // Hotels (Uttarakhand)
  insertHotel.run({
    id: 'hotel_uttarakhand_standard',
    destination_id: 'dest_uttarakhand',
    name: 'Aloha on the Ganges Resort, Rishikesh',
    tier: 'standard',
    stars: 4.0,
    rating: 4.7,
    price_per_night: 6200,
    room_type: 'Ganges River View Premium Room',
    amenities: JSON.stringify(['Infinity Pool overlooking Ganges', 'Daily Yoga & Meditation Classes', 'Ayurvedic Spa', 'Pure Veg Dining']),
    image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    address: 'Tapovan, Rishikesh',
  });

  // Hotels (Dubai)
  insertHotel.run({
    id: 'hotel_dubai_standard',
    destination_id: 'dest_dubai',
    name: 'JW Marriott Marquis Hotel Dubai',
    tier: 'standard',
    stars: 5.0,
    rating: 4.8,
    price_per_night: 13500,
    room_type: 'Deluxe Skyline Burj View Room',
    amenities: JSON.stringify(['Heated Outdoor Pool', 'Saray Spa', '12 Award-Winning Restaurants', 'Metro Station Direct Access']),
    image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    address: 'Business Bay, Sheikh Zayed Road, Dubai',
  });
  insertHotel.run({
    id: 'hotel_dubai_luxury',
    destination_id: 'dest_dubai',
    name: 'Atlantis The Palm Luxury Beach Resort',
    tier: 'luxury',
    stars: 5.0,
    rating: 4.95,
    price_per_night: 36000,
    room_type: 'Palm Ocean View Luxury Suite',
    amenities: JSON.stringify(['Unlimited Aquaventure Waterpark Access', 'The Lost Chambers Aquarium', 'Private Beach Club', 'Nobu Dining']),
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    address: 'Crescent Road, The Palm, Dubai',
  });

  // 3. Activities
  // Goa Activities
  insertActivity.run({
    id: 'act_goa_scuba',
    destination_id: 'dest_goa',
    name: 'Grande Island Scuba Dive & Dolphin Cruise',
    category: 'Adventure',
    duration_hours: 6.0,
    rating: 4.8,
    price_per_person: 2800,
    description: 'Boat ride to Grande Island, 20-min guided dive with underwater video, dolphin sighting, and Goan buffet lunch.',
    included_items: JSON.stringify(['Full Scuba Equipment', 'GoPro HD Videos & Photos', 'Barbecue & Goan Lunch', 'PADI Certified Instructors']),
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_goa_cruise',
    destination_id: 'dest_goa',
    name: 'Mandovi River Luxury Sunset Dinner Cruise',
    category: 'Culinary',
    duration_hours: 2.5,
    rating: 4.6,
    price_per_person: 1600,
    description: 'Cruise along Panaji coastline with live Goan folk dance, Bollywood DJ, multi-course buffet, and cocktail drinks.',
    included_items: JSON.stringify(['Sunset Deck Seating', 'Live DJ & Folk Dance Show', 'Unlimited Buffet Dinner', 'Welcome Drink & Snacks']),
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_goa_spice',
    destination_id: 'dest_goa',
    name: 'Sahakari Spice Plantation Guided Tour & Buffet',
    category: 'Culinary',
    duration_hours: 3.0,
    rating: 4.7,
    price_per_person: 1200,
    description: 'Walk through organic vanilla, cardamom, and cinnamon groves followed by an authentic Goan feast served on banana leaf.',
    included_items: JSON.stringify(['Herbal Tea Welcome', 'Botanist Guided Walk', 'Authentic Goan Buffet', 'Cashew Feni Tasting']),
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  });

  // Kashmir Activities
  insertActivity.run({
    id: 'act_kashmir_gondola',
    destination_id: 'dest_kashmir',
    name: 'Gulmarg Phase 1 & 2 Gondola Cable Car Ride',
    category: 'Adventure',
    duration_hours: 4.0,
    rating: 4.95,
    price_per_person: 2400,
    description: 'Ride Asia’s highest cable car up to Kongdoori and Apharwat Peak at 13,780 ft with panoramic snow views.',
    included_items: JSON.stringify(['Phase 1 & Phase 2 VIP Tickets', 'Ski Guide Assistance', 'Snow Goggles Rental']),
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_kashmir_shikara',
    destination_id: 'dest_kashmir',
    name: 'Dal Lake Royal Sunset Shikara Ride & Floating Market',
    category: 'Sightseeing',
    duration_hours: 2.0,
    rating: 4.85,
    price_per_person: 1100,
    description: 'Private decorated shikara ride passing Char Chinar, floating flower markets, and lotus gardens with saffron Kahwa.',
    included_items: JSON.stringify(['Private Decorated Shikara', 'Warm Saffron Kahwa with Almonds', 'Traditional Kashmiri Attire Photo Op']),
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_kashmir_pahalgam',
    destination_id: 'dest_kashmir',
    name: 'Betaab Valley & Aru Valley Alpine Pony Trek',
    category: 'Adventure',
    duration_hours: 4.0,
    rating: 4.9,
    price_per_person: 2200,
    description: 'Guided pony excursion through pine meadows and crystal clear Lidder river banks in Pahalgam.',
    included_items: JSON.stringify(['Pony Rental with Handler', 'Valley Entry Permits', 'Hot Kashmiri Tea & Snacks']),
    image_url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
  });

  // Kerala Activities
  insertActivity.run({
    id: 'act_kerala_houseboat',
    destination_id: 'dest_kerala',
    name: 'Alleppey Private Luxury Houseboat Day Cruise',
    category: 'Sightseeing',
    duration_hours: 5.0,
    rating: 4.95,
    price_per_person: 3800,
    description: 'Cruise tranquil backwaters, palm-fringed lagoons, and paddy fields with a dedicated chef preparing fresh meals.',
    included_items: JSON.stringify(['Private AC Houseboat', 'Traditional Kerala Lunch on Banana Leaf', 'Evening Tea & Banana Fritters', 'Captain & Crew']),
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_kerala_tea_safari',
    destination_id: 'dest_kerala',
    name: 'Munnar Kolukkumalai Sunrise 4x4 Jeep Trek',
    category: 'Adventure',
    duration_hours: 4.5,
    rating: 4.85,
    price_per_person: 1800,
    description: 'Visit the world’s highest tea estate at 7,130 ft to witness sunrise above the sea of clouds.',
    included_items: JSON.stringify(['4x4 Off-Road Jeep Transport', 'Tea Factory Visit & Fresh Tea Tasting', 'Mountain Guide', 'Hot Breakfast']),
    image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_kerala_kathakali',
    destination_id: 'dest_kerala',
    name: 'Kochi Kathakali & Kalaripayattu Martial Show',
    category: 'Cultural',
    duration_hours: 2.5,
    rating: 4.8,
    price_per_person: 900,
    description: 'Witness ancient Kerala temple dance drama with elaborate facial makeup demonstration and sword fighting.',
    included_items: JSON.stringify(['VIP Front Row Seats', 'Makeup Demonstration Entry', 'English Program Guide']),
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  });

  // Rajasthan Activities
  insertActivity.run({
    id: 'act_raj_amber',
    destination_id: 'dest_rajasthan',
    name: 'Amber Fort Royal Heritage Guided Tour & Sound Show',
    category: 'Cultural',
    duration_hours: 3.5,
    rating: 4.8,
    price_per_person: 1400,
    description: 'Explore the Sheesh Mahal (Mirror Palace) and royal ramparts of Amber Fort followed by the evening light and sound show.',
    included_items: JSON.stringify(['Priority Monuments Pass', 'Official Heritage Historian Guide', 'Evening Sound & Light VIP Seat']),
    image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_raj_chokhi',
    destination_id: 'dest_rajasthan',
    name: 'Chokhi Dhani Heritage Village & Royal Thali Feast',
    category: 'Culinary',
    duration_hours: 4.0,
    rating: 4.75,
    price_per_person: 1600,
    description: 'Immerse in folk dance, puppet shows, camel rides, and unlimited royal Rajasthani Thali served with pure ghee.',
    included_items: JSON.stringify(['All Village Attractions Pass', 'Royal Rajasthani Thali Dinner', 'Folk Dance & Acrobatics Show', 'Camel Ride']),
    image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_raj_hotair',
    destination_id: 'dest_rajasthan',
    name: 'Jaipur Sunrise Hot Air Balloon Safari',
    category: 'Adventure',
    duration_hours: 3.0,
    rating: 4.98,
    price_per_person: 8500,
    description: 'Float gently over royal palaces, Aravalli hills, and rustic desert hamlets at dawn with champagne breakfast.',
    included_items: JSON.stringify(['60-Minute Balloon Flight', 'First Flight Certificate', 'Champagne Toast & Breakfast', 'Hotel Pick & Drop']),
    image_url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80',
  });

  // Himachal Activities
  insertActivity.run({
    id: 'act_himachal_paragliding',
    destination_id: 'dest_himachal',
    name: 'Solang Valley High Fly Tandem Paragliding',
    category: 'Adventure',
    duration_hours: 2.0,
    rating: 4.9,
    price_per_person: 2800,
    description: 'Fly high above snow-capped Himalayan peaks and pine forests with a certified tandem pilot and GoPro recording.',
    included_items: JSON.stringify(['Glider Equipment & Safety Harness', 'Certified Tandem Pilot', 'Full HD GoPro Action Video']),
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_himachal_rohtang',
    destination_id: 'dest_himachal',
    name: 'Rohtang Pass Snow Valley & Atal Tunnel Excursion',
    category: 'Sightseeing',
    duration_hours: 6.0,
    rating: 4.92,
    price_per_person: 2800,
    description: 'Private 4x4 drive through engineering marvel Atal Tunnel up to 13,058 ft Rohtang Pass for snow play and skiing.',
    included_items: JSON.stringify(['NGT Rohtang Pass Permit', 'Warm Snow Suit & Boots', 'Chauffeur Driven 4x4 Vehicle']),
    image_url: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_himachal_jogini',
    destination_id: 'dest_himachal',
    name: 'Jogini Waterfall Nature Trek & Old Manali Cafe Walk',
    category: 'Adventure',
    duration_hours: 3.5,
    rating: 4.75,
    price_per_person: 850,
    description: 'Scenic pine forest walk through Vashisht village up to cascading Jogini falls with fresh apple juice tasting.',
    included_items: JSON.stringify(['Local Trek Guide', 'Fresh Apple Juice Tasting', 'Packed Trail Snacks']),
    image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80',
  });

  // Andaman Activities
  insertActivity.run({
    id: 'act_andaman_scuba',
    destination_id: 'dest_andaman',
    name: 'Havelock Nemo Reef PADI Scuba Dive',
    category: 'Adventure',
    duration_hours: 3.5,
    rating: 4.95,
    price_per_person: 3800,
    description: 'Immerse into crystal clear waters surrounded by clownfish, sea turtles, and vibrant live coral gardens.',
    included_items: JSON.stringify(['Scuba Diving Gear', 'PADI Master Instructor', 'Undersea 4K Videos & Photos', 'Boat Transfers']),
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_andaman_radhanagar',
    destination_id: 'dest_andaman',
    name: 'Radhanagar Beach Sunset & Mangrove Kayaking',
    category: 'Adventure',
    duration_hours: 3.0,
    rating: 4.88,
    price_per_person: 1800,
    description: 'Paddle through serene bioluminescent mangrove creeks followed by sunset at Asia’s best beach.',
    included_items: JSON.stringify(['Imported Sea Kayak & Paddle', 'Life Vest', 'Safety Escort', 'Fresh Coconut Water']),
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_andaman_cellular',
    destination_id: 'dest_andaman',
    name: 'Cellular Jail Sound & Light Show with Museum Pass',
    category: 'Cultural',
    duration_hours: 2.5,
    rating: 4.82,
    price_per_person: 650,
    description: 'Historical tour of Kalapani memorial followed by the moving sound and light drama narrated by Om Puri.',
    included_items: JSON.stringify(['National Memorial Entry Ticket', 'VIP Hindi Sound & Light Pass', 'Freedom Museum Access']),
    image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
  });

  // Uttarakhand Activities
  insertActivity.run({
    id: 'act_uttarakhand_rafting',
    destination_id: 'dest_uttarakhand',
    name: '16km Shivpuri to Rishikesh Ganges White Water Rafting',
    category: 'Adventure',
    duration_hours: 3.5,
    rating: 4.9,
    price_per_person: 1500,
    description: 'Tackle Grade III & IV rapids like Roller Coaster and Golf Course with cliff jumping and body surfing.',
    included_items: JSON.stringify(['International Rafting Gear', 'IRF Certified River Guide', 'Safety Kayak Escort', 'Cliff Jumping Gear']),
    image_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_uttarakhand_ganga_aarti',
    destination_id: 'dest_uttarakhand',
    name: 'Triveni Ghat VIP Ganga Aarti & Ashram Walk',
    category: 'Cultural',
    duration_hours: 2.0,
    rating: 4.92,
    price_per_person: 750,
    description: 'Spiritual dusk ceremony on the banks of holy Ganges with Vedic chanting, brass lamp offerings, and sitar recital.',
    included_items: JSON.stringify(['VIP Ghat Platform Seating', 'Flower Diya Offering Basket', 'Pundit Blessing & Tilak Ceremony']),
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_uttarakhand_corbett_safari',
    destination_id: 'dest_uttarakhand',
    name: 'Jim Corbett National Park 4x4 Jeep Tiger Safari',
    category: 'Adventure',
    duration_hours: 4.5,
    rating: 4.85,
    price_per_person: 3400,
    description: 'Open gypsy jeep safari through Dhikala / Bijrani zone tracking Bengal tigers, wild elephants, and deer.',
    included_items: JSON.stringify(['Forest Department Gypsy Permit', 'Certified Naturalist Guide', 'Binoculars Rental']),
    image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
  });

  // Dubai Activities
  insertActivity.run({
    id: 'act_dubai_safari',
    destination_id: 'dest_dubai',
    name: 'Red Dunes Desert 4x4 Safari, BBQ & Tanoura Show',
    category: 'Adventure',
    duration_hours: 6.0,
    rating: 4.9,
    price_per_person: 3200,
    description: 'Thrilling dune bashing in Lahbab desert, sandboarding, camel rides, belly dance show, and 5-star BBQ dinner.',
    included_items: JSON.stringify(['Land Cruiser Pick & Drop', 'Dune Bashing & Sandboarding', 'Unlimited BBQ Buffet & Soft Drinks', 'Live Fire & Dance Shows']),
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_dubai_burj',
    destination_id: 'dest_dubai',
    name: 'Burj Khalifa 124th & 125th Floor Observation Deck',
    category: 'Sightseeing',
    duration_hours: 2.0,
    rating: 4.94,
    price_per_person: 4200,
    description: 'Speed up the world’s fastest double-deck elevator to take in 360-degree vistas across Dubai, desert, and Gulf.',
    included_items: JSON.stringify(['Prime Time Fast-Track Ticket', 'Observation Telescope Access', 'Dubai Mall Fountain Show View']),
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  });
  insertActivity.run({
    id: 'act_dubai_marina',
    destination_id: 'dest_dubai',
    name: 'Dubai Marina Luxury Yacht Cruise with Buffet',
    category: 'Culinary',
    duration_hours: 2.5,
    rating: 4.88,
    price_per_person: 3100,
    description: 'Cruise past Ain Dubai and JBR skyscrapers aboard an illuminated glass yacht with 5-star international cuisine.',
    included_items: JSON.stringify(['Yacht Cruise Seating', 'International 5-Star Buffet', 'Live Saxophonist', 'Unlimited Soft Drinks']),
    image_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
  });

  // 4. Transportation (Budget, Standard, Luxury choices for all destinations)
  // GOA
  insertTransport.run({
    id: 'trans_goa_budget',
    destination_id: 'dest_goa',
    name: 'Self-Drive Hatchback (Swift / i20) Unlimited Kms',
    type: 'rental_car',
    provider: 'Goa Self-Drive Hub',
    price: 2400,
    is_per_person: 0,
    tier: 'budget',
    description: 'Clean sanitized AC hatchback delivered at airport or hotel with 24/7 roadside assistance.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_goa_cab',
    destination_id: 'dest_goa',
    name: 'Private AC Sedan (Dzire / Etios) with Chauffeur',
    type: 'private_chauffeur',
    provider: 'Goa Tourism Executive Cab',
    price: 6500,
    is_per_person: 0,
    tier: 'standard',
    description: 'Roundtrip airport transfers plus full-day North & South Goa sightseeing in private AC Dzire/Etios.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_goa_innova',
    destination_id: 'dest_goa',
    name: 'Toyota Innova Crysta Dedicated SUV (All Days)',
    type: 'private_chauffeur',
    provider: 'Royal Konkan Fleet',
    price: 11500,
    is_per_person: 0,
    tier: 'luxury',
    description: 'Spacious AC 7-seater Innova Crysta with professional driver at your disposal 10 hours daily.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  });

  // KASHMIR
  insertTransport.run({
    id: 'trans_kashmir_budget',
    destination_id: 'dest_kashmir',
    name: 'Shared AC Tourist Coach Pass (Srinagar-Gulmarg-Pahalgam)',
    type: 'train',
    provider: 'JKSRTC Tourist Fleet',
    price: 2200,
    is_per_person: 1,
    tier: 'budget',
    description: 'Comfortable pushback seat in government-approved deluxe AC coach covering all major tourist hubs.',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_kashmir_sedan',
    destination_id: 'dest_kashmir',
    name: 'Private AC Sedan (Etios / Dzire) with Mountain Driver',
    type: 'private_chauffeur',
    provider: 'Kashmir Valley Tourist Taxi Union',
    price: 7800,
    is_per_person: 0,
    tier: 'standard',
    description: 'Dedicated private AC sedan with licensed valley driver for airport, Dal Lake, and day trips.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_kashmir_innova',
    destination_id: 'dest_kashmir',
    name: 'Dedicated Toyota Innova Crysta 4x4 Luxury SUV',
    type: 'private_chauffeur',
    provider: 'Royal Kashmir Chauffeur Service',
    price: 14000,
    is_per_person: 0,
    tier: 'luxury',
    description: 'Comfortable hill-certified Innova Crysta with heating, luggage carrier, and snow chains for Gulmarg.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  });

  // KERALA
  insertTransport.run({
    id: 'trans_kerala_budget',
    destination_id: 'dest_kerala',
    name: 'Vande Bharat Express AC Chair Pass + Airport Shuttle',
    type: 'train',
    provider: 'Indian Railways & Kochi Transit',
    price: 2100,
    is_per_person: 1,
    tier: 'budget',
    description: 'High-speed executive rail transit between Kochi and Alleppey with scenic coastal window views.',
    image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_kerala_sedan',
    destination_id: 'dest_kerala',
    name: 'Private Dedicated AC Sedan (Dzire / Etios)',
    type: 'private_chauffeur',
    provider: 'Kerala Tourism Taxi Association',
    price: 7200,
    is_per_person: 0,
    tier: 'standard',
    description: 'Private chauffeur for complete tour: Kochi Airport pickup, Munnar tea hills, and Alleppey backwater drops.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_kerala_innova',
    destination_id: 'dest_kerala',
    name: 'Toyota Innova Crysta Dedicated Luxury SUV',
    type: 'private_chauffeur',
    provider: 'Kerala God’s Luxury Fleet',
    price: 12000,
    is_per_person: 0,
    tier: 'luxury',
    description: 'Premium captain-seat SUV with experienced multilingual driver, mineral water, and scenic tea plantation halts.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  });

  // RAJASTHAN
  insertTransport.run({
    id: 'trans_raj_budget',
    destination_id: 'dest_rajasthan',
    name: 'Vande Bharat / Shatabdi Express AC Chair Pass',
    type: 'train',
    provider: 'Indian Railways Premium Express',
    price: 2400,
    is_per_person: 1,
    tier: 'budget',
    description: 'Fast, punctually air-conditioned train travel between Delhi, Jaipur, and Ajmer with onboard breakfast.',
    image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_raj_cab',
    destination_id: 'dest_rajasthan',
    name: 'Royal Heritage AC Sedan (Dzire / Amaze) City Chauffeur',
    type: 'private_chauffeur',
    provider: 'Rajputana Tourist Cabs',
    price: 6800,
    is_per_person: 0,
    tier: 'standard',
    description: 'Dedicated air-conditioned vehicle covering Jaipur Amber Fort, City Palace, Hawa Mahal, and local bazaars.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_raj_luxury',
    destination_id: 'dest_rajasthan',
    name: 'Royal Executive Mercedes-Benz / Innova Crysta VIP Fleet',
    type: 'private_chauffeur',
    provider: 'Maharaja Luxury Transfers',
    price: 13500,
    is_per_person: 0,
    tier: 'luxury',
    description: 'VIP royal chauffeur service with cold towels, bottled mineral water, and palace gate priority access.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  });

  // HIMACHAL
  insertTransport.run({
    id: 'trans_himachal_budget',
    destination_id: 'dest_himachal',
    name: 'Volvo AC Semi-Sleeper Coach Pass (Delhi-Manali-Delhi)',
    type: 'train',
    provider: 'Himachal Volvo Express Lines',
    price: 2200,
    is_per_person: 1,
    tier: 'budget',
    description: 'Overnight luxury multi-axle AC Volvo with blanket, water, and smooth mountain suspension.',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_himachal_sedan',
    destination_id: 'dest_himachal',
    name: 'Private AC Sedan (Dzire / Etios) with Hill Driver',
    type: 'private_chauffeur',
    provider: 'Manali Valley Taxi Operators',
    price: 6800,
    is_per_person: 0,
    tier: 'standard',
    description: 'Experienced mountain driver covering Chandigarh/Kullu pickups, local Hadimba temple, and Solang Valley.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_himachal_suv',
    destination_id: 'dest_himachal',
    name: '4x4 Hill-Spec Toyota Innova Crysta SUV with Snow Chains',
    type: 'private_chauffeur',
    provider: 'Himachal Snow Patrol Cabs',
    price: 10500,
    is_per_person: 0,
    tier: 'luxury',
    description: 'High-clearance 4x4 SUV equipped with snow chains, permit assistance for Rohtang Pass, and roof rack.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  });

  // ANDAMAN
  insertTransport.run({
    id: 'trans_andaman_budget',
    destination_id: 'dest_andaman',
    name: 'Govt Inter-Island Passenger Ferry Pass',
    type: 'train',
    provider: 'Directorate of Shipping Services',
    price: 1400,
    is_per_person: 1,
    tier: 'budget',
    description: 'Economical scenic inter-island passenger vessel sailing between Port Blair, Havelock, and Neil Island.',
    image_url: 'https://images.unsplash.com/photo-1509059852396-148232455287?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_andaman_ferry',
    destination_id: 'dest_andaman',
    name: 'Makruzz High-Speed AC Catamaran Cruise Premium Pass',
    type: 'train',
    provider: 'Makruzz Luxury Ferries',
    price: 3600,
    is_per_person: 1,
    tier: 'standard',
    description: 'Premium AC catamaran ferry transfers between Port Blair, Havelock Island, and Neil Island with ocean views.',
    image_url: 'https://images.unsplash.com/photo-1509059852396-148232455287?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_andaman_luxury',
    destination_id: 'dest_andaman',
    name: 'Nautika Royal Class Private Lounge Cruise + Private Island AC Cab',
    type: 'train',
    provider: 'Nautika Island Cruise Lines',
    price: 6400,
    is_per_person: 1,
    tier: 'luxury',
    description: 'VIP Royal Class upper deck cabin cruise plus private dedicated AC cab waiting at each island jetty.',
    image_url: 'https://images.unsplash.com/photo-1509059852396-148232455287?auto=format&fit=crop&w=800&q=80',
  });

  // UTTARAKHAND
  insertTransport.run({
    id: 'trans_uttarakhand_budget',
    destination_id: 'dest_uttarakhand',
    name: 'Vande Bharat Express to Haridwar + Local Transit Pass',
    type: 'train',
    provider: 'Northern Railway & Rishikesh Transit',
    price: 1800,
    is_per_person: 1,
    tier: 'budget',
    description: 'Fast comfortable train travel from Delhi to Haridwar followed by pre-booked sharing transfer to Rishikesh.',
    image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_uttarakhand_cab',
    destination_id: 'dest_uttarakhand',
    name: 'Private AC Sedan (Dzire / Etios) Delhi-Rishikesh-Corbett',
    type: 'private_chauffeur',
    provider: 'Devbhoomi Travels',
    price: 5800,
    is_per_person: 0,
    tier: 'standard',
    description: 'Roundtrip chauffeur covering Delhi/Dehradun airport, river rafting points, and Corbett national park.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_uttarakhand_luxury',
    destination_id: 'dest_uttarakhand',
    name: 'Dedicated AC Toyota Innova Crysta SUV with Safari Transfers',
    type: 'private_chauffeur',
    provider: 'Himalayan Luxury Fleet',
    price: 9800,
    is_per_person: 0,
    tier: 'luxury',
    description: 'Spacious 7-seater AC SUV with professional chauffeur for the complete Delhi-Rishikesh-Jim Corbett circuit.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  });

  // DUBAI
  insertTransport.run({
    id: 'trans_dubai_budget',
    destination_id: 'dest_dubai',
    name: 'Dubai Metro Unlimited Gold Card + Shared Airport Shuttle',
    type: 'airport_shuttle',
    provider: 'Dubai RTA & Airport Coach',
    price: 3200,
    is_per_person: 1,
    tier: 'budget',
    description: 'Unlimited 7-day Gold Class Metro, Tram, and Bus pass covering Burj Khalifa, Marina, and Deira.',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_dubai_sedan',
    destination_id: 'dest_dubai',
    name: 'Private Chauffeur AC Sedan (Toyota Camry / Lexus ES)',
    type: 'private_chauffeur',
    provider: 'Dubai City Chauffeurs',
    price: 7500,
    is_per_person: 0,
    tier: 'standard',
    description: 'Private airport pickup & drop plus full-day Dubai city exploration in premium air-conditioned sedan.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  });
  insertTransport.run({
    id: 'trans_dubai_flight_cab',
    destination_id: 'dest_dubai',
    name: 'Direct Emirates / Air India Return Flights + Airport Transfers',
    type: 'flight_standard',
    provider: 'Emirates / Air India & Dubai RTA',
    price: 24500,
    is_per_person: 1,
    tier: 'luxury',
    description: 'Return international flight tickets with 30kg baggage plus luxury airport private transfer.',
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  });

  // 5. Packages (8 Complete Options - balanced with standard transport defaults)
  insertPackage.run({
    id: 'pkg_goa_sun_sand',
    destination_id: 'dest_goa',
    title: 'Goa Coastal Vibes, Shacks & Water Sports',
    subtitle: 'Sun-drenched beaches, Mandovi sunset cruises, and authentic beach shacks',
    description: 'Relax on sun-kissed beaches in North & South Goa, dive at Grande Island, and savor Goan curries.',
    default_nights: 4,
    default_travelers: 2,
    default_hotel_id: 'hotel_goa_standard',
    default_transport_id: 'trans_goa_cab',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['Best Seller', 'Beaches & Shacks', 'Water Sports', 'Customizable']),
  });
  insertPkgAct.run('pkg_goa_sun_sand', 'act_goa_cruise');
  insertPkgAct.run('pkg_goa_sun_sand', 'act_goa_scuba');

  insertPackage.run({
    id: 'pkg_kashmir_paradise',
    destination_id: 'dest_kashmir',
    title: 'Kashmir Paradise: Dal Lake & Gulmarg Snow',
    subtitle: 'Romantic shikara rides, houseboats, and Asia’s highest cable car',
    description: 'Stay in royal carved wooden houseboats on Dal Lake, ride the Gulmarg Gondola, and enjoy hot saffron Kahwa.',
    default_nights: 5,
    default_travelers: 2,
    default_hotel_id: 'hotel_kashmir_standard',
    default_transport_id: 'trans_kashmir_sedan',
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['Honeymoon Special', 'Snow & Mountains', 'Houseboat Stay', 'Scenic']),
  });
  insertPkgAct.run('pkg_kashmir_paradise', 'act_kashmir_shikara');
  insertPkgAct.run('pkg_kashmir_paradise', 'act_kashmir_gondola');

  insertPackage.run({
    id: 'pkg_kerala_backwaters',
    destination_id: 'dest_kerala',
    title: 'Kerala Greenery: Munnar Tea & Alleppey Houseboat',
    subtitle: 'Mist-clad hill stations, sprawling tea gardens, and peaceful lagoons',
    description: 'Wake up to tea garden valleys in Munnar, glide past swaying palms in a private Alleppey houseboat, and enjoy authentic Ayurveda.',
    default_nights: 5,
    default_travelers: 2,
    default_hotel_id: 'hotel_kerala_standard',
    default_transport_id: 'trans_kerala_sedan',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['Nature & Wellness', 'Houseboat Experience', 'Pure Veg / Jain Available']),
  });
  insertPkgAct.run('pkg_kerala_backwaters', 'act_kerala_houseboat');
  insertPkgAct.run('pkg_kerala_backwaters', 'act_kerala_tea_safari');

  insertPackage.run({
    id: 'pkg_rajasthan_royalty',
    destination_id: 'dest_rajasthan',
    title: 'Royal Rajasthan: Amber Fort & Lake Palaces',
    subtitle: 'Regal Rajputana grandeur, mirror palaces, and lakeside heritage havelis',
    description: 'Witness the sound and light show at Amber Fort, explore Udaipur’s Lake Pichola, and stay in restored royal palaces.',
    default_nights: 5,
    default_travelers: 2,
    default_hotel_id: 'hotel_raj_standard',
    default_transport_id: 'trans_raj_cab',
    image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['Heritage & Culture', 'Palace Stays', 'Family Friendly']),
  });
  insertPkgAct.run('pkg_rajasthan_royalty', 'act_raj_amber');

  insertPackage.run({
    id: 'pkg_himachal_alpine',
    destination_id: 'dest_himachal',
    title: 'Himachal Heights: Manali Solang & Pine Valleys',
    subtitle: 'High-altitude adventure, tandem paragliding, and snow peaks',
    description: 'Breathe crisp mountain air among apple orchards, fly over Solang Valley, and cross the engineering marvel of Atal Tunnel.',
    default_nights: 5,
    default_travelers: 2,
    default_hotel_id: 'hotel_himachal_standard',
    default_transport_id: 'trans_himachal_sedan',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['Adventure & Thrill', 'Snow Valleys', 'Youth Favorite']),
  });
  insertPkgAct.run('pkg_himachal_alpine', 'act_himachal_paragliding');

  insertPackage.run({
    id: 'pkg_andaman_islands',
    destination_id: 'dest_andaman',
    title: 'Andaman Tropical Dream: Havelock Island & Scuba',
    subtitle: 'Crystal turquoise waters, coral reefs, and Asia’s best beaches',
    description: 'Speed across the Bay of Bengal on high-speed catamarans, scuba dive with sea turtles at Nemo Reef, and lounge on Radhanagar Beach.',
    default_nights: 5,
    default_travelers: 2,
    default_hotel_id: 'hotel_andaman_standard',
    default_transport_id: 'trans_andaman_ferry',
    image_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['Island Escape', 'Coral Diving', 'Premium Beach']),
  });
  insertPkgAct.run('pkg_andaman_islands', 'act_andaman_scuba');

  insertPackage.run({
    id: 'pkg_uttarakhand_escape',
    destination_id: 'dest_uttarakhand',
    title: 'Uttarakhand Odyssey: Ganges Rafting & Corbett Safari',
    subtitle: 'Spiritual riverbanks, white water rapids, and jungle wilderness',
    description: 'Conquer Grade IV rapids on the Holy Ganges, attend evening Parmarth Niketan Ganga Aarti, and embark on a jungle tiger safari.',
    default_nights: 4,
    default_travelers: 2,
    default_hotel_id: 'hotel_uttarakhand_standard',
    default_transport_id: 'trans_uttarakhand_cab',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['Spiritual & Adventure', 'River Rafting', 'Wildlife Safari']),
  });
  insertPkgAct.run('pkg_uttarakhand_escape', 'act_uttarakhand_rafting');

  insertPackage.run({
    id: 'pkg_dubai_gateway',
    destination_id: 'dest_dubai',
    title: 'Dubai & Abu Dhabi: Desert Dunes & Futuristic Skylines',
    subtitle: 'International luxury getaway tailored for Indian travelers in INR',
    description: 'Ascend the Burj Khalifa, bash red desert dunes in 4x4 Land Cruisers, and marvel at the grand Sheikh Zayed Mosque.',
    default_nights: 5,
    default_travelers: 2,
    default_hotel_id: 'hotel_dubai_standard',
    default_transport_id: 'trans_dubai_sedan',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    tags: JSON.stringify(['International Favorite', 'Dune Bashing', 'Direct Flights']),
  });
  insertPkgAct.run('pkg_dubai_gateway', 'act_dubai_safari');

  // Initial Seed Booking
  insertBooking.run({
    id: 'book_in_01',
    booking_code: 'PKG-GOA-48291',
    package_id: 'pkg_goa_sun_sand',
    destination_name: 'Goa',
    traveler_name: 'Rohan Sharma (Pure Vegetarian)',
    traveler_email: 'rohan.sharma@example.com',
    travelers: 2,
    nights: 4,
    start_date: '2026-12-20',
    hotel_name: 'Sterling Goa Varca Palms Resort',
    hotel_tier: 'standard',
    transport_name: 'AC Sedan Airport Pickup & Sightseeing Cab (All Days)',
    activities_list: JSON.stringify([
      'Grande Island Scuba Dive & Dolphin Cruise',
      'Mandovi River Luxury Sunset Dinner Cruise',
    ]),
    final_total: 44765,
    price_per_traveler: 22383,
    status: 'confirmed',
    created_at: new Date().toISOString(),
  });
});

transaction();
console.log('Seeding completed successfully with 8 packages and INR currency!');
db.close();

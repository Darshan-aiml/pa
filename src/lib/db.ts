import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  Destination,
  Hotel,
  Activity,
  Transportation,
  BasePackage,
  BookingRecord,
  TierType,
} from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'package_pro.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    initializeSchema(dbInstance);
  }
  return dbInstance;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
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
      amenities TEXT NOT NULL, -- JSON array
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
      included_items TEXT NOT NULL, -- JSON array
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
      tags TEXT NOT NULL, -- JSON array
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
      activities_list TEXT NOT NULL, -- JSON array
      final_total REAL NOT NULL,
      price_per_traveler REAL NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Check if destinations table is empty; if so, populate initial seed data
  const countStmt = db.prepare('SELECT count(*) as count FROM destinations');
  const result = countStmt.get() as { count: number };
  if (result.count === 0) {
    seedInitialData(db);
  }
}

export function seedInitialData(db: Database.Database) {
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
    INSERT INTO transportation (id, destination_id, name, type, provider, price, is_per_person, description, image_url)
    VALUES (@id, @destination_id, @name, @type, @provider, @price, @is_per_person, @description, @image_url)
  `);

  const insertPackage = db.prepare(`
    INSERT INTO packages (id, destination_id, title, subtitle, description, default_nights, default_travelers, default_hotel_id, default_transport_id, image_url, tags)
    VALUES (@id, @destination_id, @title, @subtitle, @description, @default_nights, @default_travelers, @default_hotel_id, @default_transport_id, @image_url, @tags)
  `);

  const insertPkgAct = db.prepare(`
    INSERT INTO package_activities (package_id, activity_id) VALUES (?, ?)
  `);

  const transaction = db.transaction(() => {
    // 1. Destinations
    const destinations: Destination[] = [
      {
        id: 'dest_bali',
        name: 'Bali',
        country: 'Indonesia',
        region: 'Southeast Asia',
        description: 'Tropical paradise known for forested volcanic mountains, iconic rice paddies, beaches and coral reefs.',
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
        popular_season: 'April – October',
        currency: 'USD',
      },
      {
        id: 'dest_tokyo',
        name: 'Tokyo',
        country: 'Japan',
        region: 'East Asia',
        description: 'Dynamic metropolis blending ultramodern skyscrapers and tech subcultures with historic shrines and culinary artistry.',
        image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        popular_season: 'March – May & Sept – Nov',
        currency: 'USD',
      },
      {
        id: 'dest_paris',
        name: 'Paris',
        country: 'France',
        region: 'Western Europe',
        description: 'The City of Light, famed for haute couture, world-class art collections, romantic river cruises and cafe society.',
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
        popular_season: 'June – August & Spring',
        currency: 'USD',
      },
      {
        id: 'dest_swiss_alps',
        name: 'Swiss Alps (Interlaken & Zermatt)',
        country: 'Switzerland',
        region: 'Central Europe',
        description: 'Stunning peaks, pristine glacial lakes, scenic cogwheel trains and legendary alpine adventures.',
        image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
        popular_season: 'Dec – March & June – Sept',
        currency: 'USD',
      },
      {
        id: 'dest_cancun',
        name: 'Cancún & Riviera Maya',
        country: 'Mexico',
        region: 'North America / Caribbean',
        description: 'Turquoise Caribbean waters, ancient Mayan ruins, lush cenotes and world-class beachfront hospitality.',
        image_url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
        popular_season: 'December – April',
        currency: 'USD',
      },
    ];

    for (const d of destinations) {
      insertDest.run(d);
    }

    // 2. Hotels (Bali)
    insertHotel.run({
      id: 'hotel_bali_budget',
      destination_id: 'dest_bali',
      name: 'Ubud Jungle Sanctuary Retreat',
      tier: 'budget',
      stars: 3.5,
      rating: 4.4,
      price_per_night: 55,
      room_type: 'Deluxe Garden Room',
      amenities: JSON.stringify(['Free Wi-Fi', 'Swimming Pool', 'Tropical Breakfast', 'Shuttle to Ubud Market']),
      image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      address: 'Jalan Raya Sayan, Ubud, Bali',
    });
    insertHotel.run({
      id: 'hotel_bali_standard',
      destination_id: 'dest_bali',
      name: 'Seminyak Sands Boutique Resort',
      tier: 'standard',
      stars: 4.0,
      rating: 4.7,
      price_per_night: 135,
      room_type: 'Ocean Breeze King Suite',
      amenities: JSON.stringify(['Infinity Pool', 'Beach Access', 'Artisan Breakfast', 'Spa & Wellness', 'Cocktail Lounge']),
      image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      address: 'Petitenget Beachway, Seminyak, Bali',
    });
    insertHotel.run({
      id: 'hotel_bali_luxury',
      destination_id: 'dest_bali',
      name: 'The Royal Pita Maha Luxury Villas',
      tier: 'luxury',
      stars: 5.0,
      rating: 4.9,
      price_per_night: 320,
      room_type: 'Private Pool Cliff Villa',
      amenities: JSON.stringify(['Private Heated Pool', 'Butler Service', 'Ayung River Views', 'Fine Dining Pavilions', 'Yoga Sanctuary']),
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      address: 'Kedewatan Valley, Ubud, Bali',
    });
    insertHotel.run({
      id: 'hotel_bali_ultra',
      destination_id: 'dest_bali',
      name: 'Bulgari Resort Cliffside Palace',
      tier: 'ultra',
      stars: 5.0,
      rating: 4.98,
      price_per_night: 750,
      room_type: 'Ultra Panoramic Ocean Pavilion',
      amenities: JSON.stringify(['Private Helipad Transfer', 'Personal Chef', 'Private Incline Funicular', 'Champagne Bar', 'Dedicated Concierge 24/7']),
      image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      address: 'Goa Lempeh, Uluwatu, Bali',
    });

    // Hotels (Tokyo)
    insertHotel.run({
      id: 'hotel_tokyo_budget',
      destination_id: 'dest_tokyo',
      name: 'Asakusa Kaminarimon Inn',
      tier: 'budget',
      stars: 3.0,
      rating: 4.3,
      price_per_night: 75,
      room_type: 'Compact Modern Double',
      amenities: JSON.stringify(['High-Speed Wi-Fi', 'Subway Proximity', 'Complimentary Green Tea', 'Laundromat']),
      image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      address: 'Taito-ku, Asakusa, Tokyo',
    });
    insertHotel.run({
      id: 'hotel_tokyo_standard',
      destination_id: 'dest_tokyo',
      name: 'Shinjuku Granbell City Hotel',
      tier: 'standard',
      stars: 4.0,
      rating: 4.6,
      price_per_night: 165,
      room_type: 'Executive Skyline Room',
      amenities: JSON.stringify(['Rooftop Terrace Bar', 'City View Bathtub', 'Breakfast Buffet', 'Fitness Studio']),
      image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
      address: 'Kabukicho, Shinjuku, Tokyo',
    });
    insertHotel.run({
      id: 'hotel_tokyo_luxury',
      destination_id: 'dest_tokyo',
      name: 'The Peninsula Tokyo & Imperial Suites',
      tier: 'luxury',
      stars: 5.0,
      rating: 4.9,
      price_per_night: 460,
      room_type: 'Imperial Palace View Premier Suite',
      amenities: JSON.stringify(['Custom Rolls-Royce Fleet', 'Michelin Star Dining', 'Spa & Heated Indoor Pool', 'Nail & Tea Ceremonies']),
      image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      address: 'Yurakucho, Chiyoda-ku, Tokyo',
    });

    // Hotels (Paris)
    insertHotel.run({
      id: 'hotel_paris_budget',
      destination_id: 'dest_paris',
      name: 'Montmartre Bohemian Hotel',
      tier: 'budget',
      stars: 3.0,
      rating: 4.2,
      price_per_night: 85,
      room_type: 'Classic Parisian Twin/Double',
      amenities: JSON.stringify(['Free Wi-Fi', 'Near Metro', 'Fresh Croissant Breakfast']),
      image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      address: 'Rue Lepic, Montmartre, Paris',
    });
    insertHotel.run({
      id: 'hotel_paris_standard',
      destination_id: 'dest_paris',
      name: 'Le Marais Heritage Boutique',
      tier: 'standard',
      stars: 4.0,
      rating: 4.7,
      price_per_night: 190,
      room_type: 'Deluxe Courtyard King',
      amenities: JSON.stringify(['Boutique Courtyard', 'Espresso Lounge', 'Historic Architecture', 'Designer Toiletries']),
      image_url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80',
      address: 'Rue des Francs-Bourgeois, Le Marais, Paris',
    });
    insertHotel.run({
      id: 'hotel_paris_luxury',
      destination_id: 'dest_paris',
      name: 'Hôtel Plaza Athénée Haute Couture',
      tier: 'luxury',
      stars: 5.0,
      rating: 4.95,
      price_per_night: 680,
      room_type: 'Eiffel View Balcony Suite',
      amenities: JSON.stringify(['Direct Eiffel Tower Balcony', 'Dior Spa', 'Alain Ducasse Restaurant', 'Chauffeured Limousine']),
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      address: 'Avenue Montaigne, Paris',
    });

    // Hotels (Swiss Alps)
    insertHotel.run({
      id: 'hotel_swiss_budget',
      destination_id: 'dest_swiss_alps',
      name: 'Interlaken Backpacker Alpine Lodge',
      tier: 'budget',
      stars: 3.0,
      rating: 4.4,
      price_per_night: 95,
      room_type: 'Mountain View Standard Double',
      amenities: JSON.stringify(['Ski Storage', 'Free Mountain Bus Pass', 'Continental Breakfast', 'Mountain Terrace']),
      image_url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
      address: 'Höheweg 32, Interlaken',
    });
    insertHotel.run({
      id: 'hotel_swiss_standard',
      destination_id: 'dest_swiss_alps',
      name: 'Victoria-Jungfrau Alpine Chalet Hotel',
      tier: 'standard',
      stars: 4.5,
      rating: 4.8,
      price_per_night: 240,
      room_type: 'Jungfrau Panoramic Balcony Room',
      amenities: JSON.stringify(['Panoramic Spa', 'Indoor & Outdoor Thermal Pools', 'Swiss Fondue Parlour', 'Sauna']),
      image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
      address: 'Höheweg 41, Interlaken',
    });
    insertHotel.run({
      id: 'hotel_swiss_luxury',
      destination_id: 'dest_swiss_alps',
      name: 'The Omnia Zermatt Mountain Reserve',
      tier: 'luxury',
      stars: 5.0,
      rating: 4.96,
      price_per_night: 620,
      room_type: 'Matterhorn Peak Suite',
      amenities: JSON.stringify(['Direct Matterhorn Vista', 'Granite Indoor/Outdoor Pool', 'Open Fireplace Suite', 'Private Mountain Guides']),
      image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      address: 'Auf dem Fels, Zermatt',
    });

    // 3. Activities (Bali)
    insertActivity.run({
      id: 'act_bali_scuba',
      destination_id: 'dest_bali',
      name: 'Nusa Penida Manta Ray Scuba Dive',
      category: 'Adventure',
      duration_hours: 6.0,
      rating: 4.9,
      price_per_person: 110,
      description: 'Speedboat cruise to Manta Point with 2 guided boat dives amongst giant manta rays and vibrant coral gardens.',
      included_items: JSON.stringify(['Full Scuba Equipment', 'Lunch & Drinks', 'Marine Park Fees', 'PADI Certified Divemaster']),
      image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_bali_volcano',
      destination_id: 'dest_bali',
      name: 'Mount Batur Sunrise Volcano Trek',
      category: 'Adventure',
      duration_hours: 5.5,
      rating: 4.8,
      price_per_person: 65,
      description: 'Hike up an active volcano under starlight to watch the sunrise above the clouds, followed by volcanic hot springs.',
      included_items: JSON.stringify(['Hotel Transfers', 'Headlamp & Trekking Poles', 'Steam-Cooked Breakfast', 'Natural Hot Springs Entry']),
      image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_bali_temple',
      destination_id: 'dest_bali',
      name: 'Ubud Sacred Water Temple & Rice Terrace Tour',
      category: 'Cultural',
      duration_hours: 4.5,
      rating: 4.7,
      price_per_person: 45,
      description: 'Experience holy water purification at Tirta Empul and stroll through Tegallalang UNESCO rice terraces.',
      included_items: JSON.stringify(['Private Chauffeur Tour', 'Temple Sarong & Offerings', 'Local Coconut Tasting', 'Rice Terrace Access']),
      image_url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_bali_cooking',
      destination_id: 'dest_bali',
      name: 'Balinese Organic Farm Cooking Masterclass',
      category: 'Culinary',
      duration_hours: 4.0,
      rating: 4.9,
      price_per_person: 55,
      description: 'Pick fresh ingredients at an organic farm in Ubud and craft 6 authentic Balinese dishes with an award-winning chef.',
      included_items: JSON.stringify(['Farm Tour', 'Hands-on Cooking Station', 'Multi-course Lunch', 'Recipe Booklet & Apron']),
      image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_bali_spa',
      destination_id: 'dest_bali',
      name: 'Ayurvedic 3-Hour Floral Bath & Stone Massage',
      category: 'Wellness',
      duration_hours: 3.0,
      rating: 4.9,
      price_per_person: 80,
      description: 'Ultimate relaxation: traditional Balinese lulur scrub, warm river stone massage, and a riverfront petals bath.',
      included_items: JSON.stringify(['Herbal Welcome Drink', 'Aromatherapy Oils', 'Full Body Scrub', 'Petal Bath & Herbal Tea']),
      image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    });

    // Activities (Tokyo)
    insertActivity.run({
      id: 'act_tokyo_food_crawl',
      destination_id: 'dest_tokyo',
      name: 'Shinjuku Omoide Yokocho & Yakitori Food Crawl',
      category: 'Culinary',
      duration_hours: 3.5,
      rating: 4.9,
      price_per_person: 95,
      description: 'Walk through narrow lantern-lit alleyways tasting charcoal-grilled yakitori, gyoza, sake, and Michelin ramen.',
      included_items: JSON.stringify(['8 Food Tastings', '3 Craft Drinks & Sake', 'Bilingual Food Historian Guide', 'Small Group Cap']),
      image_url: 'https://images.unsplash.com/photo-1554502078-ef0fc409efce?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_tokyo_teamlab',
      destination_id: 'dest_tokyo',
      name: 'teamLab Planets Digital Art Immersive Pass',
      category: 'Sightseeing',
      duration_hours: 2.5,
      rating: 4.8,
      price_per_person: 50,
      description: 'Walk barefoot through water and immerse yourself in infinite crystalline rooms and blooming digital flora.',
      included_items: JSON.stringify(['VIP Express Entry Ticket', 'Locker Rental', 'Exclusive Exhibition Access']),
      image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_tokyo_sumo',
      destination_id: 'dest_tokyo',
      name: 'Sumo Morning Training & Chanko-Nabe Feast',
      category: 'Cultural',
      duration_hours: 3.0,
      rating: 4.85,
      price_per_person: 120,
      description: 'Watch professional sumo rikishi train intensely at an authentic stable, followed by a wrestler-style stew feast.',
      included_items: JSON.stringify(['Stable Access', 'Sumo Etiquette Briefing', 'Photo Opportunity', 'Hot Chanko-Nabe Lunch']),
      image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_tokyo_go_kart',
      destination_id: 'dest_tokyo',
      name: 'Tokyo Street Kart Circuit Experience',
      category: 'Adventure',
      duration_hours: 2.0,
      rating: 4.7,
      price_per_person: 85,
      description: 'Drive custom go-karts across Shibuya Crossing and Tokyo Tower in costume with local lead marshals.',
      included_items: JSON.stringify(['Costume Rental', 'Go-Kart Fuel & Insurance', 'Action Photo Package']),
      image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
    });

    // Activities (Paris)
    insertActivity.run({
      id: 'act_paris_louvre',
      destination_id: 'dest_paris',
      name: 'Louvre Masterpieces Skip-the-Line Guided Tour',
      category: 'Cultural',
      duration_hours: 3.0,
      rating: 4.8,
      price_per_person: 75,
      description: 'Bypass long queues to explore the Mona Lisa, Venus de Milo, and Winged Victory with an art historian.',
      included_items: JSON.stringify(['Priority Timed Entrance', 'Licensed Art Guide', 'Audio Headsets', 'Full Day Museum Access']),
      image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_paris_cruise',
      destination_id: 'dest_paris',
      name: 'Seine River Gourmet Champagne Dinner Cruise',
      category: 'Culinary',
      duration_hours: 2.5,
      rating: 4.9,
      price_per_person: 140,
      description: 'Float past illuminated Parisian monuments while dining on a 4-course French meal paired with fine wine.',
      included_items: JSON.stringify(['Window Seating Cruise', '4-Course Chef Menu', 'Half Bottle Champagne per person', 'Live Violinist']),
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    });

    // Activities (Swiss Alps)
    insertActivity.run({
      id: 'act_swiss_paragliding',
      destination_id: 'dest_swiss_alps',
      name: 'Tandem Paragliding over Interlaken Lakes',
      category: 'Adventure',
      duration_hours: 2.0,
      rating: 4.95,
      price_per_person: 195,
      description: 'Glide gently from Beatenberg with certified pilots enjoying bird-eye panoramas of Lake Thun and Jungfrau peak.',
      included_items: JSON.stringify(['Mountain Transport', 'Certified Tandem Pilot', 'Equipment & Helmet', 'Safety Briefing']),
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    });
    insertActivity.run({
      id: 'act_swiss_jungfrau',
      destination_id: 'dest_swiss_alps',
      name: 'Jungfraujoch - Top of Europe Cogwheel Train Expedition',
      category: 'Sightseeing',
      duration_hours: 6.0,
      rating: 4.9,
      price_per_person: 210,
      description: 'Ride the highest railway station in Europe at 3,454m, visit the Ice Palace, and marvel at the Aletsch Glacier.',
      included_items: JSON.stringify(['Eiger Express Gondola', 'Cogwheel Mountain Train Pass', 'Ice Palace Admission', 'Sphinx Observatory View']),
      image_url: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=800&q=80',
    });

    // 4. Transportation
    // Bali
    insertTransport.run({
      id: 'trans_bali_shuttle',
      destination_id: 'dest_bali',
      name: 'Airport Shuttle + Ride-Hailing Pass',
      type: 'airport_shuttle',
      provider: 'Bali Express Transfers',
      price: 35,
      is_per_person: 0,
      description: 'Roundtrip AC airport transfer directly to your hotel plus Grab vouchers for local trips.',
      image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    });
    insertTransport.run({
      id: 'trans_bali_chauffeur',
      destination_id: 'dest_bali',
      name: 'Private Dedicated Chauffeur & SUV (All Days)',
      type: 'private_chauffeur',
      provider: 'Bali Island Executive Fleet',
      price: 65, // per day equivalent or flat base package
      is_per_person: 0,
      description: 'English-speaking personal driver with private AC Toyota Innova SUV on-call 10 hours daily.',
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    });
    insertTransport.run({
      id: 'trans_bali_flight_std',
      destination_id: 'dest_bali',
      name: 'Roundtrip Economy Flights + Airport VIP Fast-Track',
      type: 'flight_standard',
      provider: 'Garuda Indonesia / Singapore Airlines',
      price: 450,
      is_per_person: 1,
      description: 'International flights with 23kg checked luggage and immigration fast-track assistance.',
      image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    });

    // Tokyo
    insertTransport.run({
      id: 'trans_tokyo_jrpass',
      destination_id: 'dest_tokyo',
      name: 'Unlimited Tokyo Metro & JR Shinkansen Regional Pass',
      type: 'train',
      provider: 'JR East & Tokyo Metro',
      price: 85,
      is_per_person: 1,
      description: 'Unlimited subway rides, Narita Express airport transfer, and Hakone bullet train excursion pass.',
      image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
    });
    insertTransport.run({
      id: 'trans_tokyo_flight_std',
      destination_id: 'dest_tokyo',
      name: 'Roundtrip Transpacific/International Flight (Economy)',
      type: 'flight_standard',
      provider: 'All Nippon Airways (ANA) / JAL',
      price: 680,
      is_per_person: 1,
      description: 'Direct flight with award-winning Japanese onboard catering, inflight entertainment and 2 free bags.',
      image_url: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
    });
    insertTransport.run({
      id: 'trans_tokyo_vip_car',
      destination_id: 'dest_tokyo',
      name: 'Tokyo Black Car Chauffeur Service',
      type: 'private_chauffeur',
      provider: 'Nihon Kotsu Executive',
      price: 320,
      is_per_person: 0,
      description: 'Private Alphard Luxury Van with professional chauffeur for smooth city navigation and airport transit.',
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    });

    // Paris
    insertTransport.run({
      id: 'trans_paris_flight_std',
      destination_id: 'dest_paris',
      name: 'Roundtrip Transatlantic Flight (Economy Plus)',
      type: 'flight_standard',
      provider: 'Air France',
      price: 550,
      is_per_person: 1,
      description: 'Direct CDG flight with premium economy legroom and checked baggage.',
      image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    });
    insertTransport.run({
      id: 'trans_paris_metro_pass',
      destination_id: 'dest_paris',
      name: 'Paris Visite Metro Pass & Airport RER',
      type: 'train',
      provider: 'RATP Paris',
      price: 60,
      is_per_person: 1,
      description: 'Zones 1-5 unlimited metro, bus, RER, funicular, and Charles de Gaulle airport connection.',
      image_url: 'https://images.unsplash.com/photo-1509059852396-148232455287?auto=format&fit=crop&w=800&q=80',
    });

    // Swiss Alps
    insertTransport.run({
      id: 'trans_swiss_pass',
      destination_id: 'dest_swiss_alps',
      name: 'Swiss Travel Pass (All-Inclusive)',
      type: 'train',
      provider: 'SBB Swiss Federal Railways',
      price: 280,
      is_per_person: 1,
      description: 'Unlimited travel on Swiss trains, mountain buses, lake steamers, and free admission to 500+ museums.',
      image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    });

    // 5. Predefined Packages
    // Bali Package
    insertPackage.run({
      id: 'pkg_bali_escape',
      destination_id: 'dest_bali',
      title: 'Bali Tropical Discovery & Culture',
      subtitle: 'The quintessential Indonesian getaway tailored for couples and friends',
      description: 'Immerse yourself in lush Ubud rice paddies, serene beachfront relaxing, authentic water temples, and tropical adventures.',
      default_nights: 5,
      default_travelers: 2,
      default_hotel_id: 'hotel_bali_standard',
      default_transport_id: 'trans_bali_shuttle',
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      tags: JSON.stringify(['Best Seller', 'Nature & Culture', 'Relaxation', 'Customizable']),
    });
    insertPkgAct.run('pkg_bali_escape', 'act_bali_temple');
    insertPkgAct.run('pkg_bali_escape', 'act_bali_cooking');

    // Tokyo Package
    insertPackage.run({
      id: 'pkg_tokyo_future',
      destination_id: 'dest_tokyo',
      title: 'Tokyo Neon, Gastronomy & Shrines',
      subtitle: 'Explore the culinary capital and neon heartbeat of Japan',
      description: 'From mouthwatering yakitori in hidden alleyways to digital art galleries and historic shrines, an unforgettable Japanese adventure.',
      default_nights: 6,
      default_travelers: 2,
      default_hotel_id: 'hotel_tokyo_standard',
      default_transport_id: 'trans_tokyo_jrpass',
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      tags: JSON.stringify(['Trending', 'Foodie Delight', 'Futuristic', 'Culture']),
    });
    insertPkgAct.run('pkg_tokyo_future', 'act_tokyo_food_crawl');
    insertPkgAct.run('pkg_tokyo_future', 'act_tokyo_teamlab');

    // Paris Package
    insertPackage.run({
      id: 'pkg_paris_romance',
      destination_id: 'dest_paris',
      title: 'Parisian Elegance & Art Immersion',
      subtitle: 'Classic romance, fine art, and Seine river gastronomy',
      description: 'Stroll cobblestone avenues in Le Marais, explore Louvre masterworks, and toast champagne gliding along the Seine at sunset.',
      default_nights: 4,
      default_travelers: 2,
      default_hotel_id: 'hotel_paris_standard',
      default_transport_id: 'trans_paris_metro_pass',
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      tags: JSON.stringify(['Romantic', 'Art & Museums', 'Wine & Dine']),
    });
    insertPkgAct.run('pkg_paris_romance', 'act_paris_louvre');
    insertPkgAct.run('pkg_paris_romance', 'act_paris_cruise');

    // Swiss Alps Package
    insertPackage.run({
      id: 'pkg_swiss_majesty',
      destination_id: 'dest_swiss_alps',
      title: 'Swiss Alpine Majesty & Glaciers',
      subtitle: 'Scenic railways, mountain heights and turquoise glacial lakes',
      description: 'Breathtaking peaks of Interlaken and Zermatt, scenic cogwheel trains, Swiss fondue, and exhilarating alpine panoramas.',
      default_nights: 5,
      default_travelers: 2,
      default_hotel_id: 'hotel_swiss_standard',
      default_transport_id: 'trans_swiss_pass',
      image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      tags: JSON.stringify(['Mountain Escape', 'Scenic Rail', 'Glaciers']),
    });
    insertPkgAct.run('pkg_swiss_majesty', 'act_swiss_jungfrau');

    // Sample initial booking for demonstration
    insertBooking(db, {
      id: 'book_sample_01',
      booking_code: 'PKG-78921-BALI',
      package_id: 'pkg_bali_escape',
      destination_name: 'Bali',
      traveler_name: 'Alex Morgan',
      traveler_email: 'alex.morgan@example.com',
      travelers: 2,
      nights: 5,
      start_date: '2026-12-10',
      hotel_name: 'The Royal Pita Maha Luxury Villas',
      hotel_tier: 'luxury',
      transport_name: 'Private Dedicated Chauffeur & SUV (All Days)',
      activities_list: JSON.stringify([
        'Nusa Penida Manta Ray Scuba Dive',
        'Mount Batur Sunrise Volcano Trek',
        'Ubud Sacred Water Temple & Rice Terrace Tour',
      ]),
      final_total: 2480,
      price_per_traveler: 1240,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    });
  });

  transaction();
}

function insertBooking(db: Database.Database, booking: BookingRecord) {
  const stmt = db.prepare(`
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
  stmt.run(booking);
}

// Helper query functions
export function getAllDestinations(): Destination[] {
  const db = getDb();
  return db.prepare('SELECT * FROM destinations ORDER BY name ASC').all() as Destination[];
}

export function getDestinationById(id: string): Destination | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM destinations WHERE id = ?').get(id) as Destination | undefined;
}

export function getHotelsForDestination(destinationId: string): Hotel[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM hotels WHERE destination_id = ? ORDER BY price_per_night ASC').all(destinationId) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    ...r,
    amenities: JSON.parse(r.amenities as string),
  })) as Hotel[];
}

export function getHotelById(id: string): Hotel | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM hotels WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    ...row,
    amenities: JSON.parse(row.amenities as string),
  } as Hotel;
}

export function getActivitiesForDestination(destinationId: string): Activity[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM activities WHERE destination_id = ? ORDER BY rating DESC').all(destinationId) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    ...r,
    included_items: JSON.parse(r.included_items as string),
  })) as Activity[];
}

export function getActivityById(id: string): Activity | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    ...row,
    included_items: JSON.parse(row.included_items as string),
  } as Activity;
}

export function getTransportationForDestination(destinationId: string): Transportation[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM transportation WHERE destination_id = ? ORDER BY price ASC').all(destinationId) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    ...r,
    is_per_person: Boolean(r.is_per_person),
    tier: (r.tier as TierType) || 'standard',
  })) as Transportation[];
}

export function getTransportationById(id: string): Transportation | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM transportation WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    ...row,
    is_per_person: Boolean(row.is_per_person),
    tier: (row.tier as TierType) || 'standard',
  } as Transportation;
}

export function getAllPackages(): BasePackage[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM packages').all() as Array<Record<string, unknown>>;

  return rows.map((r) => {
    const pkgId = r.id as string;
    const actRows = db.prepare('SELECT activity_id FROM package_activities WHERE package_id = ?').all(pkgId) as Array<{ activity_id: string }>;
    const default_activity_ids = actRows.map((a) => a.activity_id);

    const hotel = getHotelById(r.default_hotel_id as string);
    const transport = getTransportationById(r.default_transport_id as string);
    const destination = getDestinationById(r.destination_id as string);
    const activities = default_activity_ids.map((aid) => getActivityById(aid)).filter(Boolean) as Activity[];

    return {
      ...r,
      tags: JSON.parse(r.tags as string),
      default_activity_ids,
      hotel,
      transport,
      destination,
      activities,
    } as BasePackage;
  });
}

export function getPackageById(id: string): BasePackage | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM packages WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;

  const pkgId = row.id as string;
  const actRows = db.prepare('SELECT activity_id FROM package_activities WHERE package_id = ?').all(pkgId) as Array<{ activity_id: string }>;
  const default_activity_ids = actRows.map((a) => a.activity_id);

  const hotel = getHotelById(row.default_hotel_id as string);
  const transport = getTransportationById(row.default_transport_id as string);
  const destination = getDestinationById(row.destination_id as string);
  const activities = default_activity_ids.map((aid) => getActivityById(aid)).filter(Boolean) as Activity[];

  return {
    ...row,
    tags: JSON.parse(row.tags as string),
    default_activity_ids,
    hotel,
    transport,
    destination,
    activities,
  } as BasePackage;
}

export function saveBooking(booking: BookingRecord) {
  const db = getDb();
  const stmt = db.prepare(`
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
  stmt.run(booking);
  return booking;
}

export function getBookings(): BookingRecord[] {
  const db = getDb();
  return db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all() as BookingRecord[];
}

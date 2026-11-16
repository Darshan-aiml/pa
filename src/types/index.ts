export type TierType = 'budget' | 'standard' | 'luxury' | 'ultra';

export type ActivityCategory = 'Adventure' | 'Cultural' | 'Culinary' | 'Sightseeing' | 'Wellness' | 'Nightlife';

export type TransportType = 'flight_standard' | 'flight_business' | 'rental_car' | 'private_chauffeur' | 'train' | 'airport_shuttle';

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  image_url: string;
  popular_season: string;
  currency: string;
}

export interface Hotel {
  id: string;
  destination_id: string;
  name: string;
  tier: TierType;
  stars: number;
  rating: number;
  price_per_night: number;
  room_type: string;
  amenities: string[];
  image_url: string;
  address: string;
}

export interface Activity {
  id: string;
  destination_id: string;
  name: string;
  category: ActivityCategory;
  duration_hours: number;
  rating: number;
  price_per_person: number;
  description: string;
  included_items: string[];
  image_url: string;
}

export interface Transportation {
  id: string;
  destination_id: string;
  name: string;
  type: TransportType;
  provider: string;
  price: number; // Flat or per-traveler depending on is_per_person
  is_per_person: boolean;
  description: string;
  image_url: string;
  tier?: TierType;
}

export interface BasePackage {
  id: string;
  destination_id: string;
  title: string;
  subtitle: string;
  description: string;
  default_nights: number;
  default_travelers: number;
  default_hotel_id: string;
  default_transport_id: string;
  image_url: string;
  tags: string[];
  default_activity_ids: string[];
  hotel?: Hotel;
  transport?: Transportation;
  activities?: Activity[];
  destination?: Destination;
}

export interface PricingBreakdown {
  nights: number;
  travelers: number;
  rooms: number;
  hotel_price_per_night: number;
  hotel_subtotal: number;
  transport_subtotal: number;
  activities_subtotal: number;
  activities_count: number;
  raw_subtotal: number;
  bundle_discount: number; // e.g. 10% on activities if 3+ activities
  tax_amount: number; // 8% local tourism tax
  resort_fee: number; // $15 per room/night flat fee
  final_total: number;
  price_per_traveler: number;
  original_base_total?: number;
  savings_or_upgrade_diff?: number;
}

export interface CustomPackageConfiguration {
  package_id?: string;
  destination_id: string;
  nights: number;
  travelers: number;
  hotel_id: string;
  transport_id: string;
  activity_ids: string[];
  start_date?: string;
}

export interface BookingRecord {
  id: string;
  booking_code: string;
  package_id?: string;
  destination_name: string;
  traveler_name: string;
  traveler_email: string;
  travelers: number;
  nights: number;
  start_date: string;
  hotel_name: string;
  hotel_tier: string;
  transport_name: string;
  activities_list: string;
  final_total: number;
  price_per_traveler: number;
  status: 'confirmed' | 'pending' | 'customized';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: Record<string, unknown>;
  }>;
  packageUpdate?: {
    hotel_id?: string;
    add_activity_ids?: string[];
    remove_activity_ids?: string[];
    transport_id?: string;
    nights?: number;
    travelers?: number;
    destination_id?: string;
  };
  pricing?: PricingBreakdown;
  timestamp: string;
}

import { GoogleGenerativeAI, FunctionDeclaration, Tool, SchemaType } from '@google/generative-ai';
import {
  getAllDestinations,
  getHotelsForDestination,
  getActivitiesForDestination,
  getTransportationForDestination,
  getHotelById,
  getActivityById,
  getTransportationById,
  getPackageById,
} from './db';
import { calculateDynamicPricing } from './pricing';
import { formatINR } from './format';

// Tool Declarations for Gemini Function Calling
const searchDestinationsDeclaration: FunctionDeclaration = {
  name: 'search_destinations',
  description: 'Search for available travel destinations in PackagePro India (e.g. "Goa", "Kashmir", "Kerala", "Rajasthan", "beaches", "mountains", "tea gardens").',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: 'Search keyword for destination or travel theme',
      },
    },
    required: ['query'],
  },
};

const getAvailableHotelsDeclaration: FunctionDeclaration = {
  name: 'get_available_hotels',
  description: 'Retrieve real-time hotel options in Indian Rupees (₹) for a destination with price per night, star rating, tier (budget, standard, luxury, ultra) and amenities.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      destination_id: {
        type: SchemaType.STRING,
        description: 'Destination ID (e.g. dest_goa, dest_kashmir, dest_kerala, dest_rajasthan, dest_andaman)',
      },
      tier: {
        type: SchemaType.STRING,
        description: 'Optional filter by tier: "budget", "standard", "luxury", or "ultra"',
      },
    },
    required: ['destination_id'],
  },
};

const getAvailableActivitiesDeclaration: FunctionDeclaration = {
  name: 'get_available_activities',
  description: 'Retrieve available activities and experiences in Indian Rupees (₹) with price per person, duration, category (Adventure, Cultural, Culinary, Sightseeing, Wellness), and included items.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      destination_id: {
        type: SchemaType.STRING,
        description: 'Destination ID',
      },
      category: {
        type: SchemaType.STRING,
        description: 'Optional category filter: "Adventure", "Cultural", "Culinary", "Sightseeing", "Wellness"',
      },
    },
    required: ['destination_id'],
  },
};

const getTransportOptionsDeclaration: FunctionDeclaration = {
  name: 'get_transport_options',
  description: 'Retrieve available transportation options (flights, Innova Crysta private chauffeur, Vande Bharat Express train, airport transfer) in Indian Rupees (₹).',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      destination_id: {
        type: SchemaType.STRING,
        description: 'Destination ID',
      },
    },
    required: ['destination_id'],
  },
};

const customizePackageDeclaration: FunctionDeclaration = {
  name: 'customize_package',
  description: 'Apply user customizations to the active travel package. Modifies hotel, adds or removes activities, updates transport (e.g. Innova Crysta), changes duration or traveler count, and computes the exact backend price in INR.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      package_id: {
        type: SchemaType.STRING,
        description: 'Current package ID if based on a template',
      },
      destination_id: {
        type: SchemaType.STRING,
        description: 'Target destination ID',
      },
      hotel_id: {
        type: SchemaType.STRING,
        description: 'The selected hotel ID to set or upgrade to',
      },
      add_activity_ids: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Activity IDs to add to the package',
      },
      remove_activity_ids: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Activity IDs to remove from the package',
      },
      transport_id: {
        type: SchemaType.STRING,
        description: 'Selected transportation option ID',
      },
      nights: {
        type: SchemaType.NUMBER,
        description: 'Total duration in nights',
      },
      travelers: {
        type: SchemaType.NUMBER,
        description: 'Number of travelers',
      },
    },
    required: ['destination_id'],
  },
};

const calculatePricingDeclaration: FunctionDeclaration = {
  name: 'calculate_pricing',
  description: 'Executes the deterministic backend pricing engine to compute itemized costs in Indian Rupees (₹), 5% GST, bundle discounts, and price per traveler.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      hotel_id: { type: SchemaType.STRING },
      transport_id: { type: SchemaType.STRING },
      activity_ids: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      nights: { type: SchemaType.NUMBER },
      travelers: { type: SchemaType.NUMBER },
      package_id: { type: SchemaType.STRING },
    },
    required: ['hotel_id', 'transport_id', 'nights', 'travelers'],
  },
};

const geminiTools: Tool = {
  functionDeclarations: [
    searchDestinationsDeclaration,
    getAvailableHotelsDeclaration,
    getAvailableActivitiesDeclaration,
    getTransportOptionsDeclaration,
    customizePackageDeclaration,
    calculatePricingDeclaration,
  ],
};

// Dispatcher for Function Calling
export function executeFunctionCall(name: string, args: Record<string, unknown>): Record<string, unknown> {
  switch (name) {
    case 'search_destinations': {
      const q = String(args.query || '').toLowerCase();
      const all = getAllDestinations();
      const filtered = all.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
      return { destinations: filtered.length ? filtered : all };
    }

    case 'get_available_hotels': {
      const destId = String(args.destination_id);
      const tier = args.tier ? String(args.tier).toLowerCase() : undefined;
      let hotels = getHotelsForDestination(destId);
      if (tier) {
        hotels = hotels.filter((h) => h.tier.toLowerCase() === tier);
      }
      return { hotels };
    }

    case 'get_available_activities': {
      const destId = String(args.destination_id);
      const cat = args.category ? String(args.category).toLowerCase() : undefined;
      let activities = getActivitiesForDestination(destId);
      if (cat) {
        activities = activities.filter((a) => a.category.toLowerCase().includes(cat));
      }
      return { activities };
    }

    case 'get_transport_options': {
      const destId = String(args.destination_id);
      const transport = getTransportationForDestination(destId);
      return { transport_options: transport };
    }

    case 'customize_package': {
      const hotelId = args.hotel_id ? String(args.hotel_id) : undefined;
      const transportId = args.transport_id ? String(args.transport_id) : undefined;
      const addActs = Array.isArray(args.add_activity_ids) ? (args.add_activity_ids as string[]) : [];
      const removeActs = Array.isArray(args.remove_activity_ids) ? (args.remove_activity_ids as string[]) : [];
      const nights = args.nights ? Number(args.nights) : 4;
      const travelers = args.travelers ? Number(args.travelers) : 2;

      return {
        applied: true,
        summary: `Customization configured: Hotel=${hotelId || 'unchanged'}, Added activities=${addActs.join(', ') || 'none'}, Removed=${removeActs.join(', ') || 'none'}, Transport=${transportId || 'unchanged'}, Duration=${nights} nights, Travelers=${travelers}.`,
      };
    }

    case 'calculate_pricing': {
      const pricing = calculateDynamicPricing({
        hotel_id: String(args.hotel_id),
        transport_id: String(args.transport_id),
        activity_ids: Array.isArray(args.activity_ids) ? (args.activity_ids as string[]) : [],
        nights: Number(args.nights || 4),
        travelers: Number(args.travelers || 2),
        package_id: args.package_id ? String(args.package_id) : undefined,
      });
      return { pricing };
    }

    default:
      return { error: `Unknown function: ${name}` };
  }
}

export interface ChatRequestPayload {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentPackageState: {
    package_id?: string;
    destination_id: string;
    hotel_id: string;
    transport_id: string;
    activity_ids: string[];
    nights: number;
    travelers: number;
  };
}

export async function processAiTravelConcierge(payload: ChatRequestPayload) {
  const apiKey = process.env.GEMINI_API_KEY;

  const currentPkg = payload.currentPackageState;
  const currentHotel = getHotelById(currentPkg.hotel_id);
  const currentTransport = getTransportationById(currentPkg.transport_id);
  const currentActs = currentPkg.activity_ids.map((id) => getActivityById(id)).filter(Boolean);
  const currentPricing = calculateDynamicPricing(currentPkg);

  const contextSystemPrompt = `
You are the AI Travel Concierge for "PackagePro India", a dynamic travel package customization platform tailored for Indian travelers.
All pricing is in Indian Rupees (₹ / INR) and includes 5% GST and deterministic backend pricing.

CURRENT ACTIVE PACKAGE STATE:
- Destination ID: ${currentPkg.destination_id}
- Hotel: ${currentHotel ? `${currentHotel.name} (${currentHotel.tier.toUpperCase()}, ${formatINR(currentHotel.price_per_night)}/night)` : 'None'}
- Transportation: ${currentTransport ? `${currentTransport.name} (${formatINR(currentTransport.price)})` : 'None'}
- Activities (${currentActs.length}): ${currentActs.map((a) => a?.name).join(', ') || 'None'}
- Duration: ${currentPkg.nights} nights
- Travelers: ${currentPkg.travelers}
- Calculated Total Price: ${formatINR(currentPricing.final_total)} (${formatINR(currentPricing.price_per_traveler)} per person)

CRITICAL INSTRUCTIONS & ARCHITECTURE RULES:
1. Always format prices in Indian Rupees (₹) using Indian numbering system (e.g. ₹42,500, ₹1,20,000).
2. PackagePro uses strict backend dynamic pricing. You MUST NOT invent or hallucinate arbitrary prices. When recommending changes or calculating prices, use the function calling tools (e.g. get_available_hotels, get_available_activities, customize_package, calculate_pricing).
3. Cater to Indian traveler preferences: Pure Veg / Jain meal accommodations, Vande Bharat Express or Innova Crysta preferences, family & couple options.
4. When the user requests an upgrade or changes, invoke customize_package so the frontend updates in real time.
`;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        tools: [geminiTools],
        systemInstruction: contextSystemPrompt,
      });

      const chat = model.startChat({
        history: payload.history.map((h) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
      });

      let response = await chat.sendMessage(payload.message);
      let functionCalls = response.response.functionCalls();

      const executedToolCalls: Array<{
        name: string;
        args: Record<string, unknown>;
        result: Record<string, unknown>;
      }> = [];

      let updatedPackageState = { ...currentPkg };

      let iterations = 0;
      while (functionCalls && functionCalls.length > 0 && iterations < 3) {
        iterations++;
        const functionResponses = [];

        for (const call of functionCalls) {
          const callArgs = call.args as Record<string, unknown>;
          const result = executeFunctionCall(call.name, callArgs);
          executedToolCalls.push({
            name: call.name,
            args: callArgs,
            result,
          });

          if (call.name === 'customize_package') {
            if (callArgs.hotel_id) updatedPackageState.hotel_id = String(callArgs.hotel_id);
            if (callArgs.transport_id) updatedPackageState.transport_id = String(callArgs.transport_id);
            if (callArgs.nights) updatedPackageState.nights = Number(callArgs.nights);
            if (callArgs.travelers) updatedPackageState.travelers = Number(callArgs.travelers);
            if (Array.isArray(callArgs.add_activity_ids)) {
              for (const actId of callArgs.add_activity_ids as string[]) {
                if (!updatedPackageState.activity_ids.includes(actId)) {
                  updatedPackageState.activity_ids.push(actId);
                }
              }
            }
            if (Array.isArray(callArgs.remove_activity_ids)) {
              updatedPackageState.activity_ids = updatedPackageState.activity_ids.filter(
                (id) => !(callArgs.remove_activity_ids as string[]).includes(id)
              );
            }
          }

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: result,
            },
          });
        }

        response = await chat.sendMessage(functionResponses);
        functionCalls = response.response.functionCalls();
      }

      const freshPricing = calculateDynamicPricing(updatedPackageState);

      return {
        reply: response.response.text(),
        toolCalls: executedToolCalls,
        updatedPackageState,
        pricing: freshPricing,
      };
    } catch (err: unknown) {
      console.warn('Gemini API call error, utilizing local fallback simulator:', err);
    }
  }

  return runIntelligentFallback(payload.message, currentPkg);
}

function runIntelligentFallback(message: string, currentPkg: ChatRequestPayload['currentPackageState']) {
  const lower = message.toLowerCase();
  const destId = currentPkg.destination_id;
  const updatedPkg = { ...currentPkg, activity_ids: [...currentPkg.activity_ids] };
  const toolCalls: Array<{ name: string; args: Record<string, unknown>; result: Record<string, unknown> }> = [];

  const availableHotels = getHotelsForDestination(destId);
  const availableActs = getActivitiesForDestination(destId);
  const availableTransports = getTransportationForDestination(destId);

  let reply = '';

  if (lower.includes('luxury') || lower.includes('5-star') || lower.includes('5 star') || lower.includes('taj') || lower.includes('upgrade hotel')) {
    const luxuryHotel = availableHotels.find((h) => h.tier === 'luxury' || h.tier === 'ultra') || availableHotels[availableHotels.length - 1];
    if (luxuryHotel) {
      updatedPkg.hotel_id = luxuryHotel.id;
      toolCalls.push({
        name: 'customize_package',
        args: { hotel_id: luxuryHotel.id, destination_id: destId },
        result: { hotel_name: luxuryHotel.name, price_per_night: formatINR(luxuryHotel.price_per_night) },
      });
      reply = `Upgraded your stay to **${luxuryHotel.name}** (${formatINR(luxuryHotel.price_per_night)}/night). Our backend pricing engine has dynamically recalculated the package total with 5% GST!`;
    }
  } else if (lower.includes('budget') || lower.includes('zostel') || lower.includes('cheaper') || lower.includes('save money')) {
    const budgetHotel = availableHotels.find((h) => h.tier === 'budget') || availableHotels[0];
    if (budgetHotel) {
      updatedPkg.hotel_id = budgetHotel.id;
      toolCalls.push({
        name: 'customize_package',
        args: { hotel_id: budgetHotel.id, destination_id: destId },
        result: { hotel_name: budgetHotel.name, price_per_night: formatINR(budgetHotel.price_per_night) },
      });
      reply = `Switched to **${budgetHotel.name}** at ${formatINR(budgetHotel.price_per_night)}/night. Your overall package cost has significantly dropped!`;
    }
  } else if (lower.includes('scuba') || lower.includes('dive') || lower.includes('water sports')) {
    const scuba = availableActs.find((a) => a.id.includes('scuba') || a.name.toLowerCase().includes('scuba'));
    if (scuba && !updatedPkg.activity_ids.includes(scuba.id)) {
      updatedPkg.activity_ids.push(scuba.id);
      toolCalls.push({
        name: 'customize_package',
        args: { add_activity_ids: [scuba.id], destination_id: destId },
        result: { activity_added: scuba.name, price: formatINR(scuba.price_per_person) },
      });
      reply = `Added **${scuba.name}** (${formatINR(scuba.price_per_person)}/person)! Includes underwater HD video and Goan lunch. Package total updated.`;
    } else {
      reply = `The water sports experience is already part of your itinerary!`;
    }
  } else if (lower.includes('innova') || lower.includes('chauffeur') || lower.includes('crysta') || lower.includes('cab')) {
    const innova = availableTransports.find((t) => t.id.includes('innova') || t.type === 'private_chauffeur');
    if (innova) {
      updatedPkg.transport_id = innova.id;
      toolCalls.push({
        name: 'customize_package',
        args: { transport_id: innova.id, destination_id: destId },
        result: { transport_name: innova.name, price: formatINR(innova.price) },
      });
      reply = `Switched your transport to **${innova.name}** (${formatINR(innova.price)}). You have a dedicated AC vehicle and verified chauffeur for your entire trip.`;
    }
  } else if (lower.includes('gondola') || lower.includes('shikara') || lower.includes('houseboat')) {
    const highlight = availableActs.find((a) => a.name.toLowerCase().includes('gondola') || a.name.toLowerCase().includes('shikara') || a.name.toLowerCase().includes('houseboat'));
    if (highlight && !updatedPkg.activity_ids.includes(highlight.id)) {
      updatedPkg.activity_ids.push(highlight.id);
      toolCalls.push({
        name: 'customize_package',
        args: { add_activity_ids: [highlight.id], destination_id: destId },
        result: { activity_added: highlight.name, price: formatINR(highlight.price_per_person) },
      });
      reply = `Added the iconic **${highlight.name}** (${formatINR(highlight.price_per_person)}/person)! Your itinerary and pricing are updated.`;
    } else {
      reply = `This experience is already included in your package!`;
    }
  } else {
    toolCalls.push({
      name: 'calculate_pricing',
      args: { ...updatedPkg },
      result: { status: 'Pricing verified against SQLite database in INR' },
    });
    reply = `Namaste! I'm your PackagePro AI Concierge. I can upgrade your hotel to luxury resorts like Taj, add experiences (scuba diving, Gulmarg Gondola, Shikara rides, Alleppey houseboats), switch transport to an Innova Crysta, or cater to Pure Veg/Jain requirements. What's your travel plan?`;
  }

  const freshPricing = calculateDynamicPricing(updatedPkg);

  return {
    reply,
    toolCalls,
    updatedPackageState: updatedPkg,
    pricing: freshPricing,
  };
}

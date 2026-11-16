# PackagePro Enterprise ✈️
### AI-Powered Dynamic Travel Package Customization Platform
*Engineered following Meta's Design System (`meta/astryx`) & Production Architectural Standards*

PackagePro solves the core limitation of modern travel booking: traditional platforms provide rigid, take-it-or-leave-it packages that fail to match individual budgets, travel party sizes, or preferences.

Built with **Meta's Astryx Design System (`@astryxdesign/core`, `@astryxdesign/theme-neutral`)**, **Next.js 15**, **React 19**, **Google Gemini Function Calling**, and **SQLite**, PackagePro transforms trip planning into an enterprise-grade dynamic studio with real-time component swapping and deterministic pricing in **Indian Rupees (₹ / INR)**.

---

## 🏛️ The Four-Tier Enterprise Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. PRESENTATION LAYER                           │
│  Meta Astryx Design System • Next.js 15 • React 19 • Tailwind CSS     │
│  - Meta-grade Top Navigation with Workspace Switcher & Status Rail     │
│  - 8-Package Marketplace with Faceted Region & Travel Style Filters    │
│  - Interactive Studio (Hotel Tier Swapping, Excursions, Cabs, Transit) │
│  - Itemized Financial Ledger with 5% GST & Activity Bundle Discounts   │
│  - Dockable Gemini AI Travel Concierge Console with Tool Telemetry     │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │ HTTP / REST / JSON
┌────────────────────────────────────▼───────────────────────────────────┐
│                        2. APPLICATION LAYER                            │
│  Next.js App Router API Handlers (/api/ai/chat, /api/pricing, etc.)    │
│  - Google Gemini API with Function Calling & Tool Declarations         │
│  - Dispatches calls (search_destinations, customize_package, etc.)    │
│  - PNR Voucher Generator & Booking Audit Trail Coordinator             │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                       3. BUSINESS LOGIC LAYER                          │
│  src/lib/pricing.ts (Deterministic Dynamic Pricing Engine)             │
│  - Room Allocation: ceil(travelers / 2)                                │
│  - Hotel Subtotal: Nightly Rate * Nights * Rooms                       │
│  - Transport: Flights / Innova Crysta Cab / Vande Bharat Express       │
│  - 10% Bundle Discount automatically applied on 3+ activities          │
│  - 5% Tour Package GST + State Tourism Surcharges in ₹ INR             │
│  - Zero-Hallucination Guarantee: AI never invents currency figures     │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │ SQL Queries (WAL Mode)
┌────────────────────────────────────▼───────────────────────────────────┐
│                         4. DATABASE LAYER                              │
│  SQLite (better-sqlite3)                                               │
│  - Relational Schema: destinations, hotels, activities, transport,     │
│    packages, package_activities, and bookings audit log               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🌴 Curated Holiday Packages (8 Options)

| # | Package Title | Destination & Region | Starting Price (₹) | Key Highlights |
|---|---|---|---|---|
| 1 | **Goa Coastal Vibes, Shacks & Water Sports** | Goa (West Coast) | ₹44,765 for 2 | Grande Island Scuba diving, Mandovi sunset dinner cruise, beach shacks |
| 2 | **Kashmir Paradise: Dal Lake & Gulmarg Snow** | Kashmir (Himalayas) | ₹68,425 for 2 | Dal Lake carved houseboats, Gulmarg Gondola Phase 2, saffron Kahwa |
| 3 | **Kerala Greenery: Munnar Tea & Alleppey Houseboat** | Kerala (South India) | ₹63,910 for 2 | Private AC Alleppey houseboat, Munnar tea plantation 4x4 safari, Ayurveda |
| 4 | **Royal Rajasthan: Amber Fort & Lake Palaces** | Rajasthan (North) | ₹50,365 for 2 | Amber Fort light show, Udaipur Pichola Lake view palace, heritage havelis |
| 5 | **Himachal Heights: Manali Solang & Pine Valleys** | Himachal (Himalayas) | ₹43,855 for 2 | Solang Valley tandem paragliding, Atal Tunnel, cedar pine forest cottages |
| 6 | **Andaman Tropical Dream: Havelock Island & Scuba** | Andaman (Bay of Bengal) | ₹56,665 for 2 | Makruzz catamaran ferry, Nemo Reef coral diving, Radhanagar white sands |
| 7 | **Uttarakhand Odyssey: Ganges Rafting & Corbett Safari** | Uttarakhand (Foothills) | ₹38,990 for 2 | 16km Ganges white water rafting, Jim Corbett tiger safari, Ganga Aarti |
| 8 | **Dubai & Abu Dhabi: Dunes & Futuristic Skylines** | Dubai (Ex-India) | ₹1,30,795 for 2 | Return Emirates flights, 4x4 red desert dune safari, Burj Khalifa |

---

## 🤖 Gemini Function Calling in Action

When users interact with the AI Concierge (e.g., *"Upgrade my Goa stay to 5-star Taj luxury and switch transport to an Innova Crysta"*):
1. **Tool Invocation:** Gemini parses traveler intent and executes `customize_package(hotel_id, transport_id)`.
2. **Deterministic Recalculation:** The backend pricing logic computes the mathematical diff with 5% GST in ₹.
3. **Reactive UI Sync:** The customizer studio reflects the upgrade instantly on the canvas, locking in the price without hallucination.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start production server
npm start
```
Visit **`http://localhost:3000`** (or `http://localhost:3001`).

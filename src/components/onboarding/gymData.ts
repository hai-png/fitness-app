/**
 * gymData
 *
 * Static data + types shared across the gym-selection sub-components
 * (StepGymSelection, GymMap, MachinePicker). Extracted from the original
 * Onboarding.tsx so each component can import only what it needs without
 * creating a runtime cycle (these are pure data, no React).
 */

/** A nearby commercial gym option shown on the interactive map + card list. */
export interface GymOption {
  id: string;
  name: string;
  distance: string;
  rating: number;
  address: string;
  description: string;
  image: string;
  defaultMachines: string[];
  coordinates: { x: number; y: number };
}

/** A single machine entry inside a MACHINE_CATEGORIES bucket. */
export interface MachineDef {
  name: string;
  desc: string;
}

/**
 * The four curated nearby gyms rendered on the interactive SVG map and the
 * card list below it. Coordinates are expressed in the 0–100 viewBox space
 * of the map.
 */
export const NEARBY_GYMS: GymOption[] = [
  {
    id: "gym-1",
    name: "Titan Iron Academy",
    distance: "0.4 miles away",
    rating: 4.9,
    address: "244 Heavy Metal Lane, District 4",
    description:
      "Hardcore powerlifting & bodybuilding sanctuary. Famous for its pristine equipment.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80",
    defaultMachines: [
      "Smith Machine",
      "Leg Press Machine",
      "Hack Squat",
      "Seated Row Machine",
      "Lat Pulldown",
      "Cable Crossover",
      "Pec Deck / Rear Delt Fly",
    ],
    coordinates: { x: 35, y: 40 },
  },
  {
    id: "gym-2",
    name: "Pulse Athletic Club",
    distance: "1.2 miles away",
    rating: 4.7,
    address: "902 Wellness Blvd, Aether Plaza",
    description:
      "Luxury modern athletic center focusing on functional performance and high-end selectors.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=80",
    defaultMachines: [
      "Smith Machine",
      "Cable Crossover",
      "Lat Pulldown",
      "Leg Extension Machine",
      "Lying Leg Curl Machine",
      "Chest Press Machine",
    ],
    coordinates: { x: 75, y: 25 },
  },
  {
    id: "gym-3",
    name: "Metro Flex Gym",
    distance: "2.1 miles away",
    rating: 4.8,
    address: "410 Barbells Way, Industrial Sector",
    description:
      "No-nonsense bodybuilding temple equipped with vintage and plate-loaded heavy machinery.",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80",
    defaultMachines: [
      "Hack Squat",
      "Smith Machine",
      "Leg Press Machine",
      "Lying Leg Curl Machine",
      "Seated Row Machine",
      "Pec Deck / Rear Delt Fly",
    ],
    coordinates: { x: 20, y: 80 },
  },
  {
    id: "gym-4",
    name: "Aura Fit Studio",
    distance: "3.5 miles away",
    rating: 4.6,
    address: "12 Boutique Circle, Green Hills",
    description:
      "High-end coaching studio specializing in strength, aesthetics, and high-tech conditioning.",
    image:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&auto=format&fit=crop&q=80",
    defaultMachines: ["Cable Crossover", "Smith Machine", "Lat Pulldown", "Leg Extension Machine"],
    coordinates: { x: 80, y: 70 },
  },
];

/**
 * Machine catalog grouped by movement category (Push / Pull / Legs / Arms).
 * Rendered as a checklist in the MachinePicker component so users can
 * fine-tune which machines are available at their selected gym.
 */
export const MACHINE_CATEGORIES: Record<string, MachineDef[]> = {
  Push: [
    { name: "Smith Machine", desc: "For secure heavy chest presses & controlled squats" },
    { name: "Chest Press Machine", desc: "Isolates the pectoral muscles under stable load" },
    {
      name: "Pec Deck / Rear Delt Fly",
      desc: "For safe chest flyes and posterior deltoid training",
    },
  ],
  Pull: [
    { name: "Lat Pulldown", desc: "Prime compound vertical pull for back widening" },
    { name: "Seated Row Machine", desc: "Isolates the latissimus dorsi & middle back muscles" },
    {
      name: "Cable Crossover",
      desc: "Provides constant cable tension for chest and arm exercises",
    },
  ],
  Legs: [
    { name: "Leg Press Machine", desc: "Heavy quadriceps and glute compound loading" },
    { name: "Hack Squat", desc: "Decompresses spine while building massive quadricep force" },
    { name: "Leg Extension Machine", desc: "Isolated single-joint quadricep builder" },
    { name: "Lying Leg Curl Machine", desc: "Isolated single-joint hamstring builder" },
  ],
  Arms: [{ name: "Preacher Curl Bench", desc: "Pins the biceps for ultimate peak contractions" }],
};

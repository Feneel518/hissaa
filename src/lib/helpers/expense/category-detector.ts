// Smart rule-based expense category detector
// Covers 95% of common cases without any external API.
// Pattern: keywords (lowercase) → category name

export type ExpenseCategory = {
  name: string;
  icon: string;
  color: string;      // Tailwind bg color class
  textColor: string;  // Tailwind text color class
  keywords: string[];
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    name: "Food & Dining",
    icon: "🍕",
    color: "bg-orange-100 dark:bg-orange-950/40",
    textColor: "text-orange-600 dark:text-orange-400",
    keywords: [
      "food", "dinner", "lunch", "breakfast", "restaurant", "pizza", "burger",
      "biryani", "sushi", "Chinese", "italian", "café", "cafe", "coffee",
      "tea", "snack", "meal", "eating", "swiggy", "zomato", "domino",
      "mcdonalds", "mcd", "kfc", "subway", "starbucks", "hotel food",
      "dhaba", "thali", "chaiwala", "ice cream", "dessert", "bakery",
      "juice", "dine", "take out", "takeout", "delivery", "bbq", "barbeque",
      "noodles", "pasta", "tiffin", "canteen",
    ],
  },
  {
    name: "Transport",
    icon: "🚕",
    color: "bg-blue-100 dark:bg-blue-950/40",
    textColor: "text-blue-600 dark:text-blue-400",
    keywords: [
      "uber", "ola", "cab", "taxi", "auto", "rickshaw", "rapido", "lift",
      "ride", "petrol", "fuel", "diesel", "cng", "parking", "toll",
      "bus", "train", "metro", "railway", "irctc", "flight", "airways",
      "indigo", "spicejet", "vistara", "air india", "airport", "ferry",
      "bike", "scooter", "electric vehicle", "ev", "vehicle", "car",
      "transport", "commute", "travel pass", "monthly pass", "ticket",
    ],
  },
  {
    name: "Groceries",
    icon: "🛒",
    color: "bg-green-100 dark:bg-green-950/40",
    textColor: "text-green-600 dark:text-green-400",
    keywords: [
      "grocery", "groceries", "supermarket", "vegetables", "fruits", "sabzi",
      "market", "kirana", "big basket", "bigbasket", "d-mart", "dmart",
      "reliance fresh", "more", "blinkit", "dunzo", "zepto", "milk",
      "eggs", "bread", "grains", "rice", "dal", "pulses", "atta", "flour",
      "oil", "spices", "masala", "provisions",
    ],
  },
  {
    name: "Entertainment",
    icon: "🎬",
    color: "bg-purple-100 dark:bg-purple-950/40",
    textColor: "text-purple-600 dark:text-purple-400",
    keywords: [
      "movie", "cinema", "pvr", "inox", "netflix", "hotstar", "disney",
      "amazon prime", "spotify", "youtube premium", "concert", "show",
      "event", "theatre", "game", "gaming", "playstation", "xbox",
      "steam", "fun", "outing", "recreation", "bowling", "karaoke",
      "amusement", "park", "zoo", "museum", "club", "bar", "pub",
    ],
  },
  {
    name: "Rent & Utilities",
    icon: "🏠",
    color: "bg-gray-100 dark:bg-gray-800/60",
    textColor: "text-gray-600 dark:text-gray-300",
    keywords: [
      "rent", "house rent", "pg", "paying guest", "electricity", "electric",
      "power bill", "water bill", "gas", "lpg", "cylinder", "internet",
      "wifi", "broadband", "airtel", "jio fiber", "bsnl", "mobile bill",
      "recharge", "postpaid", "maintenance", "society", "apartment",
      "landlord", "deposit", "lease", "utility",
    ],
  },
  {
    name: "Health",
    icon: "🏥",
    color: "bg-red-100 dark:bg-red-950/40",
    textColor: "text-red-600 dark:text-red-400",
    keywords: [
      "medicine", "medical", "doctor", "hospital", "clinic", "pharmacy",
      "chemist", "health", "consultation", "lab", "test", "blood test",
      "prescription", "tablet", "capsule", "injection", "surgery",
      "dental", "eye", "gym", "fitness", "yoga", "workout", "protein",
      "supplement", "apollo", "medplus", "netmeds", "1mg", "practo",
    ],
  },
  {
    name: "Travel",
    icon: "✈️",
    color: "bg-sky-100 dark:bg-sky-950/40",
    textColor: "text-sky-600 dark:text-sky-400",
    keywords: [
      "trip", "vacation", "holiday", "hotel", "resort", "hostel", "airbnb",
      "booking", "oyo", "goibibo", "makemytrip", "yatra", "tour",
      "tourism", "sightseeing", "visa", "passport", "international",
      "domestic", "flight booking", "bus booking", "train booking",
      "goa", "manali", "himalaya", "beach", "adventure", "trekking",
    ],
  },
  {
    name: "Shopping",
    icon: "🛍️",
    color: "bg-pink-100 dark:bg-pink-950/40",
    textColor: "text-pink-600 dark:text-pink-400",
    keywords: [
      "shopping", "amazon", "flipkart", "meesho", "myntra", "ajio",
      "clothes", "clothing", "shoes", "footwear", "bag", "watch",
      "jewellery", "accessories", "electronics", "mobile", "laptop",
      "gadget", "appliance", "furniture", "decor", "gift", "present",
      "purchase", "bought",
    ],
  },
  {
    name: "Education",
    icon: "📚",
    color: "bg-yellow-100 dark:bg-yellow-950/40",
    textColor: "text-yellow-600 dark:text-yellow-500",
    keywords: [
      "course", "education", "tuition", "coaching", "class", "school",
      "college", "university", "fees", "admission", "book", "stationery",
      "notebook", "pen", "study", "exam", "udemy", "coursera",
      "unacademy", "byjus", "byju", "vedantu", "skillshare",
    ],
  },
  {
    name: "Other",
    icon: "💡",
    color: "bg-muted",
    textColor: "text-muted-foreground",
    keywords: [],
  },
];

export const DEFAULT_CATEGORY = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]; // "Other"

/**
 * Rule-based category detection from expense title.
 * Runs entirely client-side / server-side with no external API.
 * Returns null if title is empty or too short.
 */
export function detectCategoryFromTitle(title: string): ExpenseCategory | null {
  if (!title || title.trim().length < 2) return null;

  const normalized = title.toLowerCase().trim();

  for (const category of EXPENSE_CATEGORIES) {
    if (category.keywords.length === 0) continue; // skip "Other"
    for (const keyword of category.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return DEFAULT_CATEGORY;
}

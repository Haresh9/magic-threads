export interface Product {
  id: string;
  name: string;
  category: 'chaniya-choli' | 'home-decor' | 'cushion-covers';
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  images?: string[];
  video?: string;
  description: string;
  fabric: string;
  workType: string;
  flare: string;
  blouse: string;
  dupatta: string;
  isAvailable: boolean;
  tag?: string;
  weight?: string;
  // Detailed specifications (Optional)
  lehengaDetails?: {
    fabric?: string;
    color?: string;
    flair?: string;
    waist?: string;
    length?: string;
    work?: string;
  };
  blouseDetails?: {
    fabric?: string;
    color?: string;
    style?: string;
    sleeves?: string;
    size?: string;
    work?: string;
  };
  dupattaDetails?: {
    fabric?: string;
    color?: string;
    length?: string;
    work?: string;
  };
  highlights?: string[];
  careInstructions?: string[];
  note?: string;
  styleStatement?: string;
  created_at?: string;
}

export const products: Product[] = [
  {
    id: "nh-04",
    name: "Sunlit Elegance Designer Chaniya Choli Set (NH04)",
    category: "chaniya-choli",
    price: 3800,
    originalPrice: 5999,
    discount: 37,
    image: "/images/NH04.png",
    description: "Celebrate the vibrant spirit of Navratri with this graceful designer Chaniya Choli set, beautifully crafted in a stunning combination of Mustard Yellow, Ivory White, and Deep Mehendi Green. The rich embroidered dupatta paired with a contemporary color-block lehenga creates an elegant yet festive look, making it a perfect choice for Garba, Dandiya nights, festive celebrations, and wedding functions.",
    fabric: "Premium Cotton Blend",
    workType: "Designer Lace Border & Mirror Work",
    flare: "Approx. 5.5 – 6.0 Meters",
    blouse: "V-Neck Designer Blouse with Silver Embroidery",
    dupatta: "Deep Mehendi Green bandhej with mirror work allover",
    isAvailable: true,
    tag: "Festive Pick",
    lehengaDetails: {
      fabric: "Premium Cotton Blend",
      color: "Mustard Yellow & Ivory White",
      flair: "Approx. 5.5 – 6.0 Meters",
      waist: "Fits up to 40 inches",
      length: "42 inches",
      work: "Designer lace border with elegant finishing"
    },
    blouseDetails: {
      fabric: "Premium Cotton Silk Blend",
      color: "Mustard Yellow with Silver Embroidery",
      style: "V-Neck Designer Blouse",
      sleeves: "Half Sleeves",
      size: "Stitched (Customizable as per availability)",
      work: "Intricate embroidered neckline and sleeves"
    },
    dupattaDetails: {
      fabric: "Premium Jacquard / Banarasi Weave",
      color: "Deep Mehendi Green bandhej with mirror work allover",
      length: "Approx. 2.3–2.5 Meters",
      work: "Rich traditional woven motifs, intricate geometric patterns, and designer woven border with premium finish"
    },
    highlights: [
      "Elegant festive colour combination",
      "Comfortable and lightweight fabric",
      "Premium embroidered blouse",
      "Rich designer woven dupatta",
      "Perfect for Navratri, Garba, Wedding Functions & Festive Occasions",
      "Excellent fall and graceful silhouette"
    ],
    careInstructions: [
      "Dry Clean Only",
      "Do Not Machine Wash",
      "Do Not Bleach",
      "Steam or Low Heat Iron Recommended",
      "Store in a cool, dry place",
      "Keep away from direct sunlight for prolonged periods"
    ],
    note: "📌 The displayed image is AI-generated for presentation purposes. Actual product colours, embroidery patterns, lace, borders, and fabric shades may vary slightly due to lighting, photography, screen resolution, and manufacturing variations.",
    styleStatement: "Step into every celebration with timeless elegance, vibrant colours, and the charm of traditional craftsmanship."
  },
  {
    id: "nh-09",
    name: "Vibrant Guler Kathiawadi Chaniya Choli (NH09)",
    category: "chaniya-choli",
    price: 8499,
    originalPrice: 13999,
    discount: 39,
    image: "/images/NH09.png",
    images: [
      "/images/NH09.png",
      "/images/NH09-1.jpeg",
      "/images/NH09-2.jpeg",
      "/images/NH09-3.jpeg",
      "/images/NH09-4.jpeg",
      "/images/NH09-5.jpeg"
    ],
    video: "/videos/NH09.mp4",
    description: "An absolute masterpiece for Navratri! This gorgeous Kathiawadi-style cotton Chaniya Choli features detailed traditional mirror work and vibrant patch embroidery. Includes a massive flare designed for spectacular twirls during Garba.",
    fabric: "Premium Heavy Cotton",
    workType: "Authentic Gujarati Patchwork, Real Mirror Work, and Handloom Borders",
    flare: "7.0 Meters Double-Layer Flare",
    blouse: "Fully Stitched (Size 38-42 adjustable)",
    dupatta: "2.3 Meters Cotton Dupatta with Wool Tassels",
    isAvailable: true,
    tag: "Navratri Special"
  },
  {
    id: "nh-12",
    name: "Royal Peacock Blue Chikankari Chaniya Choli (NH12)",
    category: "chaniya-choli",
    price: 12999,
    originalPrice: 19999,
    discount: 35,
    image: "/images/NH121.jpg",
    images: [
      "/images/NH121.jpg",
      "/images/NH122.jpg",
      "/images/NH123.jpg",
      "/images/NH124.jpg",
      "/images/NH125.jpg"
    ],
    video: "/videos/NH12.mp4",
    description: "Elegant and modern royal peacock blue designer Chaniya Choli. Showcasing exquisite Lucknowi Chikankari embroidery interspersed with delicate sequins. Perfect for wedding receptions, sangeet, and high-fashion festivals.",
    fabric: "Premium Faux Georgette & Silk Lining",
    workType: "Detailed Lucknowi Chikankari work with Sparkly Sequin embellishments",
    flare: "6.5 Meters Ghera",
    blouse: "Semi-stitched (customizable up to Bust size 44)",
    dupatta: "2.4 Meters Soft Net Dupatta with Scalloped Lace Borders",
    isAvailable: true,
    tag: "Best Seller"
  },
  {
    id: "nh-16",
    name: "Crimson Golden Zardosi Silk Lehenga (NH16)",
    category: "chaniya-choli",
    price: 16499,
    originalPrice: 24999,
    discount: 34,
    image: "/images/NH16.jpg",
    images: [
      "/images/NH16.jpg",
      "/images/NH16-1.jpg",
      "/images/NH16-2.jpg"
    ],
    video: "/videos/NH16.mp4",
    description: "Make a striking statement. This raw silk bridal/festive Chaniya Choli is crafted in stunning crimson red, embellished with rich gold zari and hand-finished zardozi patterns. Creates a mesmerizing look for brides and special family occasions.",
    fabric: "Premium Banarasi Raw Silk",
    workType: "Handcrafted Zardozi, Golden Zari threadwork, and micro-pearl borders",
    flare: "6.0 Meters Kali-cut Ghera",
    blouse: "Semi-stitched (customizable up to Bust size 44)",
    dupatta: "2.4 Meters Pure Silk Dupatta with Gold Zari border",
    isAvailable: true,
    tag: "Bridal Premium"
  },
  {
    id: "nh-17",
    name: "Luxury Maroon Gota-Patti Velvet Lehenga (NH17)",
    category: "chaniya-choli",
    price: 10999,
    originalPrice: 17999,
    discount: 39,
    image: "/images/NH175.jpg",
    images: [
      "/images/NH171.jpg",
      "/images/NH172.jpg",
      "/images/NH173.jpg",
      "/images/NH174.jpg",
      "/images/NH175.jpg"
    ],
    video: "/videos/NH17-final-video.mp4",
    description: "An elegant, premium deep maroon velvet Chaniya Choli featuring traditional Rajasthani Gota-Patti embroidery. The skirt contains heavy double can-can inside for a rich flare, making it ideal for winter weddings and premium receptions.",
    fabric: "Micro Velvet 9000",
    workType: "Rajasthani Gota-Patti and intricate Golden Dori embroidery",
    flare: "6.5 Meters Flare with Double Can-can inside",
    blouse: "Fully Stitched Size 40 (expandable to 42)",
    dupatta: "2.3 Meters Pure Georgette Dupatta with Heavy Gota lace border",
    isAvailable: true,
    tag: "Designer Pick"
  },
  {
    id: "cc-001",
    name: "Vibrant Navrang Mirror-Work Chaniya Choli",
    category: "chaniya-choli",
    price: 5499,
    originalPrice: 8999,
    discount: 38,
    image: "/images/navratri.png",
    description: "Get ready to rock the Garba floor! This stunning multi-colored cotton Chaniya Choli is designed for Navratri, showcasing detailed Gujarati patchwork, heavy mirror embroidery, and a massive 7-meter flare that twirls beautifully in the circles of Garba.",
    fabric: "100% Pure Premium Cotton",
    workType: "Authentic Gujarati Patchwork, Real Mirror Work, and Gota-Patti Border",
    flare: "7.0 Meters Double-Layer Flare",
    blouse: "Fully Stitched (Bust size 38-42 adjustable)",
    dupatta: "2.3 Meters Cotton Dupatta with Wool Tassels",
    isAvailable: true,
    tag: "Navratri Special"
  },
  {
    id: "cc-002",
    name: "Royal Zardosi Bridal Silk Chaniya Choli",
    category: "chaniya-choli",
    price: 18999,
    originalPrice: 29999,
    discount: 36,
    image: "/images/bridal.png",
    description: "Make your special day unforgettable. This heavy raw silk bridal Chaniya Choli is finished in a royal crimson red, embellished with rich gold zari work, hand-crafted zardozi, and micro-pearls. Ideal for weddings, receptions, and royal occasions.",
    fabric: "Premium Raw Banarasi Silk",
    workType: "Handcrafted Zardozi, Golden Zari thread-work, and Stone embellishments",
    flare: "5.5 Meters Kali-cut Flare",
    blouse: "Semi-stitched (customizable up to Bust size 44)",
    dupatta: "Heavy Bridal Net Dupatta with Embroidered Border and Buttis",
    isAvailable: true,
    tag: "Best Seller"
  },
  {
    id: "cc-003",
    name: "Ethereal Pastel Floral Georgette Chaniya Choli",
    category: "chaniya-choli",
    price: 8499,
    originalPrice: 12999,
    discount: 34,
    image: "/images/pastel.png",
    description: "Elegant and modern. A pastel mint-green and powder-pink designer fusion Chaniya Choli featuring delicate floral motifs, soft net dupatta, and a light-weight georgette skirt. Perfect for sangeet, mehendi, and reception parties.",
    fabric: "Premium Georgette",
    workType: "Fine Resham Threadwork, Sequin embroidery, and Designer borders",
    flare: "6.0 Meters Flare",
    blouse: "Semi-stitched with Designer Back Pattern",
    dupatta: "2.4 Meters Soft Net Dupatta with Scalloped Embroidered Border",
    isAvailable: true,
    tag: "Designer Pick"
  },
  {
    id: "cc-004",
    name: "Traditional Patola Print Silk Chaniya Choli",
    category: "chaniya-choli",
    price: 6299,
    originalPrice: 9999,
    discount: 37,
    image: "/images/navratri.png",
    description: "Bring back Gujarati heritage with this beautiful Patola printed art silk Chaniya Choli. It combines mustard yellow and forest green patterns with a traditional design, perfect for pooja, festive functions, and Garba nights.",
    fabric: "Art Silk with Silk lining",
    workType: "Authentic Gujarati Patola Print and Zari Weaved border",
    flare: "6.0 Meters Flare",
    blouse: "Unstitched (1.0 Meter fabric included)",
    dupatta: "Patola Silk Dupatta with Zari borders",
    isAvailable: true,
    tag: "Traditional"
  },
  {
    id: "cc-005",
    name: "Gilded Velvet Royal Lehenga Choli",
    category: "chaniya-choli",
    price: 21999,
    originalPrice: 34999,
    discount: 37,
    image: "/images/bridal.png",
    description: "Luxurious dark wine velvet Chaniya Choli set adorned with intricate golden dori work and sequin borders, creating a grand silhouette for winter weddings and premium receptions.",
    fabric: "Micro Velvet 9000",
    workType: "Multi-thread Resham and heavy Golden Dori embroidery",
    flare: "5.0 Meters Flare with Double Can-can inside",
    blouse: "Fully Stitched Size 40 (expandable to 42)",
    dupatta: "Sheer Organza Silk Dupatta with Embroidered Borders",
    isAvailable: true,
    tag: "Trending"
  },
  {
    id: "cc-006",
    name: "Blossom Pink Organza Lehenga Choli",
    category: "chaniya-choli",
    price: 7999,
    originalPrice: 11999,
    discount: 33,
    image: "/images/pastel.png",
    description: "A breezy, light-weight powder pink organza Chaniya Choli with fine floral thread embroidery. Ideal for day events, sangeet, or modern festive parties.",
    fabric: "Premium Organza",
    workType: "Multi-color thread embroidery and delicate Gota Lace Borders",
    flare: "6.5 Meters Lightweight Flare",
    blouse: "Unstitched (1.0 Meter Organza + Satin inner)",
    dupatta: "Organza Dupatta with Floral Borders",
    isAvailable: true,
    tag: "New Arrival"
  },
  {
    id: "hd-001",
    name: "Gujarati Mirror-Work Wall Hanging",
    category: "home-decor",
    price: 2499,
    originalPrice: 3999,
    discount: 37,
    image: "/images/home_decor.png",
    description: "Decorate your home with this beautiful handcrafted Gujarati wall hanging. Detailed with colorful embroidery, mirror work, and traditional motifs, it brings a vibrant festive vibe to any living room or entryway.",
    fabric: "Premium Cotton & Woolen Tassels",
    workType: "Authentic Kutch Hand Embroidery, Patchwork, and Mirror Embellishments",
    flare: "N/A (36 x 24 inches)",
    blouse: "N/A",
    dupatta: "N/A",
    isAvailable: true,
    tag: "Best Seller"
  },
  {
    id: "cc-cover-001",
    name: "Festive Mirror-Work Cushion Cover Set",
    category: "cushion-covers",
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    image: "/images/cushion_cover.png",
    description: "A gorgeous set of 3 cushion covers featuring detailed traditional Gujarati embroidery and real mirror work. These vibrant covers are perfect for adding a touch of ethnic elegance to your sofa, chair, or bed.",
    fabric: "100% Cotton with Zipper Closure",
    workType: "Intricate Thread Embroidery, Mirror Accentuation, and Tassel Borders",
    flare: "N/A (16 x 16 inches)",
    blouse: "N/A",
    dupatta: "N/A",
    isAvailable: true,
    tag: "New Arrival"
  }
];

const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Booking = require("../models/Booking");
const Article = require("../models/Article");

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Booking.deleteMany({});

    console.log("Cleared existing data...");

    // 1. Create Users
    const admin = await User.create({
      name: "FloSet Master Admin",
      email: "altraverse@floset.com",
      password: "Ronit@200518",
      phone: "+91 98765 43210",
      role: "admin",
    });

    const host = await User.create({
      name: "Rhea Kapoor (Boutique Host)",
      email: "host@boutique.com",
      password: "host123",
      phone: "+91 98123 45678",
      role: "host",
      hostDetails: {
        type: "STORE",
        businessName: "Kapoor Heritage Studio",
        payoutUpi: "rhea@okhdfcbank",
        verified: true,
      },
    });

    const individualHost = await User.create({
      name: "Ananya Sharma (Individual)",
      email: "ananya@gmail.com",
      password: "host123",
      phone: "+91 97654 32109",
      role: "host",
      hostDetails: {
        type: "INDIVIDUAL",
        payoutUpi: "ananya@okaxis",
        verified: true,
      },
    });

    const customer = await User.create({
      name: "Rohan Mehta",
      email: "customer@gmail.com",
      password: "customer123",
      phone: "+91 91234 56789",
      role: "customer",
      savedAddresses: [
        {
          street: "A-402, Oberoi Sky City, Borivali East",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400066",
          isDefault: true,
        },
      ],
    });

    console.log("Created users (Admin, Hosts, Customer)...");

    // 2. Curated Products
    const productsData = [
      // WOMEN - LEHENGAS
      {
        productId: "FL-W-001",
        name: "Heritage Crimson Zardozi Bridal Lehenga",
        description:
          "Handcrafted velvet lehenga adorned with antique gold zardozi, sequin embroidery, and heavy border detailing. Includes dual dupattas and matching embroidered blouse.",
        category: "Lehengas",
        gender: "Women",
        occasions: ["Wedding", "Reception"],
        images: [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "M",
        measurements: {
          bustChest: "36-38 inches",
          waist: "30-32 inches",
          hips: "40-42 inches",
          length: "43 inches",
          fitNotes: "Adjustable drawstring waist with side zip closure.",
        },
        colour: "Crimson Red",
        condition: "Brand New with Tags",
        includedAccessories: [
          "Velvet Shawl Dupatta",
          "Organza Veil Dupatta",
          "Embroidered Belt",
        ],
        cleaningInfo:
          "UV-sanitized and professionally dry-cleaned using zero-chemical eco solvents.",
        brand: "Sabyasachi Heritage",
        pricing: {
          duration3h: 1499,
          duration1d: 2499,
          duration3d: 4999,
          duration5d: 6999,
          duration7d: 8999,
        },
        securityDeposit: 3500,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.9,
        reviewsCount: 24,
        isFeatured: true,
        isBestSeller: true,
        badge: "Top Rated",
        ownerId: admin._id,
        sourceType: "FLOSET",
      },
      {
        productId: "FL-W-002",
        name: "Blush Pink Mirror Work Silk Lehenga",
        description:
          "Contemporary georgette and silk lehenga with intricate hand-cut mirror embroidery and tonal pastel threadwork. Breathable and perfect for day weddings or sangeet celebrations.",
        category: "Lehengas",
        gender: "Women",
        occasions: ["Wedding", "Party", "Reception"],
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "S",
        measurements: {
          bustChest: "34 inches",
          waist: "28 inches",
          hips: "38 inches",
          length: "42 inches",
          fitNotes: "Fitted blouse with padding and back tassel fastening.",
        },
        colour: "Blush Pink",
        condition: "Like New",
        includedAccessories: [
          "Net Dupatta with Scalloped Border",
          "Latkan Tassels",
        ],
        cleaningInfo:
          "Dry-cleaned and steam-pressed with protective fabric care.",
        brand: "Abhinav Mishra",
        pricing: {
          duration3h: 1199,
          duration1d: 1899,
          duration3d: 3799,
          duration5d: 5199,
          duration7d: 6499,
        },
        securityDeposit: 2500,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.8,
        reviewsCount: 18,
        isFeatured: true,
        isBestSeller: false,
        badge: "Trending",
        ownerId: host._id,
        sourceType: "STORE",
        ownerExpectedEarning: 2200,
      },

      // WOMEN - SAREES
      {
        productId: "FL-W-003",
        name: "Royal Organza Tissue Banarasi Saree",
        description:
          "Pure woven gold and emerald tissue organza saree with delicate floral Kadwa motifs and a luxurious zari pallu. Drapes effortlessly with royal elegance.",
        category: "Sarees",
        gender: "Women",
        occasions: ["Reception", "Wedding", "Party"],
        images: [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "M",
        measurements: {
          bustChest: "36 inches (Unstitched Blouse piece included)",
          waist: "Free Size",
          hips: "Free Size",
          length: "5.5 meters saree + 0.8 meter blouse",
          fitNotes: "Fits all sizes. Petticoat provided upon request.",
        },
        colour: "Emerald Green & Gold",
        condition: "Brand New with Tags",
        includedAccessories: [
          "Gold Brocade Stitched Blouse (Size 36)",
          "Satin Petticoat",
        ],
        cleaningInfo:
          "Dry-cleaned and vacuum packed in sealed preservation garment bag.",
        brand: "Raw Mango",
        pricing: {
          duration3h: 899,
          duration1d: 1499,
          duration3d: 2899,
          duration5d: 3999,
          duration7d: 4999,
        },
        securityDeposit: 2000,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.9,
        reviewsCount: 31,
        isFeatured: true,
        isBestSeller: true,
        badge: "Editor Pick",
        ownerId: admin._id,
        sourceType: "FLOSET",
      },
      {
        productId: "FL-W-004",
        name: "Lavender Kanjivaram Silk Saree",
        description:
          "Modern pastel lavender Kanchipuram pure silk saree featuring silver zari korvai borders and intricate temple weaves.",
        category: "Sarees",
        gender: "Women",
        occasions: ["Wedding", "Reception", "Party"],
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "L",
        measurements: {
          bustChest: "38 inches (Stitched Designer Blouse)",
          waist: "Free Size",
          hips: "Free Size",
          length: "5.5 meters",
          fitNotes: "Includes pre-pleated option on request.",
        },
        colour: "Pastel Lavender",
        condition: "Like New",
        includedAccessories: [
          "Designer Embroidered Blouse",
          "Shaper Petticoat",
        ],
        cleaningInfo:
          "Hand-steamed and anti-bacterial UV sanitization performed.",
        brand: "Ekaya Banaras",
        pricing: {
          duration3h: 799,
          duration1d: 1299,
          duration3d: 2499,
          duration5d: 3499,
          duration7d: 4299,
        },
        securityDeposit: 1800,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.7,
        reviewsCount: 14,
        isFeatured: false,
        isBestSeller: false,
        badge: "Classic",
        ownerId: host._id,
        sourceType: "STORE",
        ownerExpectedEarning: 1500,
      },

      // WOMEN - GOWNS & DRESSES
      {
        productId: "FL-W-005",
        name: "Noir Backless Silk Evening Slip Dress",
        description:
          "Sculptural bias-cut 100% mulberry silk gown with a draped cowl neckline, low open back, and delicate cross straps. Subtle side slit.",
        category: "Dresses",
        gender: "Women",
        occasions: ["Date", "Party", "Birthday", "Photoshoot"],
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "S",
        measurements: {
          bustChest: "32-34 inches",
          waist: "26-27 inches",
          hips: "36-37 inches",
          length: "56 inches",
          fitNotes:
            "Bias cut provides gentle give and clings smoothly to contours.",
        },
        colour: "Midnight Black",
        condition: "Brand New with Tags",
        includedAccessories: ["Silicone Nipple Covers", "Garment Bag"],
        cleaningInfo:
          "Delicate silk solvent dry-cleaning and vertical steaming.",
        brand: "Reformation",
        pricing: {
          duration3h: 699,
          duration1d: 999,
          duration3d: 1899,
          duration5d: 2599,
          duration7d: 3199,
        },
        securityDeposit: 1500,
        isAvailable: true,
        status: "APPROVED",
        rating: 5.0,
        reviewsCount: 42,
        isFeatured: true,
        isBestSeller: true,
        badge: "Bestseller",
        ownerId: admin._id,
        sourceType: "FLOSET",
      },
      {
        productId: "FL-W-006",
        name: "Champagne Sequin Corset Mermaid Gown",
        description:
          "Head-turning evening gown featuring a structured boned corset bodice covered in champagne shimmer sequins, cascading into a soft train.",
        category: "Gowns",
        gender: "Women",
        occasions: ["Reception", "Party", "College Event"],
        images: [
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "M",
        measurements: {
          bustChest: "36 inches",
          waist: "29 inches",
          hips: "39 inches",
          length: "58 inches",
          fitNotes: "Corset lace-up back allows 2 inches of adjustment.",
        },
        colour: "Champagne Gold",
        condition: "Like New",
        includedAccessories: ["Shawl Wrap"],
        cleaningInfo: "Hand-cleaned sequins, ozone sanitized.",
        brand: "House of CB",
        pricing: {
          duration3h: 999,
          duration1d: 1599,
          duration3d: 2999,
          duration5d: 3999,
          duration7d: 4999,
        },
        securityDeposit: 2200,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.8,
        reviewsCount: 19,
        isFeatured: true,
        isBestSeller: false,
        badge: "Trending",
        ownerId: host._id,
        sourceType: "STORE",
        ownerExpectedEarning: 1800,
      },

      // WOMEN - INDO-WESTERN
      {
        productId: "FL-W-007",
        name: "Emerald Pre-Draped Saree Gown with Cape",
        description:
          "Modern pre-stitched draped pant saree featuring metallic bugle bead embroidery, paired with a sheer embellished floor-length cape jacket.",
        category: "Indo-Western",
        gender: "Women",
        occasions: ["Reception", "Party", "College Event", "Birthday"],
        images: [
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "S",
        measurements: {
          bustChest: "34 inches",
          waist: "28 inches",
          hips: "38 inches",
          length: "54 inches",
          fitNotes: "Pre-stitched zipper waist. No draping skills required!",
        },
        colour: "Emerald Green",
        condition: "Like New",
        includedAccessories: ["Embellished Cape Jacket", "Belt"],
        cleaningInfo: "Hospitality-grade steam sanitization.",
        brand: "Ridhi Mehra",
        pricing: {
          duration3h: 899,
          duration1d: 1399,
          duration3d: 2699,
          duration5d: 3699,
          duration7d: 4599,
        },
        securityDeposit: 2000,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.9,
        reviewsCount: 16,
        isFeatured: false,
        isBestSeller: true,
        badge: "Effortless",
        ownerId: admin._id,
        sourceType: "FLOSET",
      },

      // MEN - SHERWANIS
      {
        productId: "FL-M-008",
        name: "Royal Ivory & Antique Gold Jodhpur Sherwani",
        description:
          "Mastercrafted raw silk Jodhpuri sherwani featuring delicate Kashmiri aari embroidery, royal lion crest buttons, and tonal churidar.",
        category: "Sherwanis",
        gender: "Men",
        occasions: ["Wedding", "Reception"],
        images: [
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "L",
        measurements: {
          bustChest: "40-42 inches",
          waist: "34-36 inches",
          hips: "42 inches",
          length: "44 inches",
          fitNotes: "Structured shoulder pads, comfortable inner satin lining.",
        },
        colour: "Ivory Gold",
        condition: "Brand New with Tags",
        includedAccessories: [
          "Chanderi Stole / Dupatta",
          "Beaded Mala Necklace",
          "Pocket Square",
        ],
        cleaningInfo:
          "Ultra-gentle dry clean, steamed and protected in garment bag.",
        brand: "Manish Malhotra",
        pricing: {
          duration3h: 1299,
          duration1d: 2199,
          duration3d: 4499,
          duration5d: 6199,
          duration7d: 7899,
        },
        securityDeposit: 3000,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.9,
        reviewsCount: 28,
        isFeatured: true,
        isBestSeller: true,
        badge: "Groom Choice",
        ownerId: admin._id,
        sourceType: "FLOSET",
      },
      {
        productId: "FL-M-009",
        name: "Midnight Blue Velvet Embroidered Sherwani",
        description:
          "Deep navy velvet sherwani with subtle tone-on-tone resham thread embroidery on mandarin collar and cuffs. Striking modern silhouette for evening festivities.",
        category: "Sherwanis",
        gender: "Men",
        occasions: ["Reception", "Wedding", "Party"],
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "M",
        measurements: {
          bustChest: "38-40 inches",
          waist: "32-34 inches",
          hips: "40 inches",
          length: "43 inches",
          fitNotes: "Slim fit cut with side vents for ease of movement.",
        },
        colour: "Midnight Blue",
        condition: "Like New",
        includedAccessories: [
          "Silk Churidar",
          "Velvet Stole",
          "Metallic Brooch",
        ],
        cleaningInfo: "Specialist velvet dry clean and anti-crease steam.",
        brand: "Tarun Tahiliani",
        pricing: {
          duration3h: 1199,
          duration1d: 1999,
          duration3d: 3999,
          duration5d: 5499,
          duration7d: 6999,
        },
        securityDeposit: 2800,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.8,
        reviewsCount: 21,
        isFeatured: false,
        isBestSeller: false,
        badge: "Trending",
        ownerId: host._id,
        sourceType: "STORE",
        ownerExpectedEarning: 2400,
      },

      // MEN - KURTA SETS
      {
        productId: "FL-M-010",
        name: "Sage Green Lucknowi Chikankari Bundi Set",
        description:
          "Pure silk georgette kurta with authentic hand Chikankari embroidery, paired with a matching structured Bundi jacket and tailored churidar pants.",
        category: "Kurta Sets",
        gender: "Men",
        occasions: ["Party", "Birthday", "Wedding", "College Event"],
        images: [
          "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "M",
        measurements: {
          bustChest: "38-40 inches",
          waist: "32-34 inches",
          hips: "40 inches",
          length: "41 inches",
          fitNotes: "Comfortable relaxed fit kurta with tailored Nehru jacket.",
        },
        colour: "Sage Green",
        condition: "Brand New with Tags",
        includedAccessories: ["Nehru Bundi Jacket", "Churidar"],
        cleaningInfo: "Hypoallergenic sanitization and steam press.",
        brand: "Anita Dongre",
        pricing: {
          duration3h: 699,
          duration1d: 1099,
          duration3d: 2199,
          duration5d: 3099,
          duration7d: 3899,
        },
        securityDeposit: 1500,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.9,
        reviewsCount: 35,
        isFeatured: true,
        isBestSeller: true,
        badge: "Summer Pick",
        ownerId: admin._id,
        sourceType: "FLOSET",
      },

      // MEN - SUITS & TUXEDOS
      {
        productId: "FL-M-011",
        name: "Classic Black Satin Peak-Lapel Tuxedo",
        description:
          "Impeccably tailored 2-piece wool tuxedo featuring silk satin peak lapels, covered satin buttons, and flat-front trousers with satin side stripe.",
        category: "Suits",
        gender: "Men",
        occasions: ["Reception", "Party", "Date", "College Event"],
        images: [
          "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "L",
        measurements: {
          bustChest: "40-42 inches (Jacket 40R)",
          waist: "34 inches (Trouser)",
          hips: "41 inches",
          length: "32 inches trouser inseam",
          fitNotes: "European slim cut with half-canvas construction.",
        },
        colour: "Jet Black",
        condition: "Like New",
        includedAccessories: [
          "Black Silk Bowtie",
          "White Pocket Square",
          "Cufflinks",
        ],
        cleaningInfo:
          "Dry-cleaned and pressed with professional crisp lapel roll.",
        brand: "Hugo Boss",
        pricing: {
          duration3h: 899,
          duration1d: 1499,
          duration3d: 2899,
          duration5d: 3899,
          duration7d: 4799,
        },
        securityDeposit: 2500,
        isAvailable: true,
        status: "APPROVED",
        rating: 5.0,
        reviewsCount: 46,
        isFeatured: true,
        isBestSeller: true,
        badge: "Black Tie Essential",
        ownerId: admin._id,
        sourceType: "FLOSET",
      },

      // MEN - BLAZERS
      {
        productId: "FL-M-012",
        name: "Velvet Emerald Structured Tuxedo Blazer",
        description:
          "Plush emerald green velvet blazer with black grosgrain shawl lapels, single button fastening, and double back vents. Designed to stand out.",
        category: "Blazers",
        gender: "Men",
        occasions: ["Party", "Date", "Reception", "Birthday"],
        images: [
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "M",
        measurements: {
          bustChest: "38-40 inches",
          waist: "33-35 inches",
          hips: "39 inches",
          length: "29.5 inches",
          fitNotes:
            "Tailored fit that pairs effortlessly with black trousers or dark denim.",
        },
        colour: "Emerald Green",
        condition: "Like New",
        includedAccessories: ["Silk Pocket Square", "Lapel Pin"],
        cleaningInfo: "Dry cleaned and ozone treated.",
        brand: "Canali",
        pricing: {
          duration3h: 599,
          duration1d: 999,
          duration3d: 1899,
          duration5d: 2599,
          duration7d: 3199,
        },
        securityDeposit: 1800,
        isAvailable: true,
        status: "APPROVED",
        rating: 4.8,
        reviewsCount: 19,
        isFeatured: false,
        isBestSeller: false,
        badge: "Statement",
        ownerId: host._id,
        sourceType: "STORE",
        ownerExpectedEarning: 1100,
      },
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`Seeded ${createdProducts.length} approved products...`);

    // 3. Seed 2 PENDING listings from individual hosts to test admin approval
    const pendingListings = [
      {
        productId: "FL-H-201",
        name: "Pastel Peach Embroidered Anarkali Gown",
        description:
          "Worn once for a 4-hour family sangeet. Floor-length pure georgette Anarkali with silver zari work and pearl border.",
        category: "Gowns",
        gender: "Women",
        occasions: ["Wedding", "Party", "Reception"],
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "M",
        measurements: {
          bustChest: "36 inches",
          waist: "30 inches",
          hips: "38 inches",
          length: "54 inches",
          fitNotes: "Has margin for 1 inch loosening.",
        },
        colour: "Pastel Peach",
        condition: "Like New",
        includedAccessories: ["Dupatta", "Churidar"],
        cleaningInfo: "Dry cleaned right after event.",
        brand: "Boutique Collection",
        pricing: {
          duration3h: 500,
          duration1d: 800,
          duration3d: 1400,
          duration5d: 2000,
          duration7d: 2500,
        },
        securityDeposit: 1200,
        isAvailable: false,
        status: "PENDING_REVIEW",
        ownerId: individualHost._id,
        sourceType: "INDIVIDUAL",
        ownerExpectedEarning: 800,
        ownerRentalDurationPreference: "3_days",
        additionalDayCharge: 200,
        ownerPickupAddress: {
          street: "Flat 304, Green Heights, Andheri West",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400053",
          contactPhone: "+91 97654 32109",
          contactName: "Ananya Sharma",
        },
      },
      {
        productId: "FL-H-202",
        name: "Designer Charcoal Textured Italian Blazer",
        description:
          "Premium textured wool blend blazer in slate charcoal. Worn only for a company awards gala.",
        category: "Blazers",
        gender: "Men",
        occasions: ["Party", "College Event", "Date"],
        images: [
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
        ],
        size: "L",
        measurements: {
          bustChest: "42 inches",
          waist: "36 inches",
          hips: "42 inches",
          length: "31 inches",
          fitNotes: "Structured regular fit.",
        },
        colour: "Charcoal Grey",
        condition: "Like New",
        includedAccessories: ["Suit Cover"],
        cleaningInfo: "Steam pressed.",
        brand: "Raymond Made to Measure",
        pricing: {
          duration3h: 400,
          duration1d: 700,
          duration3d: 1200,
          duration5d: 1800,
          duration7d: 2200,
        },
        securityDeposit: 1000,
        isAvailable: false,
        status: "PENDING_REVIEW",
        ownerId: host._id,
        sourceType: "STORE",
        ownerExpectedEarning: 700,
        ownerRentalDurationPreference: "3_days",
        additionalDayCharge: 150,
        ownerPickupAddress: {
          street: "Shop 12, Linking Road, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          contactPhone: "+91 98123 45678",
          contactName: "Kapoor Heritage Studio",
        },
      },
    ];

    await Product.insertMany(pendingListings);
    console.log("Seeded pending host listings for admin review...");

    // 4. Seed a sample Active Booking to demonstrate timeline tracking and overlap prevention
    const productToBook = createdProducts[0]; // Sabyasachi Crimson Lehenga
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysLater = new Date(tomorrow);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    await Booking.create({
      bookingId: "BK-2026-1001",
      customerId: customer._id,
      productId: productToBook._id,
      rentalDuration: "3_days",
      startDate: tomorrow,
      endDate: threeDaysLater,
      rentalPrice: productToBook.pricing.duration3d,
      securityDeposit: productToBook.securityDeposit,
      totalAmount:
        productToBook.pricing.duration3d + productToBook.securityDeposit,
      deliveryAddress: {
        name: customer.name,
        phone: customer.phone,
        street: "A-402, Oberoi Sky City, Borivali East",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400066",
      },
      paymentStatus: "PAID",
      depositStatus: "HELD",
      orderStatus: "CLEANING_SANITIZATION",
      hostPayoutStatus: "NOT_APPLICABLE",
      statusHistory: [
        {
          status: "BOOKING_CONFIRMED",
          timestamp: new Date(Date.now() - 3600000 * 24),
          note: "Booking confirmed and initial payment authorized.",
        },
        {
          status: "SECURED_OUTFIT",
          timestamp: new Date(Date.now() - 3600000 * 18),
          note: "Outfit reserved from FloSet primary vault.",
        },
        {
          status: "PHYSICAL_INSPECTION",
          timestamp: new Date(Date.now() - 3600000 * 10),
          note: "Passed 24-point physical seam and embellishment check.",
        },
        {
          status: "CLEANING_SANITIZATION",
          timestamp: new Date(Date.now() - 3600000 * 2),
          note: "Undergoing hospital-grade UV sanitization and organic steam pressing.",
        },
      ],
    });

    console.log("Seeded active booking with timeline...");

    // 5. Seed Journal Articles
    const articles = [
      {
        title: "How to Build Outfits Around One Strong Occasion Piece",
        slug: "build-outfits-around-one-piece",
        summary:
          "A practical formula for making one expressive outfit, accessory, or color choice feel intentional instead of overdone.",
        content:
          "Start with the piece that has the strongest visual point of view: a heavily embroidered lehenga, a sculptural blazer, a jewel-toned saree, or a dramatic bag. Everything else in the look should either support its palette, repeat one texture, or give the eye somewhere quiet to rest.\n\nFor color, use a simple styling rule from fashion editors: build around related tones when you want polish, or use one controlled contrast when you want impact. If the statement piece already includes several colors, pull one secondary shade into your shoes, clutch, or jewelry instead of matching every element exactly.\n\nAccessories should clarify the look rather than compete with it. Strong earrings can work beautifully with a plain neckline, while an embellished neckline usually wants smaller jewelry and cleaner hair. The goal is not minimalism; it is hierarchy.\n\nFor rental wardrobes, this approach is especially useful because one standout occasion piece can become many looks. Change the dupatta drape, layer a jacket, switch metal tones, or restyle the same piece with understated separates for a different event.",
        tag: "Styling Guide",
        image:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
        readTime: "4 min read",
        sourceName: "Who What Wear",
        sourceUrl: "https://www.whowhatwear.com/styling-statement-pieces",
        sourcePublishedAt: new Date("2022-03-01"),
        featured: true,
      },
      {
        title: "The Circular Fashion Revolution: Why Renting Beats Buying",
        slug: "circular-fashion-revolution",
        summary:
          "Rental, resale, repair, and reuse are becoming the core of a lower-waste fashion system.",
        content:
          "Fashion has historically been built around a linear pattern: make, sell, wear briefly, discard. Circular fashion changes the question from 'What should we produce next?' to 'How do we keep existing garments in use for longer?'\n\nRental is a natural fit for occasion wear because the highest-impact pieces are often the least frequently worn. A wedding guest outfit, black-tie gown, sherwani, or party saree can be loved intensely for one night and then sit untouched for years. Shared access lets the same craftsmanship serve multiple people.\n\nThe circular model also asks brands and platforms to think beyond the first checkout: cleaning, repair, quality control, durable materials, and easy return loops all matter. A rental marketplace only works when garments are cared for well enough to keep circulating.\n\nFor customers, the benefit is not only sustainability. Renting reduces closet clutter, lowers the cost of experimentation, and makes special-occasion dressing feel more flexible. The best circular fashion experience should feel aspirational, not like a compromise.",
        tag: "Sustainability",
        image:
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop",
        readTime: "6 min read",
        sourceName: "Ellen MacArthur Foundation",
        sourceUrl:
          "https://www.ellenmacarthurfoundation.org/topics/fashion/overview",
        sourcePublishedAt: new Date("2024-01-01"),
        featured: true,
      },
      {
        title: "Monetizing Your Wardrobe: A Host’s Guide to Earning on FloSet",
        slug: "monetizing-your-wardrobe",
        summary:
          "How collectors and boutiques can turn rarely worn occasion pieces into a cleaner recurring revenue channel.",
        content:
          "The best pieces to list first are the ones with clear occasion demand: bridal-adjacent looks, cocktail dresses, festive sarees, sherwanis, tuxedos, and designer accessories. These items are expensive to buy, memorable enough that people avoid repeating them, and durable enough to survive careful reuse.\n\nPricing should account for more than brand name. Consider replacement value, cleaning complexity, alteration limits, seasonality, and how often the piece can realistically be rented without fatigue. A lower price that books often can outperform a premium price that sits idle.\n\nPhotography does most of the trust-building. Show the whole outfit, close-up fabric and embellishment shots, fit notes, and any condition details. The more precise the listing, the fewer surprises at delivery.\n\nThe operational side matters too: fast communication, clear return windows, garment bags, repair checks, and cleaning standards. Hosts who treat inventory like a small fashion library create better customer experiences and protect their own earning power.",
        tag: "Host Insights",
        image:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
        readTime: "5 min read",
        sourceName: "McKinsey & Company",
        sourceUrl:
          "https://www.mckinsey.com/industries/retail/our-insights/fashion-on-climate",
        sourcePublishedAt: new Date("2020-08-26"),
        featured: false,
      },
      {
        title: "Decoding Black-Tie and Royal Groom Attire",
        slug: "black-tie-royal-groom-attire",
        summary:
          "A guide to choosing between tuxedos, bandhgalas, sherwanis, and formal accessories for high-ceremony events.",
        content:
          "Black-tie dressing is built on restraint: sharp tailoring, formal fabric, controlled shine, and proportion. A tuxedo works best when the jacket, trouser break, shirt collar, bow tie, and shoes feel precise rather than loud.\n\nIndian groom and guest dressing uses a different formal language. Sherwanis, bandhgalas, embroidered jackets, and ceremonial stoles can carry more surface detail, but fit is still everything. Shoulder structure, sleeve length, trouser taper, and the fall of the kurta or jacket decide whether the outfit feels regal or heavy.\n\nWhen choosing between the two, match the dress code and the setting. A hotel ballroom reception may favor a tuxedo or velvet dinner jacket, while a wedding ceremony or sangeet can support richer embroidery, brocade, or a tonal sherwani.\n\nAccessories should be edited with the same discipline. Patent shoes, cufflinks, watches, safas, malas, pocket squares, and brooches can all work, but not all at once. Pick the elements that reinforce the ceremony and leave the rest quiet.",
        tag: "Men's Occasion",
        image:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop",
        readTime: "5 min read",
        sourceName: "GQ",
        sourceUrl: "https://www.gq.com/story/black-tie-attire-explained",
        sourcePublishedAt: new Date("2024-04-11"),
        featured: false,
      },
    ];

    await Article.deleteMany({});
    const createdArticles = await Article.insertMany(articles);
    console.log(`Seeded ${createdArticles.length} journal articles...`);
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seed error:", error);
    throw error;
  }
};

// Allow standalone execution
if (require.main === module) {
  require("dotenv").config({ path: __dirname + "/../.env" });
  const connectDB = require("../config/db");
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}

module.exports = seedDatabase;

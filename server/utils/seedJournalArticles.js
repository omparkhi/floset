const Article = require("../models/Article");

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
    title: "Monetizing Your Wardrobe: A Host's Guide to Earning on FloSet",
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

const seedJournalArticles = async () => {
  await Article.deleteMany({});
  return Article.insertMany(articles);
};

if (require.main === module) {
  require("dotenv").config({ path: __dirname + "/../.env" });
  const connectDB = require("../config/db");

  connectDB()
    .then(async () => {
      const createdArticles = await seedJournalArticles();
      console.log(`Seeded ${createdArticles.length} journal articles.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Journal seed error:", error);
      process.exit(1);
    });
}

module.exports = { articles, seedJournalArticles };

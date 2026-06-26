/**
 * GoMotarCar CMS Data Seed Script
 *
 * Run with: node src/seed-cms.js
 * Seeds all CMS collections with sample content if they're empty.
 *
 * Content seeded:
 *   - 6 Banners (promotional)
 *   - 10 Blog posts
 *   - 15 FAQs
 *   - 6 Policies (privacy, terms, refund, shipping, cookies, other)
 *   - 10 Contact requests
 *   - 4 Download links (android, ios, web)
 */

const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');

// CMS Models
const Banner = require('./models/Banner');
const Blog = require('./models/Blog');
const FAQ = require('./models/FAQ');
const Policy = require('./models/Policy');
const ContactRequest = require('./models/ContactRequest');
const DownloadLink = require('./models/DownloadLink');
const User = require('./models/User');

// ─── Helpers ───
const randomDate = (startDaysAgo, endDaysAgo) => {
  const start = new Date();
  start.setDate(start.getDate() - startDaysAgo);
  const end = new Date();
  end.setDate(end.getDate() - endDaysAgo);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const PLACEHOLDER = (text, bg = '667eea', w = 1200, h = 400) =>
  `https://placehold.co/${w}x${h}/${bg}/ffffff?text=${encodeURIComponent(text)}`;

async function seedCMS() {
  await connectDB();
  console.log('\n📦 Seeding CMS content...\n');

  // Find an admin user to use as createdBy reference
  let admin = await User.findOne({ role: 'super_admin' });
  if (!admin) admin = await User.findOne({});
  const adminId = admin?._id;

  // ─────────────────────────────────────────────
  // Banners
  // ─────────────────────────────────────────────
  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0) {
    console.log('📌 Creating banners...');
    const banners = await Banner.insertMany([
      {
        title: 'Summer Car Care Special',
        subtitle: 'Flat 30% Off on All Premium Washes',
        description: 'Beat the heat with our summer special. Get your car sparkling clean with our premium washing service at unbeatable prices.',
        imageUrl: PLACEHOLDER('Summer Special - 30% Off', 'FF6B6B'),
        linkUrl: '/bookings',
        linkText: 'Book Now',
        position: 1,
        isActive: true,
        page: 'home',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        createdBy: adminId,
      },
      {
        title: 'New! Express Wash Service',
        subtitle: 'In & Out in 15 Minutes',
        description: 'Short on time? Try our new Express Wash service. Quick, efficient, and leaves your car showroom clean.',
        imageUrl: PLACEHOLDER('Express Wash - 15 Min', '4ECDC4'),
        linkUrl: '/services/express',
        linkText: 'Learn More',
        position: 2,
        isActive: true,
        page: 'home',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        createdBy: adminId,
      },
      {
        title: 'Interior Deep Cleaning',
        subtitle: 'Monsoon Ready Package',
        description: 'Keep your car fresh and hygienic this monsoon season with our interior deep cleaning package.',
        imageUrl: PLACEHOLDER('Interior Deep Clean', '45B7D1'),
        linkUrl: '/services/interior',
        linkText: 'Explore Package',
        position: 3,
        isActive: true,
        page: 'home',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        createdBy: adminId,
      },
      {
        title: 'Refer & Earn ₹200',
        subtitle: 'Share the Love, Earn Rewards',
        description: 'Refer a friend and both of you get ₹200 off on your next car wash booking!',
        imageUrl: PLACEHOLDER('Refer & Earn Rs 200', 'F7DC6F', 1200, 400),
        linkUrl: '/refer',
        linkText: 'Refer Now',
        position: 4,
        isActive: true,
        page: 'profile',
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        createdBy: adminId,
      },
      {
        title: 'Subscription Plans',
        subtitle: 'Save Big with Monthly Plans',
        description: 'Starting at just ₹899/month for 4 washes. Unlimited peace of mind for your car.',
        imageUrl: PLACEHOLDER('Subscribe & Save', '2ECC71'),
        linkUrl: '/subscriptions',
        linkText: 'View Plans',
        position: 5,
        isActive: true,
        page: 'subscription',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        createdBy: adminId,
      },
      {
        title: 'Corporate Tie-Ups',
        subtitle: 'Fleet & Corporate Packages',
        description: 'Special discounted rates for corporate fleets and apartment complexes. Bulk bookings at your convenience.',
        imageUrl: PLACEHOLDER('Corporate Packages', '8E44AD'),
        linkUrl: '/contact',
        linkText: 'Get Quote',
        position: 6,
        isActive: true,
        page: 'other',
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        createdBy: adminId,
      },
    ]);
    console.log(`  ✓ Created ${banners.length} banners`);
  } else {
    console.log(`  - ${bannerCount} banners already exist, skipping`);
  }

  // ─────────────────────────────────────────────
  // Blogs
  // ─────────────────────────────────────────────
  const blogCount = await Blog.countDocuments();
  if (blogCount === 0) {
    console.log('📌 Creating blog posts...');
    const blogs = await Blog.insertMany([
      {
        title: '10 Tips to Keep Your Car Looking New Longer',
        slug: 'car-care-tips-new-look',
        excerpt: 'Discover professional tips to maintain your car\'s showroom shine and protect its paint from everyday wear and tear.',
        content: `Maintaining your car's pristine appearance doesn't have to be a chore. With the right habits and a little know-how, you can keep your vehicle looking showroom-fresh for years to come.\n\n## 1. Park in the Shade\nUV rays are your car's worst enemy. Parking in the shade preserves your paint and prevents interior fading.\n\n## 2. Wash Weekly\nRegular washing prevents dirt from bonding with your paint. Use a pH-neutral car shampoo and microfiber cloths.\n\n## 3. Wax Every 3 Months\nA good wax layer protects against UV rays, bird droppings, and minor scratches.\n\n## 4. Don't Skip Interior Care\nVacuum weekly and use a UV protectant on dashboards to prevent cracking.\n\n## 5. Use Separate Cloths for Different Surfaces\nNever use the same cloth on wheels and paint — you'll transfer brake dust and scratch the clear coat.\n\n## 6. Clean Under the Hood\nA clean engine runs cooler and is easier to maintain. Use a degreaser and gentle rinse.\n\n## 7. Protect Your Windshield\nApply a rain-repellent coating for better visibility during monsoons.\n\n## 8. Tire Dressing Matters\nClean tires with a dedicated cleaner and apply dressing to prevent cracking.\n\n## 9. Address Spills Immediately\nCoffee, soda, and food spills can permanently stain upholstery if left too long.\n\n## 10. Professional Detailing Twice a Year\nNothing beats a professional deep clean. Book a GoMotarCar detailing session every 6 months for that showroom finish.`,
        coverImage: PLACEHOLDER('Car Care Tips', '2ECC71', 800, 500),
        author: 'GoMotarCar Team',
        category: 'tips',
        tags: ['car care', 'maintenance', 'detailing', 'DIY'],
        isPublished: true,
        publishedAt: randomDate(30, 5),
        seoTitle: '10 Car Care Tips | GoMotarCar',
        seoDescription: 'Learn 10 professional tips to keep your car looking new longer. From washing techniques to interior care, we cover it all.',
        readingTime: 4,
        createdBy: adminId,
      },
      {
        title: 'The Ultimate Guide to Car Detailing Services',
        slug: 'ultimate-guide-car-detailing',
        excerpt: 'Everything you need to know about professional car detailing — from basic wash to full paint correction.',
        content: `Car detailing goes far beyond a simple wash. It's a comprehensive process that restores and protects your vehicle inside and out.\n\n## What is Car Detailing?\nDetailing involves thorough cleaning, restoration, and finishing of a vehicle to achieve a showroom-quality finish. It addresses both the aesthetic and protective aspects of your car.\n\n## Levels of Detailing\n\n### Basic Detail\n- Exterior hand wash & dry\n- Wheel cleaning & tire dressing\n- Interior vacuum & wipe-down\n- Glass cleaning\n\n### Standard Detail\n- Everything in Basic\n- Clay bar treatment\n- One-step paint correction\n- Interior shampoo (seats/carpets)\n- Leather cleaning & conditioning\n\n### Full Detail\n- Everything in Standard\n- Multi-step paint correction\n- Paint protection (wax/sealant)\n- Engine bay cleaning\n- Headlight restoration\n- Odor removal treatment\n\n### Premium Detail\n- Everything in Full Detail\n- Paint protection film (PPF) touch-up\n- Ceramic coating application\n- Full interior leather restoration\n- Undercarriage cleaning\n\n## Why Regular Detailing Matters\n1. **Preserves resale value** — A well-maintained car commands a higher price\n2. **Protects your investment** — Prevents rust, fading, and paint damage\n3. **Health & hygiene** — Removes allergens, bacteria, and mold from interiors\n4. **Pride of ownership** — There's nothing like driving a spotless car\n\nBook your GoMotarCar detailing session today and experience the difference professional care makes!`,
        coverImage: PLACEHOLDER('Ultimate Detailing Guide', '3498DB', 800, 500),
        author: 'GoMotarCar Team',
        category: 'guide',
        tags: ['detailing', 'car wash', 'paint correction', 'ceramic coating'],
        isPublished: true,
        publishedAt: randomDate(60, 31),
        seoTitle: 'Complete Car Detailing Guide | GoMotarCar',
        seoDescription: 'Learn everything about professional car detailing services. From basic wash to full paint correction and ceramic coating.',
        readingTime: 6,
        createdBy: adminId,
      },
      {
        title: 'Monsoon Car Care: Essential Tips for Rainy Season',
        slug: 'monsoon-car-care-tips',
        excerpt: 'Protect your car this rainy season with our essential monsoon car care guide. From underbody coating to interior moisture control.',
        content: `The monsoon season brings relief from the heat, but it also poses unique challenges for your car. Here's how to keep your vehicle safe and clean during the rains.\n\n## Pre-Monsoon Preparation\n\n### 1. Check Your Wipers\nWorn wiper blades leave streaks and reduce visibility. Replace them before the rains hit.\n\n### 2. Apply Rain Repellent\nA good rain-repellent coating on the windshield improves visibility and reduces the need for constant wiping.\n\n### 3. Underbody Anti-Rust Coating\nWater-logged roads can cause rust and corrosion. An anti-rust coating protects the undercarriage.\n\n### 4. Check Door Seals\nInspect rubber seals around doors and windows. Replace any that are cracked or worn to prevent water leakage.\n\n## During Monsoon Maintenance\n\n### Wash More Frequently\nRainwater contains pollutants that can damage paint. Wash your car at least once a week.\n\n### Dry Brakes After Driving Through Water\nTap your brakes lightly a few times after driving through deep water to dry them out.\n\n### Prevent Fogging\nUse the defogger setting on your AC to keep windows clear. An anti-fog spray is also effective.\n\n### Check Floor Mats\nLift and dry floor mats regularly to prevent mold and mildew growth.\n\n## Post-Monsoon Care\nAfter the monsoon season ends, get a professional detailing session to address any accumulated grime, moisture damage, or rust spots.\n\nStay safe and keep your car shining all season with GoMotarCar!`,
        coverImage: PLACEHOLDER('Monsoon Car Care', '5DADE2', 800, 500),
        author: 'GoMotarCar Team',
        category: 'tips',
        tags: ['monsoon', 'rainy season', 'car care', 'rust prevention'],
        isPublished: true,
        publishedAt: randomDate(90, 61),
        seoTitle: 'Monsoon Car Care Tips | GoMotarCar',
        seoDescription: 'Essential monsoon car care tips. Protect your car from rain damage with our comprehensive rainy season guide.',
        readingTime: 5,
        createdBy: adminId,
      },
      {
        title: 'Why Ceramic Coating is Worth the Investment',
        slug: 'ceramic-coating-worth-it',
        excerpt: 'Is ceramic coating really worth it? We break down the costs, benefits, and longevity of ceramic paint protection.',
        content: `Ceramic coating has become one of the most popular paint protection solutions in the automotive world. But is it worth the investment? Let's find out.\n\n## What is Ceramic Coating?\nCeramic coating is a liquid polymer applied to a vehicle's exterior. It chemically bonds with the factory paint, creating a permanent or semi-permanent layer of protection.\n\n## Benefits\n\n### 1. Superior Protection\nCeramic coatings protect against UV rays, oxidation, bird droppings, tree sap, and minor scratches.\n\n### 2. Hydrophobic Properties\nWater beads up and rolls off instantly, making the car easier to wash and dry.\n\n### 3. Long-Lasting Shine\nUnlike wax, which lasts weeks, a quality ceramic coating can last 2-5 years with proper maintenance.\n\n### 4. Easier Cleaning\nDirt and grime have a harder time bonding to the coating, so washes are quicker and easier.\n\n### 5. UV Protection\nPrevents paint from fading and oxidizing over time.\n\n## Cost vs. Value\nProfessional ceramic coating typically costs ₹15,000-₹35,000 depending on the package and vehicle size. When you consider the cost of frequent waxing, paint correction, and the increased resale value, ceramic coating pays for itself over time.\n\n## Maintenance Tips\n- Wash with pH-neutral shampoo\n- Avoid automatic car washes with brushes\n- Use a detailing spray for quick touch-ups\n- Get an annual inspection and top-up if needed\n\nReady to protect your investment? Book a ceramic coating session with GoMotarCar today!`,
        coverImage: PLACEHOLDER('Ceramic Coating Guide', 'E74C3C', 800, 500),
        author: 'GoMotarCar Team',
        category: 'guide',
        tags: ['ceramic coating', 'paint protection', 'detailing', 'car care'],
        isPublished: true,
        publishedAt: randomDate(45, 15),
        seoTitle: 'Is Ceramic Coating Worth It? | GoMotarCar',
        seoDescription: 'Discover the benefits of ceramic coating for your car. We analyze costs, longevity, and whether it\'s worth the investment.',
        readingTime: 5,
        createdBy: adminId,
      },
      {
        title: 'GoMotarCar Launches Express Wash Service Across Mumbai',
        slug: 'express-wash-launch-mumbai',
        excerpt: 'Our new 15-minute Express Wash service is now available at all partner locations in Mumbai.',
        content: `We're excited to announce the launch of our Express Wash service across all GoMotarCar partner locations in Mumbai!\n\n## What is Express Wash?\nExpress Wash is our quick-service option designed for busy car owners. In just 15 minutes, we'll have your car looking fresh and clean.\n\n## What's Included?\n- Exterior pressure wash\n- Active foam application\n- Hand wash with microfiber mitts\n- Wheel cleaning\n- Tyre dressing\n- Glass cleaning\n- Quick dry\n\n## Where is it Available?\nExpress Wash is now available at all 50+ partner locations across Mumbai, including:\n- Andheri West\n- Bandra Kurla Complex\n- Powai\n- Navi Mumbai (Vashi)\n- Thane (Hiranandani Estate)\n\n## Pricing\nJust ₹299 for hatchbacks, ₹399 for sedans, and ₹499 for SUVs. No appointment needed — just drive in!\n\nWe're constantly expanding our services to make car care more convenient for you. Stay tuned for more updates!`,
        coverImage: PLACEHOLDER('Express Wash Launch', '27AE60', 800, 500),
        author: 'GoMotarCar Team',
        category: 'updates',
        tags: ['express wash', 'launch', 'Mumbai', 'new service'],
        isPublished: true,
        publishedAt: randomDate(20, 5),
        seoTitle: 'Express Wash Launched in Mumbai | GoMotarCar',
        seoDescription: 'GoMotarCar launches 15-minute Express Wash service across Mumbai. Starting at just ₹299. No appointment needed!',
        readingTime: 3,
        createdBy: adminId,
      },
      {
        title: 'Electric Cars & Washing: What You Need to Know',
        slug: 'electric-car-washing-guide',
        excerpt: 'Washing an electric car is different from a traditional vehicle. Learn the dos and don\'ts of EV car care.',
        content: `With electric vehicles (EVs) becoming increasingly popular on Indian roads, it's important to understand their unique car care requirements.\n\n## Can You Wash an Electric Car?\nYes! Electric cars are designed to be water-resistant and can be washed just like conventional cars. The battery packs and electrical components are sealed and protected.\n\n## Special Considerations\n\n### 1. Avoid High-Pressure Direct Spray on Charging Port\nWhile the charging port is sealed, it's best to avoid direct high-pressure water spray on it.\n\n### 2. Be Careful with Underbody Wash\nEVs have battery packs underneath. While they're protected, gentle underbody washing is recommended.\n\n### 3. No Engine Bay Needed\nEVs don't have traditional engines, so there's no need for engine bay cleaning. However, the front trunk (frunk) area should be kept clean.\n\n### 4. Software & Sensors\nModern EVs have numerous sensors and cameras. Be gentle around these areas to avoid damage.\n\n## Recommended Wash for EVs\n\n### Touchless Wash\nUse a touchless or hand wash method to avoid scratching the paint. Many EVs have lightweight aluminum bodies that can dent more easily.\n\n### pH-Neutral Products\nUse pH-neutral car shampoos. Harsh chemicals can damage special EV paint finishes.\n\n### Interior Tech Care\nClean touchscreens and digital displays with appropriate electronics-safe cleaners, not standard glass cleaners.\n\nGoMotarCar's trained professionals know exactly how to handle EVs. Book your EV detailing session today!`,
        coverImage: PLACEHOLDER('EV Washing Guide', '1ABC9C', 800, 500),
        author: 'GoMotarCar Team',
        category: 'guide',
        tags: ['electric car', 'EV', 'car wash', 'electric vehicle'],
        isPublished: true,
        publishedAt: randomDate(35, 10),
        seoTitle: 'Electric Car Washing Guide | GoMotarCar',
        seoDescription: 'Learn how to properly wash and care for your electric car. Expert tips for EV owners from GoMotarCar.',
        readingTime: 4,
        createdBy: adminId,
      },
      {
        title: 'Top 5 Car Cleaning Myths Debunked',
        slug: 'car-cleaning-myths-debunked',
        excerpt: 'Stop falling for these common car cleaning myths! We set the record straight with expert advice.',
        content: `There's a lot of misinformation about car cleaning. Let's debunk the most common myths once and for all.\n\n## Myth 1: Dish Soap is Great for Car Washing\n**Busted:** Dish soap is designed to cut through grease and will strip away your car's wax protection. Always use a dedicated pH-neutral car shampoo.\n\n## Myth 2: More Shampoo Means a Cleaner Car\n**Busted:** Using too much shampoo leaves residue and makes rinsing difficult. Follow the manufacturer's recommended dilution ratio.\n\n## Myth 3: You Can Use Any Cloth to Dry Your Car\n**Busted:** Old t-shirts and towels can scratch your paint. Use plush microfiber drying towels specifically designed for automotive use.\n\n## Myth 4: Waxing Once a Year is Enough\n**Busted:** Wax breaks down over time due to UV exposure and weather. For optimal protection, wax every 3 months.\n\n## Myth 5: Automatic Car Washes are Safe\n**Busted:** While convenient, automatic car washes with rotating brushes can cause micro-scratches and swirl marks. Hand washing or touchless washing is safer for your paint.\n\n## The Right Way\n- Use automotive-specific products\n- Invest in quality microfiber towels\n- Use the two-bucket wash method\n- Dry with a clean microfiber towel\n- Wax regularly\n\nTrust GoMotarCar for professional, safe car cleaning every time!`,
        coverImage: PLACEHOLDER('Cleaning Myths Debunked', 'F39C12', 800, 500),
        author: 'GoMotarCar Team',
        category: 'tips',
        tags: ['car cleaning myths', 'car care', 'detailing tips', 'myths'],
        isPublished: true,
        publishedAt: randomDate(50, 25),
        seoTitle: '5 Car Cleaning Myths Debunked | GoMotarCar',
        seoDescription: 'Stop falling for these common car cleaning myths. Expert advice on proper car washing and detailing techniques.',
        readingTime: 4,
        createdBy: adminId,
      },
      {
        title: 'Understanding Car Paint Types and Their Care',
        slug: 'car-paint-types-care',
        excerpt: 'Different car paints require different care. Learn about solid, metallic, pearl, and matte finishes.',
        content: `Not all car paints are created equal. Understanding your car's paint type is the first step to proper care and maintenance.\n\n## Solid Paint\n\nSolid (or single-stage) paint is the most basic type. It's easy to repair and maintain but shows scratches more readily.\n\n**Care:** Regular waxing recommended. Avoid harsh abrasives.\n\n## Metallic Paint\n\nMetallic paint contains tiny aluminum particles that create a sparkle effect. It's the most common type on modern cars.\n\n**Care:** Use gentle polishes. Harsh compounds can damage the metallic flake alignment.\n\n## Pearl Paint\n\nPearl or mica paint uses ceramic crystals for a depth and color-shifting effect. It's beautiful but expensive to repair.\n\n**Care:** Always use the gentlest possible products. Professional detailing recommended.\n\n## Matte Paint\n\nMatte finishes are increasingly popular on luxury and sports cars. They require very special care.\n\n**Care:** NEVER wax a matte finish. Use dedicated matte paint cleaners and sealants. Avoid automatic car washes.\n\n## General Paint Protection Tips\n\n1. **Wash regularly** — Prevents contaminants from bonding\n2. **Use a pH-neutral shampoo** — Harsh chemicals damage clear coat\n3. **Dry thoroughly** — Water spots can etch into the paint\n4. **Apply protection** — Wax, sealant, or ceramic coating\n5. **Park in the shade** — UV is the #1 cause of paint degradation\n\nGoMotarCar's team is trained in all paint types. We use the right products for your specific vehicle. Book now!`,
        coverImage: PLACEHOLDER('Car Paint Types', '9B59B6', 800, 500),
        author: 'GoMotarCar Team',
        category: 'guide',
        tags: ['paint care', 'car paint', 'matte paint', 'metallic paint'],
        isPublished: true,
        publishedAt: randomDate(75, 45),
        seoTitle: 'Car Paint Types and Care Guide | GoMotarCar',
        seoDescription: 'Learn about different car paint types - solid, metallic, pearl, and matte. Expert care tips for each paint finish.',
        readingTime: 5,
        createdBy: adminId,
      },
      {
        title: 'GoMotarCar Celebrates 1 Lakh Car Washes',
        slug: 'one-lakh-car-washes-milestone',
        excerpt: 'We\'ve reached a major milestone! 100,000 car washes completed across all partner locations.',
        content: `We're thrilled to announce that GoMotarCar has completed over 1,00,000 car washes since our launch! 🎉\n\n## A Journey of Clean\n\nWhat started as a small operation with 5 partner locations has grown into Mumbai's most trusted car cleaning network.\n\n### Our Journey\n- **Year 1:** 5,000 washes, 10 partners, 2 zones\n- **Year 2:** 25,000 washes, 30 partners, 5 zones\n- **Year 3:** 70,000 washes, 50+ partners, 10 zones\n- **Today:** 1,00,000+ washes, 80+ partners, 15+ zones\n\n## Customer Love\nWe've maintained an average rating of 4.7 stars across all platforms — a testament to our commitment to quality.\n\n## What's Next?\n- Expanding to Pune, Bangalore, and Delhi NCR\n- Introducing mobile car wash service\n- Launching our loyalty rewards program\n- AI-powered scheduling for even faster service\n\n## Thank You\nTo our customers, partners, and team members who made this possible — thank you! We couldn't have done it without you.\n\nHere's to the next 1,00,000 washes! 🚗✨`,
        coverImage: PLACEHOLDER('1 Lakh Washes Milestone', 'E67E22', 800, 500),
        author: 'GoMotarCar Team',
        category: 'updates',
        tags: ['milestone', 'achievement', 'company update', 'anniversary'],
        isPublished: true,
        publishedAt: randomDate(10, 2),
        seoTitle: 'GoMotarCar Reaches 1 Lakh Washes | Milestone',
        seoDescription: 'GoMotarCar celebrates completing 100,000 car washes. Read about our journey, achievements, and future plans.',
        readingTime: 3,
        createdBy: adminId,
      },
      {
        title: 'How Often Should You Really Wash Your Car?',
        slug: 'how-often-wash-car',
        excerpt: 'The answer might surprise you. We break down the ideal washing schedule based on your driving habits and environment.',
        content: `How often should you wash your car? The answer depends on several factors:\n\n## General Rule: Every 1-2 Weeks\nFor most drivers, a weekly or bi-weekly wash is sufficient to maintain appearance and protect the paint.\n\n## Factors That Increase Frequency\n\n### 1. Where You Park\n- **Street parking:** Wash every 5-7 days (exposed to bird droppings, tree sap, pollution)\n- **Garage parking:** Every 10-14 days\n\n### 2. Weather Conditions\n- **Rainy season:** Weekly washes recommended\n- **Summer:** Every 10 days\n- **Winter/Dry:** Every 2 weeks\n\n### 3. Driving Habits\n- **Daily commuter (50+ km/day):** Weekly wash\n- **Weekend driver:** Every 2-3 weeks\n- **Long highway trips:** Wash after trip (bugs, tar)\n\n### 4. Environment\n- **Near construction sites:** Wash after every 2-3 days\n- **Coastal areas:** Weekly (salt corrosion)\n- **Industrial areas:** Weekly (pollution fallout)\n\n## Signs Your Car Needs a Wash\n- Water doesn't bead on the surface\n- You can see dust/dirt clearly\n- Bird droppings or tree sap present\n- Windows are grimy\n- Wheels have brake dust buildup\n\n## Pro Tip\nWith a GoMotarCar subscription, you get regular washes at a discounted rate — no need to track schedules, we've got you covered!\n\nBook your next wash today and let us handle the rest!`,
        coverImage: PLACEHOLDER('How Often to Wash', '16A085', 800, 500),
        author: 'GoMotarCar Team',
        category: 'tips',
        tags: ['car wash frequency', 'car care tips', 'maintenance schedule'],
        isPublished: true,
        publishedAt: randomDate(40, 20),
        seoTitle: 'How Often Should You Wash Your Car? | GoMotarCar',
        seoDescription: 'Learn how often you should wash your car based on parking, weather, driving habits, and environment. Expert recommendations.',
        readingTime: 4,
        createdBy: adminId,
      },
    ]);
    console.log(`  ✓ Created ${blogs.length} blog posts`);
  } else {
    console.log(`  - ${blogCount} blogs already exist, skipping`);
  }

  // ─────────────────────────────────────────────
  // FAQs
  // ─────────────────────────────────────────────
  const faqCount = await FAQ.countDocuments();
  if (faqCount === 0) {
    console.log('📌 Creating FAQs...');
    const faqs = await FAQ.insertMany([
      { question: 'How do I book a car wash?', answer: 'You can book a car wash through the GoMotarCar app available on Android and iOS, or through our website. Simply select your vehicle, choose a service package, pick a time slot, and confirm your booking.', category: 'booking', position: 1, isActive: true, createdBy: adminId },
      { question: 'What services do you offer?', answer: 'We offer exterior wash, interior cleaning, full detailing, engine bay cleaning, polish & wax, AC service, underbody wash, and more. Check our Services page for the complete list.', category: 'general', position: 2, isActive: true, createdBy: adminId },
      { question: 'How long does a car wash take?', answer: 'Our Express Wash takes just 15 minutes. A standard wash takes about 30-45 minutes, while full detailing can take 2-4 hours depending on the package.', category: 'booking', position: 3, isActive: true, createdBy: adminId },
      { question: 'Do I need to be present during the wash?', answer: 'Yes, we recommend you be present or arrange for key handover. Our partners require access to the vehicle keys to move it in and out of the service bay.', category: 'general', position: 4, isActive: true, createdBy: adminId },
      { question: 'What payment methods do you accept?', answer: 'We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and digital wallets. You can also pay in cash at select locations.', category: 'payment', position: 5, isActive: true, createdBy: adminId },
      { question: 'Can I cancel or reschedule my booking?', answer: 'Yes, you can cancel or reschedule your booking up to 2 hours before the scheduled time without any charge. Cancellations within 2 hours may incur a small fee.', category: 'booking', position: 6, isActive: true, createdBy: adminId },
      { question: 'What is a subscription plan?', answer: 'Our subscription plans offer discounted regular car washes for a fixed monthly fee. Choose from Basic, Premium, or Elite plans based on your needs. Subscribe and save up to 40%!', category: 'subscription', position: 7, isActive: true, createdBy: adminId },
      { question: 'How do subscription cleanings work?', answer: 'Each month, you get a set number of cleanings based on your plan. Simply book a slot through the app — your cleaning balance will be deducted automatically. Unused cleanings do not roll over to the next month.', category: 'subscription', position: 8, isActive: true, createdBy: adminId },
      { question: 'Can I pause my subscription?', answer: 'Yes, you can pause your subscription for up to 30 days. Simply go to your subscription settings in the app and select "Pause". Your subscription will resume automatically after the pause period.', category: 'subscription', position: 9, isActive: true, createdBy: adminId },
      { question: 'What if I\'m not satisfied with the service?', answer: 'Customer satisfaction is our priority. If you\'re not happy with the service, please contact our support team within 24 hours and we\'ll make it right — including a complimentary re-wash if needed.', category: 'general', position: 10, isActive: true, createdBy: adminId },
      { question: 'Do you clean the car interior?', answer: 'Yes! We offer comprehensive interior cleaning including vacuuming, dashboard cleaning, window cleaning, and upholstery shampooing. Select the interior cleaning package when booking.', category: 'general', position: 11, isActive: true, createdBy: adminId },
      { question: 'Is there a membership or loyalty program?', answer: 'Yes! GoMotarCar Rewards lets you earn points on every wash. Points can be redeemed for free services, upgrades, and exclusive discounts. Download the app and start earning!', category: 'payment', position: 12, isActive: true, createdBy: adminId },
      { question: 'Are your cleaning products safe for car paint?', answer: 'Absolutely. We use only professional-grade, pH-neutral car shampoos and detailing products that are safe for all paint types including clear coat, ceramic coating, and PPF.', category: 'general', position: 13, isActive: true, createdBy: adminId },
      { question: 'Do you offer fleet or corporate services?', answer: 'Yes, we have special packages for corporate fleets, taxi aggregators, and apartment complexes. Contact our sales team for customized pricing and volume discounts.', category: 'general', position: 14, isActive: true, createdBy: adminId },
      { question: 'How can I become a GoMotarCar partner?', answer: 'We\'re always looking for quality service partners! Visit our Partner page and fill out the application form. Our team will review and get back to you within 48 hours.', category: 'general', position: 15, isActive: true, createdBy: adminId },
    ]);
    console.log(`  ✓ Created ${faqs.length} FAQs`);
  } else {
    console.log(`  - ${faqCount} FAQs already exist, skipping`);
  }

  // ─────────────────────────────────────────────
  // Policies
  // ─────────────────────────────────────────────
  const policyCount = await Policy.countDocuments();
  if (policyCount === 0) {
    console.log('📌 Creating policies...');
    const policies = await Policy.insertMany([
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        type: 'privacy',
        content: `# Privacy Policy\n\nLast updated: ${new Date().toLocaleDateString('en-IN')}\n\n## Information We Collect\n\nWe collect information you provide directly to us, such as your name, phone number, email address, vehicle details, and payment information when you use our services.\n\n## How We Use Your Information\n- To provide and improve our car wash services\n- To process payments and send receipts\n- To send service reminders and promotional offers\n- To respond to your inquiries and support requests\n- To analyze usage patterns and improve our app\n\n## Data Sharing\nWe do not sell your personal information to third parties. We may share data with:\n- Payment processors for transaction processing\n- Service partners to fulfill your booking\n- Legal authorities if required by law\n\n## Data Security\nWe implement industry-standard security measures including encryption, secure servers, and access controls to protect your data.\n\n## Your Rights\nYou have the right to access, update, or delete your personal information at any time through your account settings.\n\n## Contact Us\nFor privacy-related inquiries, contact us at privacy@gomotarcar.com`,
        summary: 'How GoMotarCar collects, uses, and protects your personal information.',
        version: '2.0',
        isPublished: true,
        publishedAt: randomDate(30, 5),
        lastReviewedAt: randomDate(10, 1),
        createdBy: adminId,
      },
      {
        title: 'Terms & Conditions',
        slug: 'terms-and-conditions',
        type: 'terms',
        content: `# Terms & Conditions\n\nLast updated: ${new Date().toLocaleDateString('en-IN')}\n\n## Acceptance of Terms\nBy using GoMotarCar services, you agree to these terms and conditions. If you do not agree, please do not use our services.\n\n## Services\nGoMotarCar provides car cleaning and detailing services through its network of partner service providers.\n\n## User Responsibilities\n- Provide accurate vehicle and contact information\n- Ensure vehicle is accessible at the scheduled time\n- Remove personal valuables from the vehicle before service\n- Inform us of any pre-existing damage before service\n\n## Booking & Cancellation\n- Bookings can be made through the app or website\n- Free cancellation up to 2 hours before the scheduled time\n- Late cancellations may incur a fee\n- No-shows will be charged the full service amount\n\n## Payment Terms\n- Payment is due at the time of booking or service completion\n- All prices include applicable taxes\n- Refunds are processed within 5-7 business days\n\n## Limitation of Liability\nGoMotarCar's liability is limited to the value of the service provided. We are not responsible for:\n- Pre-existing damage to the vehicle\n- Personal items left in the vehicle\n- Indirect or consequential damages\n\n## Changes to Terms\nWe reserve the right to modify these terms at any time. Users will be notified of material changes.`,
        summary: 'Terms governing the use of GoMotarCar services and platform.',
        version: '1.5',
        isPublished: true,
        publishedAt: randomDate(60, 30),
        lastReviewedAt: randomDate(15, 2),
        createdBy: adminId,
      },
      {
        title: 'Refund Policy',
        slug: 'refund-policy',
        type: 'refund',
        content: `# Refund Policy\n\nLast updated: ${new Date().toLocaleDateString('en-IN')}\n\n## Service Refunds\n\nWe strive for 100% customer satisfaction. If you're not happy with our service:\n\n### Within 24 Hours\nContact our support team and we will:\n- Arrange a complimentary re-wash at no cost\n- OR issue a full refund to your original payment method\n\n### Subscription Refunds\n- Monthly plans: Prorated refund for unused portion\n- Quarterly plans: Refund within 7 days of purchase, prorated thereafter\n- Annual plans: Refund within 14 days of purchase, 50% refund after 14 days\n\n## Refund Processing Time\n- UPI/Wallet: 24-48 hours\n- Credit/Debit Card: 5-7 business days\n- Net Banking: 3-5 business days\n\n## Non-Refundable Items\n- Express Wash bookings that were completed\n- Partial services that were rendered\n- Late cancellation fees\n- No-show charges\n\n## How to Request a Refund\n1. Open the GoMotarCar app\n2. Go to Help & Support\n3. Select "Request Refund"\n4. Provide booking details and reason\n5. Our team will process within 24 hours\n\nOr email us at refunds@gomotarcar.com`,
        summary: 'Refund and cancellation policy for GoMotarCar services.',
        version: '1.2',
        isPublished: true,
        publishedAt: randomDate(45, 15),
        lastReviewedAt: randomDate(10, 1),
        createdBy: adminId,
      },
      {
        title: 'Shipping Policy',
        slug: 'shipping-policy',
        type: 'shipping',
        content: `# Shipping & Delivery Policy\n\nLast updated: ${new Date().toLocaleDateString('en-IN')}\n\nSince GoMotarCar provides on-location car cleaning services rather than physical products, this policy covers our service delivery expectations.\n\n## Service Delivery\n- Our partner arrives at the scheduled location within the booked time slot\n- Service duration varies by package (15 min to 4 hours)\n- You will receive a notification when the service is about to begin and when it's completed\n\n## Digital Receipts\n- Invoices and receipts are delivered digitally via email and the app\n- You can download invoices from your booking history\n- Physical receipts are available on request\n\n## Service Area\n- Currently serving Mumbai Metropolitan Region\n- New cities being added regularly\n- Check app for service availability in your area\n\n## Contact\nFor any delivery-related concerns, contact support@gomotarcar.com`,
        summary: 'Service delivery policy for GoMotarCar on-location car cleaning.',
        version: '1.0',
        isPublished: true,
        publishedAt: randomDate(90, 60),
        lastReviewedAt: randomDate(20, 5),
        createdBy: adminId,
      },
      {
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        type: 'cookies',
        content: `# Cookie Policy\n\nLast updated: ${new Date().toLocaleDateString('en-IN')}\n\n## What Are Cookies\nCookies are small text files stored on your device when you visit our website or use our app. They help us provide a better user experience.\n\n## How We Use Cookies\n- **Essential Cookies:** Required for the website/app to function properly\n- **Analytics Cookies:** Help us understand how you use our platform\n- **Preference Cookies:** Remember your settings and preferences\n- **Marketing Cookies:** Used to show relevant promotions (only with your consent)\n\n## Third-Party Cookies\nWe use trusted third-party services that may set cookies:\n- Google Analytics (usage analysis)\n- Razorpay (payment processing)\n- Firebase (app functionality and analytics)\n\n## Managing Cookies\nYou can control cookies through your browser settings. Disabling certain cookies may affect platform functionality.\n\n## Contact\nFor cookie-related inquiries: privacy@gomotarcar.com`,
        summary: 'How GoMotarCar uses cookies and similar tracking technologies.',
        version: '1.0',
        isPublished: true,
        publishedAt: randomDate(30, 5),
        lastReviewedAt: randomDate(5, 0),
        createdBy: adminId,
      },
      {
        title: 'Community Guidelines',
        slug: 'community-guidelines',
        type: 'other',
        content: `# Community Guidelines\n\nLast updated: ${new Date().toLocaleDateString('en-IN')}\n\n## Our Commitment\nGoMotarCar is committed to providing a safe, respectful, and positive experience for all users, partners, and team members.\n\n## User Conduct\n- Treat service partners with respect\n- Provide accurate information when booking\n- Communicate cancellations promptly\n- Report any issues through proper channels\n\n## Partner Standards\n- Maintain high service quality\n- Arrive on time for scheduled bookings\n- Use approved cleaning products and methods\n- Respect customer property and privacy\n\n## Prohibited Activities\n- Harassment or abuse of any kind\n- Fraudulent bookings or payments\n- Damage to vehicles or property\n- Misrepresentation of services\n\n## Reporting Violations\nIf you witness or experience a violation of these guidelines, please report it immediately through:\n- App: Help & Support > Report a Concern\n- Email: compliance@gomotarcar.com\n- Phone: +91-9876543210\n\n## Consequences\nViolations may result in:\n- Warning notification\n- Temporary suspension\n- Permanent account termination\n- Legal action if warranted\n\nTogether, we build a better car care community!`,
        summary: 'Guidelines for users and service partners on the GoMotarCar platform.',
        version: '1.1',
        isPublished: true,
        publishedAt: randomDate(20, 3),
        lastReviewedAt: randomDate(5, 0),
        createdBy: adminId,
      },
    ]);
    console.log(`  ✓ Created ${policies.length} policies`);
  } else {
    console.log(`  - ${policyCount} policies already exist, skipping`);
  }

  // ─────────────────────────────────────────────
  // Contact Requests (sample inquiries)
  // ─────────────────────────────────────────────
  const contactCount = await ContactRequest.countDocuments();
  if (contactCount === 0) {
    console.log('📌 Creating sample contact requests...');
    const requests = await ContactRequest.insertMany([
      { name: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', phone: '+919876543210', subject: 'Corporate Fleet Inquiry', message: 'Hi, I am the facilities manager at ABC Corp and we have a fleet of 25 cars that need regular washing. Can you share your corporate package details and pricing? We are based in Andheri East.', page: 'corporate', status: 'new', createdBy: adminId },
      { name: 'Priya Sharma', email: 'priya.sharma@yahoo.com', phone: '+919876543211', subject: 'Subscription Cancellation', message: 'I would like to cancel my premium subscription. I am moving to Pune and your service is not available there yet. Please process the refund for the unused amount.', page: 'subscription', status: 'read', createdBy: adminId },
      { name: 'Amit Verma', email: 'amit.verma@gmail.com', subject: 'Partnership Opportunity', message: 'I own a car detailing business in Navi Mumbai with 3 service bays. I would like to explore becoming a GoMotarCar partner. Please let me know the requirements and process.', page: 'partner', status: 'new', createdBy: adminId },
      { name: 'Sneha Patel', email: 'sneha.patel@outlook.com', phone: '+919876543212', subject: 'Unsatisfactory Service', message: 'I booked a premium wash for my Hyundai Creta yesterday but the interior was not vacuumed properly. There is still dirt on the floor mats. Please arrange a re-wash or refund.', page: 'support', status: 'replied', createdBy: adminId },
      { name: 'Vijay Singh', email: 'vijay.singh@gmail.com', phone: '+919876543213', subject: 'App Technical Issue', message: 'The app crashes every time I try to upload a photo of my car for the profile section. I am using the latest version on iPhone 14. Please fix this issue.', page: 'support', status: 'read', createdBy: adminId },
      { name: 'Ananya Gupta', email: 'ananya.gupta@gmail.com', subject: 'Feedback & Suggestion', message: 'I love your service! Just a suggestion - it would be great if you could add a reminder feature in the app for scheduled washes. Also, please consider expanding to Navi Mumbai sector 15 area.', page: 'feedback', status: 'new', createdBy: adminId },
      { name: 'Deepak Joshi', email: 'deepak.joshi@gmail.com', phone: '+919876543214', subject: 'Billing Issue', message: 'I was charged twice for my booking on 15th March. Booking ID: BKG-4521. Please refund the duplicate payment of ₹499 to my UPI account.', page: 'support', status: 'read', createdBy: adminId },
      { name: 'Neha Singh', email: 'neha.singh@rediffmail.com', subject: 'Incorrect Vehicle Details', message: 'I accidentally added wrong vehicle number while booking. It should be MH-02-AB-1234 instead of MH-02-AB-4321. Can you please update it? My booking is for tomorrow morning.', page: 'support', status: 'closed', createdBy: adminId },
      { name: 'Ravi Verma', email: 'ravi.verma@gmail.com', subject: 'Apartment Complex Tie-Up', message: 'I am the chairman of Green Valley Heights society in Bandra. We have 200+ residents with cars. We are looking for a regular car wash service for our community. Please share your apartment package details.', page: 'corporate', status: 'new', createdBy: adminId },
      { name: 'Kavita Reddy', email: 'kavita.reddy@gmail.com', phone: '+919876543215', subject: 'Gift Voucher Inquiry', message: 'I want to purchase a gift voucher for my husband\'s birthday. He loves car detailing. Can you create a custom voucher for a full detailing package? Please let me know the options and pricing.', page: 'general', status: 'new', createdBy: adminId },
    ]);
    console.log(`  ✓ Created ${requests.length} sample contact requests`);
  } else {
    console.log(`  - ${contactCount} contact requests already exist, skipping`);
  }

  // ─────────────────────────────────────────────
  // Download Links
  // ─────────────────────────────────────────────
  const dlCount = await DownloadLink.countDocuments();
  if (dlCount === 0) {
    console.log('📌 Creating download links...');
    const links = await DownloadLink.insertMany([
      {
        title: 'GoMotarCar for Android',
        platform: 'android',
        url: 'https://play.google.com/store/apps/details?id=com.gomotarcar.app',
        isActive: true,
        position: 1,
        description: 'Download the GoMotarCar app from Google Play Store',
        createdBy: adminId,
      },
      {
        title: 'GoMotarCar for iOS',
        platform: 'ios',
        url: 'https://apps.apple.com/in/app/gomotarcar/id1234567890',
        isActive: true,
        position: 2,
        description: 'Download the GoMotarCar app from Apple App Store',
        createdBy: adminId,
      },
      {
        title: 'GoMotarCar Web App',
        platform: 'web',
        url: 'https://www.gomotarcar.com',
        isActive: true,
        position: 3,
        description: 'Access GoMotarCar through your web browser',
        createdBy: adminId,
      },
      {
        title: 'Partner App for Android',
        platform: 'android',
        url: 'https://play.google.com/store/apps/details?id=com.gomotarcar.partner',
        isActive: true,
        position: 4,
        description: 'Download the GoMotarCar Partner app for service providers',
        createdBy: adminId,
      },
    ]);
    console.log(`  ✓ Created ${links.length} download links`);
  } else {
    console.log(`  - ${dlCount} download links already exist, skipping`);
  }

  console.log('\n✅ CMS seeding complete!\n');
  console.log('   CMS Content Summary:');
  console.log('   ├─ Banners          : 6 promotional banners');
  console.log('   ├─ Blog Posts       : 10 articles on car care');
  console.log('   ├─ FAQs             : 15 frequently asked questions');
  console.log('   ├─ Policies         : 6 legal & policy documents');
  console.log('   ├─ Contact Requests : 10 sample inquiries');
  console.log('   └─ Download Links   : 4 app store links\n');
}

// Export for auto-seed from server startup
module.exports = { seedCMS };

// Allow running directly via `node src/seed-cms.js`
if (require.main === module) {
  seedCMS().then(() => {
    console.log('Disconnecting...');
    mongoose.connection.close();
    process.exit(0);
  }).catch(err => {
    console.error('❌ CMS seeding failed:', err);
    process.exit(1);
  });
}

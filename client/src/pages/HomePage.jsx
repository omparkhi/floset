import React from 'react';
import HeroSection from '../components/home/HeroSection';
import NewArrivalsGrid from '../components/home/NewArrivalsGrid';
import SeasonalDropSection from '../components/home/SeasonalDropSection';
import CategoryTabs from '../components/home/CategoryTabs';
import BrandEditorialBanner from '../components/home/BrandEditorialBanner';
import HowItWorksUSP from '../components/home/HowItWorksUSP';
import TestimonialsMarquee from '../components/home/TestimonialsMarquee';
import JournalSection from '../components/home/JournalSection';
import InstagramShowcase from '../components/home/InstagramShowcase';
import NewsletterSection from '../components/home/NewsletterSection';

export default function HomePage({
  products,
  onSelectProduct,
  onNavigate,
  onOpenListOutfit
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <HeroSection
        onExplore={() => onNavigate('shop')}
        onListOutfit={onOpenListOutfit}
        onSelectProduct={onSelectProduct}
        featuredProduct={products[0]}
      />

      {/* Subtle Capsule Divider */}
      <div className="flex justify-center pt-6 pb-2 bg-white">
        <div className="w-8 h-1 bg-neutral-300 rounded-full" />
      </div>

      {/* 2. Infinite Marquee Ticker (removed) */}

      {/* 3. New Arrivals Grid */}
      <NewArrivalsGrid
        products={products}
        onSelectProduct={onSelectProduct}
        onNavigate={onNavigate}
      />

      {/* 4. Seasonal Drop (3-Card Editorial Split matching Framer) */}
      <SeasonalDropSection onNavigate={onNavigate} />

      {/* 5. Shop by Categories */}
      <CategoryTabs
        products={products}
        onSelectProduct={onSelectProduct}
        onNavigate={onNavigate}
      />

      {/* 7. Brand Editorial Philosophy Banner */}
      <BrandEditorialBanner
        onExplore={() => onNavigate('shop')}
        onListOutfit={onOpenListOutfit}
      />

      {/* 8. Shop With Confidence (The FLOSET 4-Pillar Guarantee) */}
      <HowItWorksUSP />

      {/* 9. Style Loved by Thousands (Infinite Testimonials Marquee) */}
      <TestimonialsMarquee />

      {/* 10. From The Journal */}
      <JournalSection onNavigate={onNavigate} />

      {/* 11. Follow Us on Instagram Community Showcase */}
      <InstagramShowcase />

      {/* 12. Join Our Newsletter */}
      <NewsletterSection />
    </div>
  );
}

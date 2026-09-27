import React, { useState, useEffect } from 'react';

export default function HeroSection({ onExplore, onSelectProduct }) {
  const slides = [
    {
      title: 'A Wardrobe Beyond Your Closet.',
      subtitle: `Discover stylish outfits for every occasion. Rent what you love, wear it with confidence, and return it when you're done—with every outfit cleaned and quality-checked before delivery.
`,
      buttonText: 'Explore FLOSET',
      image: 'https://framerusercontent.com/images/RdZtXOQVg6jVWKomi937lN2LFc.png',
      cardTitle: 'Popular T-shirts',
      cardSubtitle: 'Shop now',
      cardImage: 'https://framerusercontent.com/images/upIFky4DATIajqQ0EjWgzyb1Bo.png?width=1000&height=1000'
    },
    {
      title: 'Turn Your Closet Into Income.',
      subtitle: 'List the outfits you rarely wear and let them earn for you. FLOSET connects your wardrobe with people looking to rent, while we handle the bookings, cleaning, delivery, and returns.',
      buttonText: 'Explore Vault',
      image: 'https://framerusercontent.com/images/ecDrUJOjwliI8kui8IcGrKIJGk.png',
      cardTitle: 'Bridal Lehengas',
      cardSubtitle: 'View vault',
      cardImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'
    },
    {
      title: 'Fashion, Made Effortless.',
      subtitle: "From finding your perfect look to getting it delivered and returning it after your occasion, FLOSET takes care of the entire rental experience. Choose your outfit, pick your dates, wear it your way, and return it when you're done ",
      buttonText: 'Rent Now',
      image: 'https://framerusercontent.com/images/0Bqkt7LQ4Wtn1XjmDEj5KF65qg.png',
      cardTitle: 'Italian Tuxedos',
      cardSubtitle: 'Rent outfits',
      cardImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide];

  return (
    <section className="relative w-full -mt-[72px] sm:-mt-[76px] h-screen min-h-[660px] max-h-[960px] overflow-hidden flex flex-col justify-end bg-neutral-900 select-none">
      {/* Background Image Slideshow with Crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Top Vignette (enhances navbar legibility) */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-black/50 via-black/15 to-transparent pointer-events-none" />

        {/* Bottom Editorial Gradient (ensures text pops with maximum contrast) */}
        <div className="absolute bottom-0 inset-x-0 h-[480px] bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Main Content Grid: Bottom-Left Heading/Subtitle/CTA & Bottom-Right Floating Card */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-16 flex items-end justify-between gap-6">
        {/* Left Column: Heading, Subtitle, Shop Now Button */}
        <div className="max-w-xl text-left">
          <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold text-white tracking-tight leading-[1.05] drop-shadow-sm animate-in fade-in duration-500">
            {active.title}
          </h1>

          <p className="text-white/95 text-base sm:text-lg md:text-xl font-normal mt-3 mb-6 sm:mb-8 max-w-lg leading-snug drop-shadow animate-in fade-in duration-700">
            {active.subtitle}
          </p>

          <button
            onClick={onExplore}
            className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
          >
            {active.buttonText}
          </button>
        </div>

        {/* Right Floating Product Card */}
        <div
          onClick={onExplore}
          className="hidden sm:flex items-center gap-3.5 bg-white rounded-2xl p-3 shadow-2xl border border-black/5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer group mb-1 animate-in fade-in zoom-in-95 duration-500"
        >
          <img
            src={active.cardImage}
            alt={active.cardTitle}
            className="w-14 h-16 rounded-xl object-cover bg-neutral-100 flex-shrink-0"
          />
          <div className="pr-3 text-left">
            <p className="text-sm font-bold text-neutral-900 leading-tight">
              {active.cardTitle}
            </p>
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1 mt-1 group-hover:text-black transition-colors">
              <span>{active.cardSubtitle}</span>
              <span className="text-[13px] inline-block group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                ↗
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Center Slide Pill Dashes */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? 'w-8 bg-white'
                : 'w-8 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

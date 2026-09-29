import React from 'react';
import { BookingSearch } from './BookingSearch';

interface HeroProps {
  onSearch: (criteria: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  return (
    <section className="relative w-full pt-32 pb-24 lg:pt-40 lg:pb-32 bg-charcoal-950 overflow-hidden">
      {/* Cinematic Automotive Editorial Photograph */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-[0.42] contrast-[1.1] scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2200')`,
        }}
      />

      {/* Subtle Vignette & Gradient Treatment */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-charcoal-950/70 pointer-events-none" />

      {/* Main Hero Typography Content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 z-10">
        <div className="max-w-3xl mb-12 sm:mb-16">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-champagne-400"></span>
            <span className="font-mono text-xs text-champagne-400 uppercase tracking-editorial font-medium">
              DRIVE WITHOUT COMPROMISE
            </span>
          </div>

          {/* Large Editorial Serif Headline */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-stone-50 font-normal tracking-tight leading-[1.08] mb-6">
            Your journey.<br />
            <span className="italic font-normal text-stone-200">Your car.</span>
          </h1>

          {/* Supporting Statement */}
          <p className="font-sans text-base sm:text-lg text-stone-300/90 leading-relaxed font-light max-w-xl">
            Choose from a curated fleet of 52 precision-maintained vehicles. Experience transparent dual-metric billing, statutory 4-hour minimum rates, uniform climate apparatus options, and zero unexpected charges.
          </p>
        </div>

        {/* Substantial Horizontal Booking Panel */}
        <div className="w-full">
          <BookingSearch onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
};

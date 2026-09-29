import React from 'react';

export const LocationsSection: React.FC = () => {
  const routes = [
    {
      title: 'The Heritage Triangle',
      route: 'New Delhi → Agra → Jaipur',
      distance: '480 KM · 3 Days Recommended',
      vehicle: 'Ambassador Classic or Maruti Esteem AC',
      description: 'Stately journey through Mughal monuments, Rajput fortresses, and wide open expressways.',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1200',
    },
    {
      title: 'Himalayan Ridge Expedition',
      route: 'New Delhi → Chandigarh → Shimla Pass',
      distance: '360 KM · 2-4 Days Recommended',
      vehicle: 'Mahindra Armada 4x4 or Tata Sumo',
      description: 'Ascend from the northern plains into pine-scented mountain switchbacks and cool high-altitude terrain.',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200',
    },
    {
      title: 'Western Coastline Highway',
      route: 'Mumbai → Konkan → Goa Coast',
      distance: '580 KM · 4 Days Recommended',
      vehicle: 'Tata Sumo (9 Seater) or Maruti Omni',
      description: 'Sweeping coastal turns, sea-cliff vistas, and lush Western Ghat valleys ideal for group expeditions.',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1200',
    },
  ];

  return (
    <section id="destinations" className="py-24 max-w-7xl mx-auto px-6 sm:px-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-200 pb-8 mb-16">
        <div>
          <span className="font-mono text-xs text-champagne-500 uppercase tracking-editorial font-medium block mb-2">
            DESTINATIONS & TRANSIT HUBS
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl text-charcoal-950 font-normal tracking-tight">
            Where will you go?
          </h2>
        </div>
        <p className="font-sans text-sm text-charcoal-500 font-light max-w-md mt-4 md:mt-0 leading-relaxed">
          Curated driving corridors and regional hubs with certified fleet pickup and drop-off stations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {routes.map((r, i) => (
          <div
            key={i}
            className="group bg-white border border-stone-200/90 hover:border-charcoal-900 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-900">
                <img
                  src={r.image}
                  alt={r.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.9] contrast-[1.05]"
                />
                <div className="absolute bottom-3 left-3 bg-charcoal-950/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono text-stone-100 uppercase tracking-wider">
                  {r.route}
                </div>
              </div>

              <div className="p-6">
                <span className="font-mono text-[10px] uppercase tracking-luxury text-champagne-600 block mb-1">
                  Corridor {i + 1}
                </span>
                <h3 className="font-serif text-2xl text-charcoal-950 font-normal tracking-tight mb-2">
                  {r.title}
                </h3>
                <div className="font-mono text-xs text-charcoal-500 mb-3">
                  {r.distance}
                </div>
                <p className="font-sans text-xs text-charcoal-600 font-light leading-relaxed mb-4">
                  {r.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-stone-100">
              <span className="font-mono text-[10px] text-charcoal-400 uppercase tracking-wider block">
                Recommended Fleet Class:
              </span>
              <span className="font-sans text-xs font-semibold text-charcoal-900">
                {r.vehicle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

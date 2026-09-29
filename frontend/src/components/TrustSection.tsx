import React from 'react';

export const TrustSection: React.FC = () => {
  const guarantees = [
    {
      index: '01',
      title: 'FLEXIBLE RENTAL & 4-HR MINIMUM',
      description:
        'Rent for as little as four hours or embark on extended multi-week expeditions. Billing dynamically applies the statutory 4-hour minimum floor so you never overpay for short urban hops.',
    },
    {
      index: '02',
      title: 'DUAL-METRIC TRANSPARENCY',
      description:
        'Charges are determined strictly by the maximum of hours used or kilometers traveled. AC vehicles are uniformly surcharged at 50%, with zero hidden administrative fees at return.',
    },
    {
      index: '03',
      title: 'CERTIFIED FLEET STEWARDSHIP',
      description:
        'Every vehicle in our 52-car inventory undergoes scheduled workshop overhauls, brake pad inspection, and departure odometer calibration before leaving the depot.',
    },
    {
      index: '04',
      title: 'UNIFORM DEMURRAGE PROTOCOL',
      description:
        'Outstation journeys requiring overnight halts incur a predictable, flat demurrage fee of exactly ₹150 per night halt regardless of whether you pilot an Omni or an Esteem.',
    },
  ];

  return (
    <section id="guarantees" className="py-24 bg-charcoal-950 text-stone-100 border-t border-stone-200/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-200/10 pb-8 mb-16">
          <div>
            <span className="font-mono text-xs text-champagne-400 uppercase tracking-editorial font-medium block mb-2">
              OPERATIONAL GUARANTEES
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl text-stone-50 font-normal tracking-tight">
              Built on precision and trust.
            </h2>
          </div>
          <p className="font-sans text-sm text-stone-400 font-light max-w-md mt-4 md:mt-0 leading-relaxed">
            Statutory principles governing every reservation, dispatch, and return across the fleet.
          </p>
        </div>

        {/* 4 Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guarantees.map((g) => (
            <div
              key={g.index}
              className="p-8 border border-stone-200/10 hover:border-champagne-400/40 bg-charcoal-900/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs text-champagne-400 font-semibold tracking-widest block mb-4">
                  {g.index}
                </span>
                <h3 className="font-mono text-xs uppercase tracking-luxury text-stone-100 font-semibold mb-3">
                  {g.title}
                </h3>
                <p className="font-sans text-xs text-stone-300/80 font-light leading-relaxed">
                  {g.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

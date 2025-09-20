'use server';

import Image from 'next/image';

export default async function WhatWeDo() {
  return (
    <div className="font-serif text-neutral-900">
      {/* Our Mission */}
      <section className="bg-[url('/buildings-hero.jpg')] bg-cover bg-center text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6">Our Mission</h1>
          <p className="text-base md:text-lg leading-7 md:leading-8">
            Through our rigorous 10-week new member education process, new members work on two
            case studies of successful startups. This process provides members with a deep
            understanding of how to obtain investment, manage finances, develop ideas, and drive
            company growth. In the final three weeks, students work with teammates to initiate and
            develop their own projects. Then, they pitch to successful investors associated with
            LALALALA, which is an exclusive opportunity available only to Cornell
            Capital Club members.
          </p>
        </div>
      </section>

      {/* Crest / Divider */}
      <section className="pt-12 md:pt-16">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          <div className="flex-1 h-px bg-cornell-dark-brown"></div>
          <Image
            src="/eagle.png"
            alt="LALALALA eagle"
            width={420}
            height={420}
            className="object-contain mx-8"
            priority
          />
          <div className="flex-1 h-px bg-cornell-dark-brown"></div>
        </div>
      </section>

      {/* Our Program */}
      <section className="pb-2">
        <div className="max-w-4xl mx-auto px-6 py-4 bg-gray-100 rounded-lg">
          <h2 className="text-3xl md:text-4xl font-serif text-center cornell-dark-brown mt-4 mb-12">Our Program</h2>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* New Member Education */}
            <div className="relative text-center">
              <div className="flex mx-8 mb-2 h-1 bg-cornell-dark-brown"></div>
              <div className="h-16 flex items-center justify-center mb-4">
                <p className="text-2xl font-serif cornell-dark-brown">New Member Education</p>
              </div>
              <p className="text-gray-600 leading-relaxed font-serif">
                This enables members to bring their entrepreneurial visions to life, receiving
                practical guidance whether funded or not. Securing potential investments from our
                private investors, participants are prepared for challenges in the venture and
                financial industries. Through this initiative, participants not only refine their
                skills but also engage in the practical dynamics of the venture and financial
                industries, preparing them for the challenges and opportunities that lie ahead.
              </p>
            </div>

            {/* Group Dialogue */}
            <div className="relative text-center">
              <div className="flex mx-8 mb-2 h-1 bg-cornell-dark-brown"></div>
              <div className="h-16 flex items-center justify-center mb-4">
                <p className="text-2xl font-serif cornell-dark-brown">Group Dialogue</p>
              </div>
              <p className="text-gray-600 leading-relaxed font-serif">
                Our members actively engage in private dinners with successful mentors and
                investors. We provide a variety of opportunities, from public speaking and pitching
                ideas to interacting with new communities. We are dedicated to both networking and
                hands-on practical experiences, making our club a unique community within the worlds
                of entrepreneurship and finance.
              </p>
            </div>

            {/* Sophomore Education Series */}
            <div className="relative text-center">
              <div className="flex mx-8 mb-2 h-1 bg-cornell-dark-brown"></div>
              <div className="h-16 flex items-center justify-center mb-4">
                <p className="text-2xl font-serif cornell-dark-brown">Sophomore Education Series</p>
              </div>
              <p className="text-gray-600 leading-relaxed font-serif">
                As an extension of our commitment to continuous learning and growth, the Sophomore
                Education Series is designed to provide intensive hands-on experience for our
                members. Students who have successfully completed New Member Education are granted
                access to an active role within one of our established startups, collaborating as a
                team, receiving compensation, and gaining professional experience to augment their
                resumes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Placements */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex w-48 mx-auto mb-2 h-1 bg-cornell-dark-brown"></div>
          <h2 className="text-3xl md:text-4xl font-serif text-center cornell-dark-brown mb-8">Placements & Connections</h2>
          <p className="max-w-3xl mx-auto text-sm md:text-base text-neutral-800 mb-10">
            Every year, our members will travel to visit top finance and business firms, giving us
            access to private information conferences, private dinners, and exclusive networking
            opportunities with Cornell alumni.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 mb-12 items-center justify-items-center">
            {/* Investment Banks */}
            <Image src="/goldman-sachs.jpg" alt="Goldman Sachs" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/morgan-stanley.png" alt="Morgan Stanley" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/jp-morgan.jpg" alt="JP Morgan" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/merrill-lynch.png" alt="Merrill Lynch" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            
            {/* Commercial Banks */}
            <Image src="/wells-fargo.png" alt="Wells Fargo" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/bank-of-america.png" alt="Bank of America" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/barclays.png" alt="Barclays" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />

            {/* Private Equity & Investment Management */}
            <Image src="/blackstone.png" alt="Blackstone" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            
            {/* Consulting */}
            <Image src="/mckinsey.png" alt="McKinsey" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            
            {/* Technology */}
            <Image src="/amazon.png" alt="Amazon" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/google.png" alt="Google" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/apple.png" alt="Apple" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/meta.png" alt="Meta" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/vercel.png" alt="Vercel" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            
            {/* Financial Services & Trading */}
            <Image src="/visa.png" alt="Visa" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/bloomberg.jpg" alt="Bloomberg" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/susquehanna.jpg" alt="Susquehanna" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            
            {/* Venture Capital & Entrepreneurship */}
            <Image src="/a16z.jpg" alt="Andreessen Horowitz" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/y-combinator.png" alt="Y Combinator" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            <Image src="/general-catalyst.png" alt="General Catalyst" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
            {/* <Image src="/eshipcornell.jpg" alt="eShip Cornell" width={120} height={120} className="object-contain aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" /> */}
          </div>
        </div>
      </section>
    </div>
  );
}

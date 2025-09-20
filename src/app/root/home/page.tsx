'use server';

import EyeSection from '@/components/EyeSection';
import Image from 'next/image';

export default async function Home() {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-136 flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"></div>
          </video>

        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-12">
          <p className="text-lg md:text-xl font-sans mb-2 opacity-90 hero-text-shadow">
            Cornell's premier social and financial capital organization
          </p>
          <p className="text-4xl md:text-6xl lg:text-7xl font-serif mb-8 leading-tight hero-text-shadow">
            LALALALA
          </p>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="pt-16 pb-8 bg-white">
        <div className="max-w-5xl mx-auto text-center px-4">
          <p className="text-3xl md:text-4xl font-serif cornell-dark-brown mb-8">
            For the interesting, and interested.
          </p>
          {/* Hands Illustration - Using SVG for the Michelangelo-style hands */}
          <div className="flex justify-center mb-8">
            <Image
              src="/hands-touching.png" 
              alt="Hands Touching" 
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-3xl md:text-4xl font-serif text-center cornell-dark-brown mb-16">
            About Us
          </p>
          
          {/* Three Column Layout */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {/* Column 1: Professional Development */}
            <div className="relative text-center">
              <div className="flex mx-8 mb-2 h-1 bg-cornell-dark-brown"></div>
              <div className="h-16 flex items-center justify-center mb-4">
                <p className="text-2xl font-serif cornell-dark-brown">
                  Professional Development
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed font-serif">
                We prepare our members to be successful entrepreneurs through our carefully tailored curriculum and extensive network of investors and mentors, who share their insights and often unconventional career paths. Our members attend campus events and monthly private meetings, where we offer exclusive access to notable speakers from both the United States and abroad. CCC thereby provides opportunities for undergraduates interested in entrepreneurship, banking, and business to develop and pitch business ideas while networking with both industry professionals and peers.
              </p>
            </div>

            {/* Column 2: Startup Teams */}
            <div className="relative text-center">
              <div className="flex mx-8 mb-2 h-1 bg-cornell-dark-brown"></div>
              <div className="h-16 flex items-center justify-center mb-4">
                <p className="text-2xl font-serif cornell-dark-brown">
                  Startup Teams
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed font-serif">
                LALALALA has a distinctive culture that strongly emphasizes hands-on experience in a highly collegial and collaborative environment. In the business world, achieving success requires not just strategic thinking and access to funding but effective communication with customers, investors, and colleagues. LALALALA’s focus on building a strong community of students and connecting with industry professionals enables our members to build the communication skills needed for success in business.
              </p>
            </div>

            {/* Column 3: Social & Financial Capital Fusion */}
            <div className="relative text-center">
              <div className="flex mx-8 mb-2 h-1 bg-cornell-dark-brown"></div>
              <div className="h-16 flex items-center justify-center mb-4">
                <p className="text-2xl font-serif cornell-dark-brown">
                  Social & Financial Capital Fusion
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed font-serif">
                Annually, members join these specialized teams aligned with their interests and skills: "Financial Capital," "Social Capital," "Trading Capital," and "Equity Capital." They work with our club's diverse range of venture startup clients to provide opportunity to gain practical skills while learning the untaught lessons (learning international mannerisms, to networking etiquette) of the business world, regardless of background, and experience of our members. Teams will compete in leaderboard and investors review feedback to get chosen for club fund investment to develop their project continuously.
              </p>
            </div>
          </div>

          {/* Pillar Image */}
          <div className="flex justify-center mb-12">
            <div className="max-w-4xl w-full">
              <Image 
                src="/ccc-pillars.png" 
                alt="LALALALA pillars" 
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Meeting Room Image */}
          <div className="max-w-4xl mx-auto">
            <Image 
              src="/meeting-room.jpg" 
              alt="Meeting Room" 
              width={800}
              height={600}
              className="w-full h-auto rounded-lg"
            />
            <div className="flex mx-8 my-4 h-1 bg-cornell-dark-brown"></div>
            <Image 
              src="/meeting-2.jpg" 
              alt="Meeting Room" 
              width={800}
              height={192}
              className="w-full h-48 object-cover object-top rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-3xl md:text-4xl font-serif text-center cornell-dark-brown mb-8">
            Why LALALALA?
          </p>
          <p className="text-gray-600 leading-relaxed font-serif">
            LALALALA is an entrepreneurship-focused community providing training and networking opportunities for our members, whether they have started many businesses or none. We are extremely welcoming to students with little to no business or entrepreneurship experience and offer a tailored in-house training program lasting 10 weeks that prepares new members to launch their own businesses. Both new and experienced entrepreneurs will also gain access to our network of mentors and will have the chance to join us in meeting Job Recruiters, where we will visit and network with employees at some of the world's top companies. At the culmination of each semester, members who have developed business ideas will have the opportunity to present them to our select group of external investors to receive feedback and even funding. We are devoted to facilitating professional and personal development for driven entrepreneurial students from all backgrounds looking for a tight-knit community of similarly determined people.
          </p>
        </div>
      </section>

      {/* Eye Section */}
      <EyeSection />

      {/* Instagram Banner Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-8 md:p-12 text-center relative">
            <p className="text-lg md:text-xl font-serif text-gray-800 leading-relaxed">
              Follow{' '}
              <a 
                href="https://instagram.com/cornellcapitalclub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-700 hover:text-red-800 font-semibold transition-colors duration-200"
              >
                @cornellcapitalclub
              </a>
              {' '}on Instagram for updates!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

'use server';

import MembersTable from '@/components/MembersTable';
import ApplyNow from '@/components/ApplyNow';


export default async function Members() {

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-serif cornell-dark-brown mb-8">
            Our Team
          </h1>
          
          {/* Separator Line */}
          <div className="w-full h-px bg-black mb-8"></div>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-serif">
            Our Executive Board work diligently to facilitate and mentor all members of CCC.
          </p>
        </div>
      </section>

      <MembersTable />

      {/* Call to Action Section */}
      <section className="pb-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-serif cornell-dark-brown mb-8">
            Join Our Team
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-serif mb-8">
            Interested in becoming part of the LALALALA leadership? 
            We&apos;re always looking for dedicated members to join our executive board.
          </p>
          <ApplyNow />
        </div>
      </section>
    </div>
  );
}

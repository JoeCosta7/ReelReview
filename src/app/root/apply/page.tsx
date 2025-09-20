'use server';


import ActionButtons from '@/components/ActionButtons';
import EmailForm from '@/components/EmailForm';
import ApplicationStatusText from '@/components/ApplicationStatusText';

export default async function Apply() {

  return (
    <div>
      {/* Fall 2025 Recruitment Section */}
      <section className="bg-[#8B0000] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-5xl md:text-6xl font-serif mb-6">
            Fall 2025 Recruitment
          </p>
          <ApplicationStatusText />
          
          <ActionButtons />
        </div>
      </section>

      {/* Mailing List Section */}
      <section className="bg-gray-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-serif text-black mb-12">
            JOIN OUR MEMBERS ONLY MAILING LIST
          </p>
          
          <EmailForm />
        </div>
      </section>

      {/* Grow Your Vision Section */}
      <section className="bg-[#8B0000] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-serif text-center mb-6">
            Grow Your Vision
          </h2>

          <p className="text-lg font-serif leading-relaxed text-center mb-6">
            We ensure that our onboarding procedure will be:
          </p>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="text-left">
              <p className="text-lg font-serif leading-relaxed">
                <span className="text-xl">1. Equitable.</span> All people, irrespective of their background, experience, or major, have an equal chance of success. To ensure that your performance is not hindered by the personalities of others, we want to ensure that everyone's voice is heard.
              </p>
            </div>
            
            <div className="text-left">
              <p className="text-lg font-serif leading-relaxed">
                <span className="text-xl">2. Insightful.</span> We want you to gain knowledge even if you are not chosen to join CCC as a new member. Our programs are intended to deepen your comprehension of finance and assist us in assessing your potential. Please get in touch with us if you would want feedback on how you performed during the recruitment process.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

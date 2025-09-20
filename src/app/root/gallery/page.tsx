'use server';

import ResumeButton from "@/components/ResumeButton";

export default async function Gallery() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative h-[280px] md:h-[360px] w-full"
      >
        <div className="absolute inset-0 bg-[url('/recruitment-hero.jpg')] bg-cover bg-bottom" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight text-center">
            Our Recruitment Process
          </h1>
        </div>
      </section>

      {/* Intro and attributes */}
      <section className="bg-gray-100 py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-base md:text-lg font-serif text-neutral-800 max-w-3xl mx-auto">
            Our hiring process has been carefully crafted to fit any candidate or study. We are seeking three crucial attributes rather than prior experience in finance or entrepreneurship.
          </p>

          <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-18">
            <span className="text-xl md:text-2xl font-serif cornell-brown">Dedication</span>
            <span className="text-xl md:text-2xl font-serif cornell-brown">Curiosity</span>
            <span className="text-xl md:text-2xl font-serif cornell-brown">Perspicacity</span>
          </div>

          <p className="mt-8 text-sm md:text-base font-serif text-neutral-700 max-w-4xl mx-auto">
            We assess these and other attributes using a three-step process that begins at the start of every semester. Below is our timeline and tools you will need for each step to help you better prepare for CCC recruiting.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-gray-200 py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-white px-6 py-8 shadow-sm">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gray-300 text-black flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="mt-2 text-center font-serif text-lg">Pre-Recruitment</h3>
              <p className="mt-4 text-sm text-neutral-700 leading-6 text-center font-serif">
                Show your first sign of interest by getting to know us both at info sessions, coffee chats, and in-person. Once you apply, you will submit your resume for us to review over
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white px-6 py-8 shadow-sm">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gray-300 text-black flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="mt-2 text-center font-serif text-lg">Resume Round</h3>
              <p className="mt-4 text-sm text-neutral-700 leading-6 text-center font-serif">
                This is your time to shine. Show us how you think, work, and collaborate in a team environment
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white px-6 py-8 shadow-sm">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gray-300 text-black flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="mt-2 text-center font-serif text-lg">Invite Only Round</h3>
              <p className="mt-4 text-sm text-neutral-700 leading-6 text-center font-serif">
                Your Opportunity to holistically show off your fit through a one on one interview
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <ResumeButton
              className="bg-neutral-900 text-white px-6 py-2 text-lg rounded hover:bg-neutral-800 hover:scale-105 transition-all duration-200"
            >
              Resume Template
            </ResumeButton>
          </div>
        </div>
      </section>
    </div>
  );
}

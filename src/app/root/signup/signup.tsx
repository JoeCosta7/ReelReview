'use server';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SignUpForm from '@/components/SignUpForm';
import ApplicationStatusText from '@/components/ApplicationStatusText';

export default async function Signup() {

  return (
    <div>
    <Header></Header>
      {/* Mailing List Section */}
      <section className="bg-gray-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-serif text-black mb-12">
            Sign Up
          </p>
          
          <SignUpForm />
        </div>
      </section>
    <Footer></Footer>
    </div>
  );
}

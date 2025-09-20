'use server';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/components/LoginForm';


export default async function Login() {

  return (
    <div>
    <Header></Header>
      <section className="bg-gray-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-serif text-black mb-12">
            Log In
          </p>
          
          <LoginForm/>
        </div>
      </section>
    <Footer></Footer>
    </div>
  );
}


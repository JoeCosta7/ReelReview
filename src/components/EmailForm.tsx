'use client';

import addToEmailList from '@/actions/getTranscript';
import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleAddToEmailList = async () => {
    const emailValue = email;
    const success = await addToEmailList(emailValue);
    if (success) {
      setIsSuccess(true);
    } else {
      setIsSuccess(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <label htmlFor="email" className="block text-left text-black text-sm font-medium mb-2">
          Enter your email here *
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-3 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      {isSuccess !== true ? (
        <button 
          className={`${
            isSuccess === false 
              ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700' 
              : 'bg-black hover:bg-gray-800 text-white border-2 border-black hover:border-gray-800'
          } w-32 h-12 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg`} 
          onClick={() => handleAddToEmailList()}
        >
          {isSuccess === false ? 'Try Again' : 'Sign Up'}
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-4 h-24">
          <div className="bg-green-100 border-2 border-green-500 rounded-full p-4 animate-pulse">
            <FaCheck className="text-green-600 text-2xl" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Successfully Signed Up!</h3>
            <p className="text-sm text-gray-600">You'll receive updates about our recruitment process.</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useSession } from '@/app/contexts/SessionContext';

export default function ActionButtons() {
  const { applicationStatus } = useSession();
  
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-16">
      {/* Apply Now Section */}
      <div className="flex flex-col items-center group">
        <div className="w-32 h-32 mb-6 flex items-center justify-center">
          <svg className="w-full h-full text-white group-hover:text-gray-300 transition-colors duration-200" fill="currentColor" viewBox="0 0 200 200">
            <g>
                <path d="M114.733 174.579c45.255-32.506 41.878-73.139 31.072-75.172-9.457-1.355-18.913-4.064-27.018-11.515-15.536-15.576-16.21-40.633-.676-56.208a39.47 39.47 0 0 1 56.064 0c23.641 24.379 12.157 71.787-6.08 101.585-8.105 13.546-19.588 31.154-48.632 46.732l-4.73-5.422z" fill="currentColor" data-color="1"></path>
                <path d="M20.442 174.579c45.255-32.506 41.878-73.139 31.071-75.172-9.457-1.355-18.913-4.064-27.018-11.515-15.536-15.577-16.211-40.634-.676-56.209a39.47 39.47 0 0 1 56.064 0c23.641 24.379 12.157 71.787-6.08 101.585C65.697 146.814 54.215 164.422 25.17 180l-4.728-5.421z" fill="currentColor" data-color="1"></path>
            </g>
          </svg>
        </div>
        <button className={`bg-black text-white w-32 h-12 rounded hover:bg-gray-800 hover:scale-105 transition-all duration-200 ${!applicationStatus?.isOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => window.open(applicationStatus?.applicationsLink, '_blank')}
                disabled={!applicationStatus?.isOpen}>
          {applicationStatus?.isOpen ? 'Apply Now' : 'Closed'}
        </button>
      </div>

      {/* Coffee Chats Section */}
      <div className="flex flex-col items-center group">
        <div className="w-32 h-32 mb-6 flex items-center justify-center">
          <svg className="w-full h-full text-white group-hover:text-gray-300 transition-colors duration-200" fill="currentColor" viewBox="0 0 200 200">
            <g>
              <path d="M92.266 68.223a3.9 3.9 0 0 0 5.48.77 3.947 3.947 0 0 0 .765-5.508c-5.715-7.614-2.971-11.356-.118-15.247 4.635-6.319 9.454-12.891.224-26.522a3.899 3.899 0 0 0-5.432-1.031 3.944 3.944 0 0 0-1.026 5.461c6.107 9.019 2.958 13.316-.072 17.445-4.611 6.289-9.046 12.339.179 24.632z" fill="currentColor"></path>
              <path d="M70.51 70.745a3.898 3.898 0 0 0 5.479.77 3.947 3.947 0 0 0 .766-5.509c-4.509-6.005-2.344-8.957-.093-12.027 4.015-5.477 8.19-11.17.2-22.973a3.897 3.897 0 0 0-5.432-1.032 3.944 3.944 0 0 0-1.025 5.461c4.868 7.191 2.361 10.61-.049 13.896-4.011 5.47-7.866 10.73.154 21.414z" fill="currentColor"></path>
              <path d="M112.243 75.109a3.9 3.9 0 0 0 5.479.77 3.948 3.948 0 0 0 .766-5.509c-4.509-6.005-2.344-8.957-.093-12.027 4.015-5.477 8.19-11.17.2-22.973a3.897 3.897 0 0 0-5.432-1.032 3.944 3.944 0 0 0-1.025 5.461c4.868 7.191 2.361 10.61-.048 13.896-4.012 5.47-7.868 10.729.153 21.414z" fill="currentColor"></path>
              <path d="M178.745 97.21c-1.251-3.315-3.428-6.092-6.638-7.953-3.613-2.094-8.848-2.904-15.076-1.818.074-1.547.239-2.955.018-5.383H26.725c-1.896 20.799 14.078 61.802 38.662 75.465h52.999c6.753-3.754 13.03-10.04 18.49-17.418 3.009-.248 6.507-.791 10.07-1.614 5.948-1.379 12.31-3.533 17.126-6.389 8.956-5.309 14.763-15.554 15.768-24.693h.002c.394-3.618.06-7.129-1.097-10.197zm-7.207 9.277v.016c-.744 6.798-5.059 14.421-11.716 18.368-4.021 2.383-9.524 4.227-14.74 5.436a91.03 91.03 0 0 1-2.029.445c7.098-12.006 12.057-25.159 13.73-34.648 5.14-1.293 8.787-.967 11.172.417 1.413.819 2.392 2.096 2.977 3.648.679 1.798.862 3.979.606 6.318z" fill="currentColor"></path>
              <path d="M53.952 180h75.871c13.222 0 33.143-11.765 33.953-17.141H20C20.811 168.235 39.81 180 53.952 180z" fill="currentColor"></path>
            </g>
          </svg>
        </div>
        <button className="bg-black text-white w-32 h-12 rounded hover:bg-gray-800 hover:scale-105 transition-all duration-200" onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSeNdwbJ8pzGXLXbSWzZGgXx1bdUCviDAvGthzcCrdCiUTQ29Q/viewform', '_blank')}>
          Coffee Chats
        </button>
      </div>
    </div>
  );
}

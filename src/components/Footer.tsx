import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import CCCLogo from './CCCLogo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left: Copyright */}
          <div className="text-left flex-1">
            <p className="text-neutral-800 font-serif text-sm">
              © 2025 by LALALALA
            </p>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center flex-1">
            <CCCLogo width={128} height={128} />
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex space-x-3 flex-1 justify-end">
            <a
              href="https://www.linkedin.com/company/cornell-capital-club/"
              className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="h-4 w-4 text-white" />
            </a>
            <a
              href="https://www.instagram.com/cornellcapitalclub/"
              className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="h-4 w-4 text-white" />
            </a>
          </div>
        </div>

        {/* University affiliation text */}
        <div className="mt-6 text-center">
          <p className="text-neutral-800 font-serif text-sm">
            This organization is a registered student organization of Cornell University
          </p>
        </div>
      </div>
    </footer>
  );
} 
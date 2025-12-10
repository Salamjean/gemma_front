import Link from 'next/link';
import { FaUserMd } from 'react-icons/fa';
import Image from 'next/image';

export default function NavbarHome() {
  const navItems = [
    { name: 'Accueil', href: '/' },
    { name: 'À Propos', href: '/about' },
    { name: 'Contact', href: '/contact' }, 
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-10 shadow-lg" style={{background:"#06b6d4"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. Logo (Gauche) */}
          <Link href="/">
              <Image 
                  src="/gemma.png" 
                  alt="Logo Espace Patient"
                  width={100} 
                  height={30}
                  priority 
              />
          </Link>
          
          {/* 2. Navigation (Centre) */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="text-white hover:text-primary-green transition duration-200 text-base font-medium 
                           border-b-2 border-transparent hover:border-primary-green pb-1" 
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* 3. Bouton d'Action (Droite) */}
          <Link href="/login" passHref>
            <button 
              className="px-4 py-2 border border-white 
               text-white.
                         text-white font-medium 
                         rounded-lg 
                         hover:bg-white hover:text-primary-blue transition duration-200"
            >
              Se Connecter
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
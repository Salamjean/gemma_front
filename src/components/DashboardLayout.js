'use client'; 

import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { FaSignOutAlt, FaBars, FaUserCircle, FaBell, FaCog } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://gemma-ci.com/api'; 

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenuRef = useRef(null);
  const menuTimeoutRef = useRef(null);

  // Fermer le menu profil en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Nettoyer le timeout
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = localStorage.getItem('patient_token');
    
    try {
      if (token) {
        const response = await fetch(`${API_URL}/v1/patient/logout`, { 
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });
        
        if (!response.ok) {
          console.warn("La réponse du serveur n'était pas OK, mais on procède à la déconnexion locale");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion API:", error);
      // On continue quand même avec la déconnexion locale
    } finally {
      // Nettoyage local
      localStorage.removeItem('patient_token');
      localStorage.removeItem('patient_data');
      
      // Redirection
      router.replace('/');
      
      // Forcer un rechargement pour nettoyer l'état
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Gestion du hover avec délai
  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setProfileMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setProfileMenuOpen(false);
    }, 300); // Délai de 300ms avant de fermer
  };

  // Récupérer les données du patient depuis le localStorage
  const [patientData, setPatientData] = useState({});
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('patient_data');
        if (data) {
          setPatientData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Erreur lors du parsing des données patient:", error);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-100 relative overflow-hidden">

      {/* Arrière-plan Bulles (Bokeh effect) */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] bg-cyan-300/20 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute top-[20%] -right-[10%] w-[35rem] h-[35rem] bg-blue-300/20 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[40rem] h-[40rem] bg-indigo-300/20 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[30%] right-[20%] w-[30rem] h-[30rem] bg-teal-300/20 rounded-full blur-[80px] mix-blend-multiply"></div>
      </div>
      
      {/* Sidebar Mobile avec animation */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <Sidebar handleLogout={handleLogout} setIsSidebarOpen={setIsSidebarOpen} />
      </div>

      {/* Sidebar Desktop toujours visible */}
      <div className="hidden md:block relative z-10">
        <Sidebar handleLogout={handleLogout} setIsSidebarOpen={setIsSidebarOpen} />
      </div>

      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 md:ml-0 relative z-10">
        
        {/* Top Navbar modernisée */}
        <header className={`
          sticky top-0 z-30 flex items-center justify-between h-16 md:h-20 px-4 md:px-8 
          transition-all duration-300 ${isScrolled ? 'bg-[#54b5e0]/95 backdrop-blur-sm shadow-lg' : 'bg-[#06b6d4]'}
          border-b border-gray-100
        `}>
          
          {/* Section gauche */}
          <div className="flex items-center space-x-4">
            {/* Bouton menu mobile */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#06b6d4] transition-all"
              aria-label="Menu"
            >
              <FaBars className="text-xl" />
            </button>

            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[white] to-[white] flex items-center justify-center mr-3">
                <span className="text-[#06b6d4] font-bold">T</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-[white] to-[white] bg-clip-text text-transparent">
                Tableau de bord
              </h1>
            </div>
          </div>

          {/* Section droite */}
          <div className="flex items-center space-x-4">
            
            {/* Profile avec menu déroulant */}
            <div 
              className="flex items-center space-x-3 pl-4 border-l border-gray-200 relative" 
              ref={profileMenuRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-white">
                  {patientData?.user?.name || 'Utilisateur'} {patientData?.user?.prenom || 'Prénom'}
                </span>
                <span className="text-xs text-white">Patient</span>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <FaUserCircle className="text-3xl text-white hover:text-[#06b6d4] cursor-pointer transition-colors" />
                </button>
                
                {/* Menu déroulant */}
                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Section informations */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-800">
                        {patientData?.user?.name || 'Nom'} {patientData?.user?.prenom || 'Prénom'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {patientData?.user?.email || 'email@example.com'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Code: {patientData?.code_patient || 'N/A'}
                      </p>
                    </div>
                    
                    {/* Liens du menu */}
                    <button 
                      onClick={() => {
                        router.push('/dashboard/update');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                      <FaUserCircle className="mr-2 text-[#06b6d4]" /> 
                      Mon profil
                    </button>
                    
                    {/* <button 
                      onClick={() => {
                        router.push('/dashboard/settings');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                      <FaCog className="mr-2 text-[#06b6d4]" /> 
                      Paramètres
                    </button> */}
                    
                    <div className="border-t my-1"></div>
                    
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-[#dc2626] hover:bg-red-50 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaSignOutAlt className="mr-2" /> 
                      {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb optionnel */}
        <div className="px-4 md:px-8 py-3 bg-gradient-to-r from-gray-50 to-white">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-500 hover:text-[#06b6d4] transition-colors"
                >
                  Dashboard
                </button>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-[#06b6d4] font-medium">Tableau de bord</li>
            </ol>
          </nav>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-[90%] mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
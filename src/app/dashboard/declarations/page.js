'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FaClipboardList, 
  FaCalendar, 
  FaFileAlt, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaPrint,
  FaClock,
  FaExclamationCircle
} from 'react-icons/fa';

const PRIMARY_BLUE = '#06b6d4';
const ACCENT_GREEN = '#2da442';
const API_URL = 'https://gemma-ci.com/api';

export default function DeclarationsPage() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    const token = localStorage.getItem('patient_token');
    
    if (!token) {
      setError('Veuillez vous connecter');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/v1/patient/declarations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des déclarations');
      }

      const data = await response.json();
      setDeclarations(data.declarations || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeclarations = declarations.filter(declaration => {
    const matchesSearch = declaration.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         declaration.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'recent') {
      const declarationDate = new Date(declaration.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return matchesSearch && declarationDate >= threeMonthsAgo;
    }
    if (filter === 'medical') {
      return matchesSearch && ['hospitalisation', 'consultation', 'urgence'].includes(declaration.type?.toLowerCase());
    }
    if (filter === 'administrative') {
      return matchesSearch && ['certificat', 'attestation', 'demande'].includes(declaration.type?.toLowerCase());
    }
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'validé':
      case 'approuvé':
        return 'bg-green-100 text-green-800';
      case 'en attente':
      case 'en cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'refusé':
      case 'rejeté':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'hospitalisation':
        return { icon: '🏥', color: 'bg-red-100 text-red-600' };
      case 'consultation':
        return { icon: '🩺', color: 'bg-blue-100 text-blue-600' };
      case 'urgence':
        return { icon: '🚑', color: 'bg-red-100 text-red-600' };
      case 'certificat':
        return { icon: '📄', color: 'bg-green-100 text-green-600' };
      case 'attestation':
        return { icon: '📋', color: 'bg-purple-100 text-purple-600' };
      default:
        return { icon: '📝', color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <FaClipboardList className="mr-3" style={{ color: PRIMARY_BLUE }} />
                Mes Déclarations
              </h1>
              <p className="text-gray-600 mt-1">
                Historique de vos déclarations et documents administratifs
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {declarations.length} déclarations enregistrées
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par type ou description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Filtres */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilter('recent')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'recent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Derniers 3 mois
                </button>
                <button
                  onClick={() => setFilter('medical')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'medical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Médicales
                </button>
                <button
                  onClick={() => setFilter('administrative')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'administrative' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Administratives
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Chargement des déclarations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchDeclarations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        ) : filteredDeclarations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucune déclaration trouvée' : 'Aucune déclaration enregistrée'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche'
                : 'Vos déclarations apparaîtront ici une fois soumises'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeclarations.map((declaration) => {
              const typeInfo = getTypeIcon(declaration.type);
              return (
                <div key={declaration.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${typeInfo.color}`}>
                        <span className="text-xl">{typeInfo.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {declaration.type || 'Déclaration'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {declaration.description || 'Aucune description'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <FaCalendar className="mr-1" />
                          <span>
                            {new Date(declaration.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                          {declaration.created_at && (
                            <>
                              <span className="mx-2">•</span>
                              <FaClock className="mr-1" />
                              <span>
                                Créée le {new Date(declaration.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(declaration.status)}`}>
                        {declaration.status || 'Non spécifié'}
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <FaEye />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                          <FaDownload />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition">
                          <FaPrint />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations supplémentaires */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {declaration.hospital && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Établissement</p>
                          <p className="text-sm font-medium text-gray-900">{declaration.hospital}</p>
                        </div>
                      )}
                      {declaration.doctor_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Médecin</p>
                          <p className="text-sm font-medium text-gray-900">{declaration.doctor_name}</p>
                        </div>
                      )}
                      {declaration.reference && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Référence</p>
                          <p className="text-sm font-medium text-gray-900">{declaration.reference}</p>
                        </div>
                      )}
                    </div>
                    
                    {declaration.notes && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {declaration.notes}
                        </p>
                      </div>
                    )}
                    
                    {declaration.documents?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Documents joints</p>
                        <div className="flex flex-wrap gap-2">
                          {declaration.documents.map((doc, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              📎 {doc.name || `Document ${index + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
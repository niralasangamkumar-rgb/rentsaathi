import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CityContext = createContext();

export function useCity() {
  return useContext(CityContext);
}

// Default cities to seed if collection is empty
const defaultCities = [
  { id: 'patna', name: 'Patna', state: 'Bihar' },
  { id: 'delhi', name: 'Delhi', state: 'Delhi' },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka' }
];

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('selectedCity');
    return saved ? JSON.parse(saved) : null;
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    // Save to localStorage when city changes
    if (selectedCity) {
      localStorage.setItem('selectedCity', JSON.stringify(selectedCity));
    } else {
      localStorage.removeItem('selectedCity');
    }
  }, [selectedCity]);

  const loadCities = async () => {
    setLoading(true);
    try {
      const citiesRef = collection(db, 'cities');
      const snapshot = await getDocs(citiesRef);
      
      let citiesData = [];
      if (snapshot.empty) {
        // Seed default cities if collection is empty
        await seedCities();
        citiesData = defaultCities;
      } else {
        citiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      setCities(citiesData);
      
      // Do not set any default city; selectedCity remains null until user selects/searches
    } catch (error) {
      console.error('Error loading cities:', error);
      // Use default cities as fallback
      setCities(defaultCities);
      // Do not set any default city as fallback; selectedCity remains null
    }
    setLoading(false);
  };

  const seedCities = async () => {
    try {
      for (const city of defaultCities) {
        await setDoc(doc(db, 'cities', city.id), {
          name: city.name,
          state: city.state,
          createdAt: new Date().toISOString()
        });
      }
      console.log('Cities seeded successfully');
    } catch (error) {
      console.error('Error seeding cities:', error);
    }
  };

  const selectCity = (city) => {
    setSelectedCity(city);
  };

  const clearCity = () => {
    setSelectedCity(null);
    localStorage.removeItem('selectedCity');
  };

  const value = {
    selectedCity,
    cities,
    loading,
    selectCity,
    clearCity
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
}

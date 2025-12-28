
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import WeatherMap from './components/WeatherMap';
import LoadingOverlay from './components/LoadingOverlay';
import { 
  fetchWeatherByCity, 
  fetchWeatherByCoords, 
  fetchForecast, 
  fetchAirQuality,
  fetchCitySuggestions
} from './services/weatherService';
import { getAIWeatherAdvice, getCoordinatesByAI } from './services/geminiService';
import { WeatherData, ForecastItem, AirQualityData, TempUnit, AppState } from './types';
import { AlertTriangle, X, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    weather: null,
    forecast: null,
    airQuality: null,
    loading: true,
    error: null,
    unit: TempUnit.CELSIUS,
    theme: 'light',
    aiAdvice: null
  });

  const loadDataByCoords = useCallback(async (lat: number, lon: number, unit: TempUnit) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const weatherData = await fetchWeatherByCoords(lat, lon, unit);
      const [forecastData, aqiData] = await Promise.all([
        fetchForecast(lat, lon, unit),
        fetchAirQuality(lat, lon)
      ]);
      
      const advice = await getAIWeatherAdvice(weatherData, aqiData);

      setState(prev => ({
        ...prev,
        weather: weatherData,
        forecast: forecastData,
        airQuality: aqiData,
        loading: false,
        aiAdvice: advice
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  const handleSearch = async (query: string, coords?: { lat: number, lon: number }) => {
    if (coords) {
      loadDataByCoords(coords.lat, coords.lon, state.unit);
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 1. Try standard Geocoding first (City/Town level)
      const suggestions = await fetchCitySuggestions(query);
      if (suggestions && suggestions.length > 0) {
        const bestMatch = suggestions[0];
        loadDataByCoords(bestMatch.lat, bestMatch.lon, state.unit);
        return;
      }

      // 2. Fallback to AI Geocoding (Villages, Blocks, Small Districts)
      const aiResolved = await getCoordinatesByAI(query);
      if (aiResolved && aiResolved.lat && aiResolved.lon) {
        loadDataByCoords(aiResolved.lat, aiResolved.lon, state.unit);
        return;
      }

      // 3. Last attempt: Direct city search (standard API)
      const weatherData = await fetchWeatherByCity(query, state.unit);
      loadDataByCoords(weatherData.coord.lat, weatherData.coord.lon, state.unit);
      
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Could not find "${query}". Try adding a district or state name.` 
      }));
    }
  };

  const handleLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadDataByCoords(pos.coords.latitude, pos.coords.longitude, state.unit);
        },
        (error) => {
          console.warn("Geolocation failed:", error);
          setState(prev => ({ ...prev, error: "Location access denied. Showing default city." }));
          if (!state.weather) handleSearch('India');
        },
        { timeout: 10000 }
      );
    } else {
      handleSearch('India');
    }
  }, [state.unit, state.weather, loadDataByCoords]);

  const toggleUnit = () => {
    const newUnit = state.unit === TempUnit.CELSIUS ? TempUnit.FAHRENHEIT : TempUnit.CELSIUS;
    setState(prev => ({ ...prev, unit: newUnit }));
    if (state.weather) {
      loadDataByCoords(state.weather.coord.lat, state.weather.coord.lon, newUnit);
    }
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleRefresh = useCallback(() => {
    if (state.weather) {
      loadDataByCoords(state.weather.coord.lat, state.weather.coord.lon, state.unit);
    } else {
      handleLocation();
    }
  }, [state.weather, state.unit, handleLocation, loadDataByCoords]);

  useEffect(() => {
    handleLocation();
    const interval = setInterval(() => {
       handleRefresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const bgGradient = useMemo(() => {
    if (!state.weather) return state.theme === 'dark' ? 'from-slate-900 to-slate-800' : 'from-blue-100 to-indigo-200';
    const tempC = state.unit === TempUnit.CELSIUS 
      ? state.weather.main.temp 
      : (state.weather.main.temp - 32) * 5/9;
    const isDark = state.theme === 'dark';
    if (tempC <= 5) return isDark ? 'from-slate-900 via-blue-950 to-indigo-950' : 'from-blue-200 via-cyan-100 to-indigo-200';
    else if (tempC > 5 && tempC <= 15) return isDark ? 'from-slate-900 via-slate-800 to-blue-900' : 'from-blue-100 via-slate-200 to-blue-200';
    else if (tempC > 15 && tempC <= 25) return isDark ? 'from-slate-900 via-teal-950 to-emerald-950' : 'from-teal-100 via-emerald-50 to-cyan-100';
    else if (tempC > 25 && tempC <= 32) return isDark ? 'from-slate-900 via-orange-950 to-amber-950' : 'from-orange-100 via-amber-50 to-yellow-100';
    else return isDark ? 'from-slate-900 via-red-950 to-orange-950' : 'from-red-200 via-orange-100 to-yellow-200';
  }, [state.weather, state.theme, state.unit]);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${state.theme === 'dark' ? 'dark text-white' : 'text-gray-900'}`}>
      <div className={`fixed inset-0 bg-gradient-to-br ${bgGradient} -z-10 transition-all duration-1000 ease-in-out`} />
      
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl animate-fade-in">
        <Header 
          onSearch={handleSearch} 
          onLocation={handleLocation} 
          onUnitToggle={toggleUnit}
          onThemeToggle={toggleTheme}
          onRefresh={handleRefresh}
          unit={state.unit}
          theme={state.theme}
        />

        {state.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between animate-shake">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{state.error}</span>
            </div>
            <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="p-1 hover:bg-red-500/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {state.loading && <LoadingOverlay />}

        {state.weather && (
          <div className="space-y-6">
            <CurrentWeather 
              data={state.weather} 
              air={state.airQuality} 
              advice={state.aiAdvice}
              unitLabel={state.unit === TempUnit.CELSIUS ? '°' : '°'} 
            />
            
            {state.forecast && (
              <Forecast 
                items={state.forecast} 
                unitLabel={state.unit === TempUnit.CELSIUS ? '°' : '°'} 
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                <WeatherMap 
                  lat={state.weather.coord.lat} 
                  lon={state.weather.coord.lon} 
                  city={state.weather.name} 
                />
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 flex flex-col items-center justify-center gap-2 opacity-60 text-sm text-center">
          <p className="font-medium">©2025 SkyCast, All CopyRight Reserved.</p>
          <p className="text-xs">Crafted with ❤️ by Raushan Yadav</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 opacity-70">
              <MapPin className="w-4 h-4" />
              Nawada, Bihar - 805127
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;


import React from 'react';
import { WeatherData, AirQualityData } from '../types';
import { Cloud, Wind, Droplets, Thermometer, Eye, ArrowUp, ArrowDown, Sunrise, Sunset, Activity, Clock } from 'lucide-react';

interface CurrentWeatherProps {
  data: WeatherData;
  air: AirQualityData | null;
  advice: string | null;
  unitLabel: string;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, air, advice, unitLabel }) => {
  const getAQIDesc = (aqi: number) => {
    switch (aqi) {
      case 1: return { text: 'Good', color: 'text-green-400', bg: 'bg-green-400/10' };
      case 2: return { text: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
      case 3: return { text: 'Moderate', color: 'text-orange-400', bg: 'bg-orange-400/10' };
      case 4: return { text: 'Poor', color: 'text-red-400', bg: 'bg-red-400/10' };
      case 5: return { text: 'Very Poor', color: 'text-purple-400', bg: 'bg-purple-400/10' };
      default: return { text: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-400/10' };
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // The 'dt' in weather data is the time of data calculation
  const lastUpdated = new Date(data.dt * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const aqiValue = air ? air.list[0].main.aqi : null;
  const pollutants = air ? air.list[0].components : null;
  const aqiInfo = aqiValue !== null ? getAQIDesc(aqiValue) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Card */}
      <div className="lg:col-span-7 glass rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-4xl font-bold text-gray-800 dark:text-white">{data.name}</h2>
               <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse-soft">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                 Live
               </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span className="opacity-30">|</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated {lastUpdated}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-8xl font-black text-gray-800 dark:text-white">
                {Math.round(data.main.temp)}{unitLabel}
              </span>
              <div className="flex flex-col text-gray-500 dark:text-gray-400 font-medium">
                <span className="flex items-center"><ArrowUp className="w-4 h-4 text-red-400 mr-1" />{Math.round(data.main.temp_max)}°</span>
                <span className="flex items-center"><ArrowDown className="w-4 h-4 text-blue-400 mr-1" />{Math.round(data.main.temp_min)}°</span>
              </div>
            </div>
            
            <p className="text-2xl text-gray-600 dark:text-gray-300 capitalize flex items-center gap-2">
              {data.weather[0].description}
            </p>
          </div>
          
          <div className="mt-8 md:mt-0">
            <img 
              src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`} 
              alt={data.weather[0].description}
              className="w-48 h-48 object-contain animate-bounce-slow"
            />
          </div>
        </div>

        {/* AI Insight Section */}
        {advice && (
          <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
            <div className="p-2 bg-blue-500 rounded-lg shrink-0">
              <Activity className="text-white w-4 h-4" />
            </div>
            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
              {advice}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="lg:col-span-5 grid grid-cols-2 gap-4">
        <StatCard icon={<Thermometer />} label="Feels Like" value={`${Math.round(data.main.feels_like)}${unitLabel}`} />
        <StatCard icon={<Droplets />} label="Humidity" value={`${data.main.humidity}%`} />
        
        {/* Real-time Air Quality Card - More prominent */}
        {aqiInfo && aqiValue !== null && (
          <div className={`col-span-2 glass rounded-3xl p-6 border-l-4 ${aqiInfo.color.replace('text', 'border')} transition-all hover:translate-x-1`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${aqiInfo.bg}`}>
                  <Activity className={`w-5 h-5 ${aqiInfo.color}`} />
                </div>
                <div>
                   <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-widest">Real-time Air Quality</p>
                   <h4 className={`text-xl font-black ${aqiInfo.color}`}>{aqiInfo.text} (Level {aqiValue})</h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-mono">INDEX SCALE 1-5</span>
              </div>
            </div>
            
            {pollutants && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/5 dark:bg-black/20 p-2 rounded-xl">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">PM 2.5</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{pollutants.pm2_5.toFixed(1)} <span className="text-[9px] font-normal opacity-60">μg/m³</span></p>
                </div>
                <div className="bg-white/5 dark:bg-black/20 p-2 rounded-xl">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">PM 10</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{pollutants.pm10.toFixed(1)} <span className="text-[9px] font-normal opacity-60">μg/m³</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        <StatCard icon={<Wind />} label="Wind Speed" value={`${data.wind.speed} m/s`} />
        <StatCard icon={<Eye />} label="Visibility" value={`${(data.visibility / 1000).toFixed(1)} km`} />
        <StatCard icon={<Sunrise className="text-orange-400" />} label="Sunrise" value={formatTime(data.sys.sunrise)} />
        <StatCard icon={<Sunset className="text-purple-400" />} label="Sunset" value={formatTime(data.sys.sunset)} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, valueClass?: string }> = ({ icon, label, value, valueClass }) => (
  <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
    <div className="text-blue-500 dark:text-blue-400 mb-2">{icon}</div>
    <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider mb-1 font-bold">{label}</span>
    <span className={`text-lg font-bold text-gray-800 dark:text-white ${valueClass || ''}`}>{value}</span>
  </div>
);

export default CurrentWeather;


import React from 'react';
import { Map as MapIcon, Maximize2 } from 'lucide-react';

interface WeatherMapProps {
  lat: number;
  lon: number;
  city: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ lat, lon, city }) => {
  // Using OpenStreetMap via an iframe for a lightweight, dependency-free interactive map
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.05}%2C${lon + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="glass rounded-[2.5rem] p-6 h-[400px] flex flex-col transition-all animate-fade-in group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <MapIcon className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Location Map</h3>
        </div>
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-blue-500"
          title="Open in Google Maps"
        >
          <Maximize2 className="w-5 h-5" />
        </a>
      </div>
      
      <div className="relative flex-grow rounded-2xl overflow-hidden border border-white/10 shadow-inner">
        <iframe
          title={`Map of ${city}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          className="grayscale-[0.2] contrast-[1.1] dark:invert-[0.9] dark:hue-rotate-180 dark:brightness-[0.8] transition-all duration-700"
        />
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-md text-[9px] text-gray-500 pointer-events-none">
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 italic">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
        Interactive map centered on {city}
      </div>
    </div>
  );
};

export default WeatherMap;

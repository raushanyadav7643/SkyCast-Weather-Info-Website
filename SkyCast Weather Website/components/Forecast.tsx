
import React from 'react';
import { ForecastItem } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ForecastProps {
  items: ForecastItem[];
  unitLabel: string;
}

const Forecast: React.FC<ForecastProps> = ({ items, unitLabel }) => {
  // Group 3-hour data into daily summaries
  const dailyData = items.reduce((acc: any[], item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const existingDay = acc.find(d => d.dateLabel === date);

    if (existingDay) {
      if (item.main.temp > existingDay.maxTemp) {
        existingDay.maxTemp = item.main.temp;
        // Update condition icon and description based on the warmest part of the day
        existingDay.icon = item.weather[0].icon;
        existingDay.description = item.weather[0].description;
      }
      if (item.main.temp < existingDay.minTemp) {
        existingDay.minTemp = item.main.temp;
      }
    } else {
      acc.push({
        dateLabel: date,
        maxTemp: item.main.temp,
        minTemp: item.main.temp,
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        dt: item.dt
      });
    }
    return acc;
  }, []);

  // Data for the timeline
  const hourlyData = items.map(item => {
    const date = new Date(item.dt * 1000);
    return {
      time: date.toLocaleTimeString([], { hour: 'numeric' }),
      dateLabel: date.toLocaleDateString([], { day: 'numeric', month: 'short' }),
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon
    };
  });

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Complete Hourly Forecast Scroll */}
      <div className="glass rounded-[2.5rem] p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detailed Timeline</h3>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hourly intervals</span>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {hourlyData.map((hour, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[85px] p-4 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/10 hover:bg-white/10 transition-colors group">
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase mb-1">{hour.dateLabel}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{hour.time}</span>
              <img 
                src={`https://openweathermap.org/img/wn/${hour.icon}.png`} 
                alt="weather" 
                className="w-10 h-10 group-hover:scale-110 transition-transform" 
              />
              <span className="text-lg font-bold text-gray-800 dark:text-white mt-2">{hour.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Extended Daily Forecast List with Icons and Descriptions */}
        <div className="xl:col-span-7 glass rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Extended Forecast</h3>
            <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold uppercase tracking-wider">UPCOMING DAY'S CONDITIONS</span>
          </div>
          
          <div className="space-y-4">
            {dailyData.map((day, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 items-center p-5 bg-white/5 dark:bg-black/10 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-800 dark:text-white font-bold text-lg">{day.dateLabel}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">{idx === 0 ? 'Today' : 'Upcoming'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <img 
                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                    alt={day.description} 
                    className="w-12 h-12"
                  />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 capitalize">
                    {day.description}
                  </span>
                </div>
                
                <div className="flex items-center justify-end gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-red-400 uppercase font-black">High</span>
                    <span className="text-2xl font-black text-gray-800 dark:text-white">{Math.round(day.maxTemp)}°</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-blue-400 uppercase font-black">Low</span>
                    <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">{Math.round(day.minTemp)}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Visual Trends */}
        <div className="xl:col-span-5 glass rounded-[2.5rem] p-8 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Temperature Curve</h3>
          <div className="h-[300px] mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData.slice(0, 24)}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '16px',
                    color: '#fff',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#3B82F6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 italic">
            Hourly temperature visualization (next 24h).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forecast;

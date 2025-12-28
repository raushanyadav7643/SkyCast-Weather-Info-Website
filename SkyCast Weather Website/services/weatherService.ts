
import { WeatherData, ForecastItem, AirQualityData, TempUnit } from '../types';

const API_KEY = '2e8ca93802e67b1c9b2ab0d44b78771e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const fetchWeatherByCity = async (city: string, unit: TempUnit): Promise<WeatherData> => {
  const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${unit}`);
  if (!response.ok) throw new Error('City not found');
  return response.json();
};

export const fetchWeatherByCoords = async (lat: number, lon: number, unit: TempUnit): Promise<WeatherData> => {
  const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
  if (!response.ok) throw new Error('Unable to fetch weather for your location');
  return response.json();
};

export const fetchForecast = async (lat: number, lon: number, unit: TempUnit): Promise<ForecastItem[]> => {
  const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
  if (!response.ok) throw new Error('Unable to fetch forecast');
  const data = await response.json();
  return data.list;
};

export const fetchAirQuality = async (lat: number, lon: number): Promise<AirQualityData> => {
  const response = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
  if (!response.ok) throw new Error('Unable to fetch air quality');
  return response.json();
};

export interface CitySuggestion {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export const fetchCitySuggestions = async (query: string): Promise<CitySuggestion[]> => {
  if (!query || query.length < 2) return [];
  const response = await fetch(`${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`);
  if (!response.ok) return [];
  return response.json();
};

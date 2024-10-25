import 'server-only';
import { unstable_noStore } from 'next/cache';

export async function getTasks(filter?: { q?: string; status?: TaskStatus; categories?: number[] }) {
  unstable_noStore();
  const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

  const cities = ['New York', 'Los Angeles', 'Chicago', 'London', 'Paris', 'Tokyo', 'Sydney', 'Berlin', 'Toronto', 'Dubai'];
  const tasks = await Promise.all(
    cities.map(async (city) => {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}`, { cache: "no-store" });
      const data = await response.json();

      if (!data || !data.weather || !data.weather[0]) {
        console.error(`Error fetching weather data for ${city}:`, data);
        return null;
      }

      return {
        title: `${data.name}`,
        description: `${data.weather[0].description}. Temperature: ${(data.main.temp - 273.15).toFixed(2)}°C, Feels like: ${(data.main.feels_like - 273.15).toFixed(2)}°C, Humidity: ${data.main.humidity}%, Wind Speed: ${data.wind.speed} m/s, Visibility: ${data.visibility} meters`,
        category: data.weather[0].main,
        status: data.clouds.all < 20 ? "Active" : "Delayed",
        createdAt: new Date(data.dt * 1000).toISOString()
      };
    })
  );

  return tasks.filter(task => task !== null);
}


export async function getTaskSummary(): Promise<TaskSummary> {
  unstable_noStore();

  const locations = ['New York', 'Los Angeles', 'Chicago'];
  const taskSummary: TaskSummary = {};
  const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

  await Promise.all(
    locations.map(async (location) => {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHERMAP_API_KEY}`, { cache: "no-store" });
      const data = await response.json();

      console.log("Weather data for", location, ":", data);

      if (!data || !data.weather || !data.weather[0]) {
        console.error("Error fetching weather data for summary:", data);
        return;
      }

      const category = data.weather[0].main;
      if (!taskSummary[category]) taskSummary[category] = {};
      taskSummary[category][location] = {
        count: 1,
        name: location,
      };
    })
  );

  return taskSummary;
}

import 'server-only';
import { TaskSummary, TaskStatus } from '@/types/task';

export async function getTasks(filter: { q?: string; status?: string | null; categories?: number[] }) {
  const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

  const cities = [
    'Vancouver', 'Kamloops', 'Toronto', 'Edmonton'
  ];

  const tasks = await Promise.all(
    cities.map(async (city) => {
      console.log(`Fetching data for ${city}...`);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}`,
        {
          cache: "force-cache",
          next: { revalidate: 1800 } // Revalidate every 30 minutes
        }
      );
      console.log(`${city}... ${JSON.stringify(response)}`);

      const data = await response.json();

      // Get cache status and age
      
      // This method does not work for external APIs.
      // const cacheStatus = response.headers.get('x-nextjs-cache') || 'MISS';

      const ageHeader = response.headers.get('age');
      const cacheAge = ageHeader ? parseInt(ageHeader, 10) : 0;
      const cacheStatus = cacheAge > 0 ? 'HIT' : 'MISS';
      const cacheDate = new Date(Date.now() - cacheAge * 1000).toISOString();
      const revalidateAt = new Date(Date.now() - cacheAge * 1000 + 1800 * 1000).toISOString();

      if (!data || !data.weather || !data.weather[0]) {
        console.error(`Error fetching weather data for ${city}:`, data);
        return null;
      }

      return {
        title: `${data.name}`,
        description: `${data.weather[0].description}. Temperature: ${(
          data.main.temp - 273.15
        ).toFixed(2)}°C, Feels like: ${(
          data.main.feels_like - 273.15
        ).toFixed(2)}°C, Humidity: ${data.main.humidity}%, Wind Speed: ${
          data.wind.speed
        } m/s, Visibility: ${data.visibility} meters`,
        category: data.weather[0].main,
        status: data.clouds.all < 20 ? "Active" : "Delayed",
        createdAt: new Date(data.dt * 1000).toISOString(),
        cacheStatus,
        cacheDate,
        revalidateAt,
      };
    })
  );

  // Filter out any null tasks due to errors
  const filteredTasks = tasks.filter((task) => task !== null);

  // Apply search filter if provided
  if (filter?.q) {
    const searchTerm = filter.q.toLowerCase();
    return filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
    );
  }

  return filteredTasks;
}

export async function getTaskSummary(): Promise<TaskSummary> {
  const locations = ['New York', 'Los Angeles', 'Chicago'];
  const taskSummary: TaskSummary = {} as TaskSummary;
  const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

  await Promise.all(
    locations.map(async (location, index) => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHERMAP_API_KEY}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      console.log("Weather data for", location, ":", data);

      if (!data || !data.weather || !data.weather[0]) {
        console.error("Error fetching weather data for summary:", data);
        return;
      }

      const category = data.weather[0].main as TaskStatus; 
      if (!taskSummary[category]) taskSummary[category] = {};
      taskSummary[category][index] = { 
        count: 1,
        name: location,
      };
    })
  );

  return taskSummary;
}

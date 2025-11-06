import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css'; 

const API_KEY = '96d0bf2167a845924bc3ccb2ccee4e8f';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const REFRESH_INTERVAL = 60000;

interface WeatherData {
    name: string;
    temp: number;
    description: string;
    humidity: number;
    wind: number;
}

function App() {
    const [city, setCity] = useState<string>('');
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [requestCount, setRequestCount] = useState<number>(0);
    const [searchedCity, setSearchedCity] = useState<string>('');
    
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (!searchedCity) {
            return;
        }

        const intervalId = setInterval(() => {
            fetchWeather(searchedCity, true);
        }, REFRESH_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };

    }, [searchedCity]);

    const fetchWeather = async (cityName: string, isAutoUpdate: boolean = false) => {
        if (!cityName) {
            setError("Пожалуйста, введите название города.");
            return;
        }

        try {
            setError(null);
            
            if (!isAutoUpdate) {
               setWeatherData(null); 
            }

            const response = await axios.get(API_URL, {
                params: {
                    q: cityName,
                    appid: API_KEY,
                    units: 'metric',
                    lang: 'ru'
                }
            });

            setWeatherData({
                name: response.data.name,
                temp: response.data.main.temp,
                description: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                wind: response.data.wind.speed
            });

            setRequestCount(prevCount => prevCount + 1);

        } catch (err: any) {
            setWeatherData(null);

            if (err.response && err.response.status === 404) {
                setError(`Город "${cityName}" не найден.`);
            } else {
                setError('Не удалось получить данные о погоде.');
            }

            if (isAutoUpdate) {
               setSearchedCity('');
            }
        }
    };

    const handleSearch = () => {
        setSearchedCity(city);
        fetchWeather(city, false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="weather-app-container">
            <div className="weather-app">
                <h1>Погода</h1>

                <div className="search-bar">
                    <input
                        ref={inputRef}
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Введите название города"
                    />
                    <button onClick={handleSearch}>
                        Получить
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {weatherData && (
                    <div className="weather-data">
                        <h2>{weatherData.name}</h2>
                        <div className="weather-temp">
                            {Math.round(weatherData.temp)}°C
                        </div>
                        <div className="weather-description">
                            {weatherData.description}
                        </div>
                        <div className="weather-details">
                            <p>
                                <strong>Влажность:</strong> {weatherData.humidity}%
                            </p>
                            <p>
                                <strong>Ветер:</strong> {weatherData.wind} м/с
                            </p>
                        </div>
                    </div>
                )}

                <div className="request-count">
                    Запросов к API выполнено: {requestCount}
                </div>
            </div>
        </div>
    );
}

export default App;
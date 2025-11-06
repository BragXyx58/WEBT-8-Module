import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

interface CatImage {
    id: string;
    url: string;
}

interface NasaImageItem {
    links: { href: string; rel: string }[];
    data: { 
        title: string; 
        description: string;
        nasa_id: string; 
    }[];
}

const App = () => {
    const [rates, setRates] = useState<{ [key: string]: number }>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [baseCurrency] = useState("USD");

    const [catImages, setCatImages] = useState<CatImage[]>([]);
    const [currentCatIndex, setCurrentCatIndex] = useState(0);
    const [catsLoading, setCatsLoading] = useState(true);

    const [nasaImages, setNasaImages] = useState<NasaImageItem[]>([]);
    const [currentNasaImageIndex, setCurrentNasaImageIndex] = useState(0); 
    const [nasaLoading, setNasaLoading] = useState(true);
    const [nasaError, setNasaError] = useState<string | null>(null);

    useEffect(() => {
        const getRates = async () => {
            try {
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
                const data = await response.json();
                if (data && data.rates) {
                    setRates(data.rates);
                }
            } catch (err) {
                console.error("Rates API error:", err);
            }
        };
        getRates();
    }, [baseCurrency]);

    useEffect(() => {
        const getCats = async () => {
            try {
                setCatsLoading(true);
                const response = await fetch("https://api.thecatapi.com/v1/images/search?limit=10");
                const data = await response.json();
                setCatImages(data);
            } catch (err) {
                console.error("Cat API error:", err);
            } finally {
                setCatsLoading(false);
            }
        };
        getCats();
    }, []);

    useEffect(() => {
        const getNasaImages = async () => {
            try {
                setNasaLoading(true);
                setNasaError(null);
                const response = await fetch(`https://images-api.nasa.gov/search?q=curiosity%20mastcam&media_type=image`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("NASA Image API returned an error:", errorText);
                    throw new Error(`Ошибка от API NASA Images (${response.status} ${response.statusText}).`);
                }

                const data = await response.json();
                if (data && data.collection && data.collection.items) {
                    setNasaImages(data.collection.items);
                } else {
                    throw new Error("Invalid data structure from NASA Image API");
                }
                
            } catch (err: any) {
                console.error("NASA Image API fetch failed:", err);
                setNasaError(err.message || "Неизвестная ошибка");
            } finally {
                setNasaLoading(false);
            }
        };
        getNasaImages();
    }, []);

    const filteredRates = Object.entries(rates).filter(([currency]) =>
        currency.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const handlePrevCat = () => {
        setCurrentCatIndex((prevIndex) =>
            prevIndex === 0 ? catImages.length - 1 : prevIndex - 1
        );
    };

    const handleNextCat = () => {
        setCurrentCatIndex((prevIndex) =>
            prevIndex === catImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevNasaImage = () => {
        setCurrentNasaImageIndex((prevIndex) =>
            prevIndex === 0 ? nasaImages.length - 1 : prevIndex - 1
        );
    };
    
    const handleNextNasaImage = () => {
        setCurrentNasaImageIndex((prevIndex) =>
            prevIndex === nasaImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="container">
            <h1>Курс валют</h1>
            <input
                type="text"
                placeholder="Поиск валюты..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <th>Валюта</th>
                        <th>Курс</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRates.map(([currency, rate]) => (
                        <tr key={currency}>
                            <td>{currency}</td>
                            <td>{rate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="cat-gallery">
                <h2>Галерея котиков</h2>
                {catsLoading ? (
                    <p>Загрузка котиков...</p>
                ) : catImages.length > 0 ? (
                    <div className="cat-content">
                        <button onClick={handlePrevCat} className="nav-button">
                            &lt; Лево
                        </button>
                        <img
                            src={catImages[currentCatIndex].url}
                            alt="A cute cat"
                            className="cat-image"
                        />
                        <button onClick={handleNextCat} className="nav-button">
                            Право &gt;
                        </button>
                    </div>
                ) : (
                    <p>Не удалось загрузить котиков :(</p>
                )}
            </div>

            <div className="nasa-image-gallery">
                <h2>Фото с Марса (NASA Image Library)</h2>
                {nasaLoading ? (
                    <p>Загрузка фото с Марса...</p>
                ) : nasaError ? (
                    <p className="error-message">
                        Не удалось загрузить фото. Причина: {nasaError}
                    </p>
                ) : nasaImages.length > 0 ? (
                    <div className="nasa-content">
                        <button onClick={handlePrevNasaImage} className="nav-button">
                            &lt; Лево
                        </button>
                        <img
                            src={nasaImages[currentNasaImageIndex].links[0].href}
                            alt={nasaImages[currentNasaImageIndex].data[0].title}
                            className="nasa-image"
                        />
                        <button onClick={handleNextNasaImage} className="nav-button">
                            Право &gt;
                        </button>
                    </div>
                ) : (
                   <p>Фото не найдены.</p>
                )}
            </div>
        </div>
    );
};

export default App;
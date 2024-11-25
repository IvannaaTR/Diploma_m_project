import React, { useContext, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, CircleMarker  } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet'; 
import Papa from 'papaparse';
import Image from "../Image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {UserContext} from "../UserContext.jsx";
import ObservationPhotos from "../ObservationPhotos.jsx";

const MapComponent = ({ selectedCategory}) => {
  const [observations, setObservations] = useState([]);
  const [stationData, setStationData] = useState(null);
  const [csvData, setCSVData] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [selectedStation, setSelectedStation] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const {user} = useContext(UserContext);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null); 
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);

  const handleShowAllPhotos = (observation) => {
    setSelectedObservation(observation); 
    setShowAllPhotos(true); 
  };

  const handleCloseGallery = () => {
    setShowAllPhotos(false); 
    setSelectedObservation(null); 
  };
  async function handleConfirmationObservation(selectedRate) {
    try {
      rateObservation(selectedRate.id,selectedRate.type,selectedRate.userId,selectedRate.coefficient)
      setSelectedRate(null);
      setShowConfirmationModal(false);
    } catch (error) {
      alert(`Увага! ${error.response.data.error}`);
    }
  }
  const handleConfirmationCancel = () => {
    setSelectedRate(null);
    setShowConfirmationModal(false); 
  };

  const [mapData, setMapData] = useState({ stationDataS: [], observationDataS: [] });
  useEffect(() => {
    axios.get('/api/mapData')
      .then(response => setMapData(response.data)) 
      .catch(error => console.error('Error fetching map data:', error));
  }, []);
  
  const { stationDataS, observationDataS } = mapData;
  const allData = [...stationDataS, ...observationDataS];

  const maxAQI = 350;  
  const maxMark = 4;
  const getColors = (intensity) => {
    if (intensity > 0.8) return 'red';
    if (intensity > 0.5) return 'orange';
    if (intensity >= 0.25) return 'yellow';
    return 'green';
  };
  const HeatmapPoints = ({ data, maxAQI, maxMark }) => {
      return data.map((point, index) => {
          const intensity = point.aqi
              ? point.aqi / maxAQI
              : point.mark
              ? point.mark / maxMark
              : 0.5;
          const areaFactor = point.area ? Math.sqrt(point.area) / 10 : 1;
          const radius = intensity < 0.25 ? 15 : (intensity * 20) * areaFactor;
          return (
              <CircleMarker
                  key={index}
                  center={[point.lat, point.lng]}
                  radius={radius}  
                  color={getColors(intensity)}
                  fillOpacity={0.4}  
              />
          );
      });
  };  
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "Забруднення") { 
      axios.get(`/maps/category?category=${selectedCategory}`)
        .then(response => setObservations(response.data))
        .catch(error => {
          setObservations([]);
          console.error('Error fetching observations by category:', error);
        });
    } else {
      setObservations([]); 
    }
  }, [selectedCategory]); 
  useEffect(() => {
    if (selectedCategory === "Станції" && selectedStation) {
      axios.get(`/maps/station?stationName=${selectedStation}`)
        .then(response => setStationData(response.data))
        .catch(error => {
          setStationData(null);
          console.error('Error fetching station data:', error);
        });
    }
  }, [selectedStation]);

  useEffect(() => {
    if (selectedCategory === "Станції" && selectedStation) { 
      console.log('Fetching csv data...');
      axios.get(`/maps/csv?csvstationName=${selectedStation}`)
        .then(response => {
          setCSVData(response.data);
        })
        .catch(error => {
          setCSVData(null);
          console.error('Error fetching csv data:', error);
        });
    } else {
      setCSVData(null); 
    }
  }, [selectedStation]);

  const handleButtonClick = () => {
    console.log('Updated...');
    console.log(stationData);
    setShowChart(true);
  };

 
  function generateCSVData(data) {
    return data.map((item) => ({
      Дата: item.createdAt,
      Широта: item.latitude,
      Довгота: item.longitude,
      Станція: item.stationName,
      AQI: item.AQI,
      Вологість: item.pollutants.humidity,
      PM10: item.pollutants.PM10,
      PM25: item.pollutants.PM25,
      Температура: item.pollutants.temperature,
    }));
  }
  function downloadCSV(csvData) {
    const csv = Papa.unparse(generateCSVData(csvData));
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDownloadCSV = () => {
    console.log('CSV...');
    console.log(csvData);
    downloadCSV(csvData);
  };
  const getColor = (rating, status) => {
    if (status !== 'Верифіковано') {
        return 'gray';
    }
    switch (rating) {
      case 1:
        return 'yellow'; // Yellow
      case 2:
        return 'orange'; // Orange
      case 3:
        return 'orangered'; // Orange-red
      case 4:
        return 'red'; // Red
      default:
        return 'gray'; // Default color
    }
  };

  const getStationsColor = (rating) => {
    if (rating >= 1 && rating <= 50) {
      return 'limegreen'; // Bright green
    } else if (rating >= 51 && rating <= 100) {
      return 'palegreen'; // Light green
    } else if (rating >= 101 && rating <= 150) {
      return 'lightsalmon'; // Light orange
    } else if (rating >= 151 && rating <= 200) {
      return 'orangered'; // Orange-red
    } else if (rating >= 201 && rating <= 300) {
      return 'red'; // Red
    } else {
      return 'maroon'; // Burgundy for ratings above 300
    }
  };
  async function rateObservation(observationId, type, userId, coefficient) {
    const requestBody = { userId, type, coefficient };
    
    try {
      const response = await axios.post(`/observations/${observationId}/rate`, requestBody);
      console.log('Оцінка успішно збережена', response.data);
      return response.data; 
    } catch (error) {
      alert(`Увага! ${error.response?.data?.error || 'Не вдалося оновити рейтинг'}`);
    }
  }
  const checkIfUserRated = (ratedByArray, userId) => {
      return Array.isArray(ratedByArray) && ratedByArray.includes(userId);
  };
  const isDisabled = (ratedByArray, status, userId) => {
    return checkIfUserRated(ratedByArray, userId) || status === 'Верифіковано';
};
  return (
    <>
    {showAllPhotos && (
      <div className="modal-overlay">
          <ObservationPhotos
            photos={selectedObservation.photos}
            onClose={handleCloseGallery} 
          />
      </div>
    )}
    {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Чи дійсно ви бажаєте оцінити спостереження? Ви не зможете скасувати цю дію пізніше!</h2>
            <div className="flex justify-end space-x-4 mt-2">
              <button className="bg-primary text-white rounded-full px-4 py-2" onClick={() => handleConfirmationObservation(selectedRate)}>Підтвердити</button>
              <button className="bg-gray-500 text-white rounded-full px-4 py-2" onClick={handleConfirmationCancel}>Скасувати</button>
            </div>
          </div>
        </div>
      )}
    <MapContainer center={[49.8397, 24.0297]} zoom={8} minZoom={8} maxZoom={18} style={{ height: '500px', width: '100%', pointerEvents: showAllPhotos ? 'none' : 'auto' } }>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      { selectedCategory === 'Забруднення' && <HeatmapPoints data={allData} maxAQI={maxAQI} maxMark={maxMark} />} 
      {observations && observations.length > 0  &&  observations.map(observation => (
        <Marker
          key={observation._id}
          position={[observation.latitude, observation.longitude]}
          icon={L.divIcon({ 
            className: 'custom-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            html: `<div style="background-color: ${selectedCategory === 'Станції' ? getStationsColor(observation.AQI) : getColor(observation.mark, observation.status)}; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px;">${selectedCategory === 'Станції' ? observation.AQI : ''}</div>`,
          })}
        >
        <Popup  eventHandlers={{
            add: () => {
              setIsOpen(true);
              setSelectedStation(observation.stationName);
              console.log('Popup opened');
            },
            remove: () => {
              setIsOpen(false);
              setShowChart(false);
              console.log('Popup closed');
            }
          }}>  
            {selectedCategory === 'Станції' ? (
              <div>
                <strong>{observation.cityName + observation.stationName}</strong>
                <br />
                Оновлено: {new Date(observation.createdAt).toLocaleString()}
                <br />
                AQI: {observation.AQI}
                <br />
                {observation.pollutants && (
                  <div>
                    Humidity: {observation.pollutants.humidity}
                    <br />
                    PM10: {observation.pollutants.PM10}
                    <br />
                    PM2.5: {observation.pollutants.PM25}
                    <br />
                    Temperature: {observation.pollutants.temperature}
                  </div>
                )}
                <br />
                Джерело даних: <a href="https://www.saveecobot.com/en/platform/save-dnipro" target="_blank" rel="noopener noreferrer">Save Dnipro</a>
                <br />
                <br />
                <button
                  onClick={() => handleButtonClick()}
                  style={{
                    backgroundColor: 'rgb(7, 122, 41)',
                    color: '#fff', 
                    padding: '0.3rem 0.3rem', 
                    borderRadius: '0.5rem', 
                    border: 'none', 
                    cursor: 'pointer', 
                  }}
                >
                  Діаграма
                </button>
                
                {showChart && (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={stationData} margin={{ top: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="createdAt"
                        tickFormatter={(tick) => {
                          const date = new Date(tick);
                          return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                        }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'AQI') {
                            return [value, 'AQI'];
                          } else if (name === 'createdAt') {
                            return [new Date(value).toLocaleString(), 'Дата'];
                          }
                          return [value];
                        }}
                      />
                      <Legend
                        layout="vertical" 
                        align="right" 
                        verticalAlign="top" 
                      />
                      <Bar
                        dataKey="AQI"
                        fill="limegreen"
                        barSize={15} 
                      />
                    </BarChart>  
                  </ResponsiveContainer>
                  
                )}
                <br />
                <button
                  onClick={() => handleDownloadCSV()}
                  style={{
                    backgroundColor: 'rgb(7, 122, 41)',
                    color: '#fff', 
                    padding: '0.3rem 0.3rem', 
                    borderRadius: '0.5rem', 
                    border: 'none', 
                    cursor: 'pointer', 
                  }}
                >
                  Завантажити зібрані дані .csv
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center">
                  <div>
                    <strong>{`Статус: ${observation.status}`}</strong>
                    <br />
                    <strong>{`Загальний рейтинг: ${observation.overallRating}`}</strong>
                    <br />
                    <strong>{`"Виправлено": ${observation.relevanceRating}`}</strong>
                  </div>

                  {user && (
                    <div className ="w-full flex flex-wrap" >
                      <button
                        title="Правдиве"
                        onClick={() => {
                          setSelectedRate({
                            id: observation._id,
                            type: 'overall',
                            userId: user._id,
                            coefficient: user.coeficient
                        });
                          setShowConfirmationModal(true);
                        }}
                        className="ml-2 primary text-white rounded-full flex items-center justify-center px-2 py-1"
                        style={{ height: '30px', width: '50px' }}
                        disabled={isDisabled(observation.ratedBy,observation.status, user._id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6 h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>

                      </button>
                      <button
                        title="Неправдиве"
                        onClick={() => {
                          setSelectedRate({
                            id: observation._id,
                            type: 'overall',
                            userId: user._id,
                            coefficient: -user.coeficient
                        });
                          setShowConfirmationModal(true);
                        }}
                        className="ml-2 primary text-white rounded-full flex items-center justify-center px-2 py-1"
                        style={{ height: '30px', width: '50px' }}
                        disabled={isDisabled(observation.ratedBy,observation.status, user._id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6 h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
                        </svg>
                      </button>

                      <button
                        title="Виправлено"
                        onClick={() => {
                          setSelectedRate({
                            id: observation._id,
                            type: 'relevance',
                            userId: user._id,
                            coefficient: user.coeficient
                        });
                          setShowConfirmationModal(true);
                        }}
                        className="ml-2 primary text-white rounded-full flex items-center justify-center px-2 py-1"
                        style={{ height: '30px', width: '50px' }}
                        disabled={checkIfUserRated(observation.relevanceRatedBy, user._id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6 h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <br />
                <strong>{observation.category}</strong>
                <br />
                <strong>Координати: {observation.latitude.toFixed(6) + ', ' + observation.longitude.toFixed(6)}</strong>
                <br />
                Площа: {observation.area || "Дані не вказані"}
                <br />
                {observation.description}
                <br />
                
                {observation.photos && observation.photos.length > 0 && (
                  <div
                    className="flex justify-center cursor-pointer"
                    onClick={() => handleShowAllPhotos(observation)} 
                  >
                    <Image
                      src={observation.photos[0]}
                      alt="Фото"
                      className="rounded-md shadow-lg"
                      style={{ maxWidth: "100px" }}
                    />
                  </div>
                )}
              </div>

            )}
          </Popup>
        </Marker>
      ))}
      {showAllPhotos && (
      <ObservationPhotos
        photos={selectedObservation.photos}
        onClose={handleCloseGallery} 
      />
    )}
    </MapContainer> 
    </>
  );
};

export default MapComponent;

import React, { useState, useEffect   } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

export default function MapPicker({ initialLatitude, initialLongitude, onLocationChange }) {
  const defaultCenter = [49.8397, 24.0297];
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setPosition({ lat: initialLatitude, lng: initialLongitude });
    }
  }, [initialLatitude, initialLongitude]);
  
  function handleMapClick(e) {
    setPosition(e.latlng);
    onLocationChange(e.latlng); 
  }

  function MapClickHandler() {
    const map = useMapEvents({
      click: handleMapClick,
    });

    return null;
  }

  return (
    <MapContainer center={position ? [position.lat, position.lng] : defaultCenter}
     zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {position && <Marker position={position} />}
      <MapClickHandler />
    </MapContainer>
  );
}

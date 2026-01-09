import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

export default function MapComponent({ 
  center = [20.5937, 78.9629], // India center
  zoom = 5,
  markers = [],
  selectable = false,
  onLocationSelect,
  className = ''
}) {
  const [position, setPosition] = useState(null);

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    if (onLocationSelect) {
      onLocationSelect({ lat: newPosition[0], lng: newPosition[1] });
    }
  };

  return (
    <div className={`w-full h-64 md:h-80 rounded-xl overflow-hidden border border-gray-200 ${className}`} data-testid="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectable && (
          <LocationMarker position={position} setPosition={handlePositionChange} />
        )}
        
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.popup && (
              <Popup>
                <div className="text-sm">
                  <strong>{marker.title}</strong>
                  {marker.price && <p>₹{marker.price}/month</p>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

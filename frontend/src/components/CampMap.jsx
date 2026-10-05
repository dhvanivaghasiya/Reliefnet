import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CampMap = ({ 
  camps = [], 
  onMapClick, 
  selectedCamp, 
  interactive = false, 
  initialCenter = [20.5937, 78.9629], 
  initialZoom = 5,
  tempLat = null,
  tempLng = null
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  const clickMarker = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    mapInstance.current = L.map(mapRef.current).setView(initialCenter, initialZoom);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Add layer group for markers
    markersGroup.current = L.layerGroup().addTo(mapInstance.current);

    // Handle map click for admin selection
    if (interactive && onMapClick) {
      mapInstance.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [interactive]);

  // Handle Temp Marker updates for interactive selection
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing temporary click marker
    if (clickMarker.current) {
      mapInstance.current.removeLayer(clickMarker.current);
      clickMarker.current = null;
    }

    // Place new click marker if coordinates are provided
    if (tempLat && tempLng) {
      clickMarker.current = L.marker([tempLat, tempLng], {
        icon: L.icon({
          iconUrl: markerIcon,
          iconRetinaUrl: markerIcon2x,
          shadowUrl: markerShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }).addTo(mapInstance.current);
      clickMarker.current.bindPopup("Selected Location").openPopup();
      
      // Pan to the selected spot
      mapInstance.current.setView([tempLat, tempLng], mapInstance.current.getZoom());
    }
  }, [tempLat, tempLng]);

  // Update Camp Markers
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    // Clear existing markers
    markersGroup.current.clearLayers();

    camps.forEach((camp) => {
      if (camp.latitude && camp.longitude) {
        // Construct inventory items HTML
        let inventoryHtml = '<p style="margin: 4px 0; font-size: 11px; color: #64748b;">No inventory items listed.</p>';
        if (camp.inventory && camp.inventory.length > 0) {
          inventoryHtml = '<ul style="margin: 4px 0; padding-left: 14px; font-size: 11px; color: #334155; list-style-type: disc; text-align: left;">';
          camp.inventory.slice(0, 4).forEach(item => {
            inventoryHtml += `<li style="margin-bottom: 2px;"><strong>${item.product_name}</strong>: ${item.quantity} ${item.unit}</li>`;
          });
          if (camp.inventory.length > 4) {
            inventoryHtml += `<li style="color: #6366f1; list-style-type: none; margin-left: -14px; font-weight: 600;">+ ${camp.inventory.length - 4} more items</li>`;
          }
          inventoryHtml += '</ul>';
        }

        const marker = L.marker([camp.latitude, camp.longitude])
          .bindPopup(`
            <div style="font-family: 'Outfit', sans-serif; min-width: 220px; color: #0f172a; text-align: left; padding: 2px;">
              <h3 style="font-weight: 800; margin: 0 0 2px; font-size: 14px; color: #1e1b4b;">${camp.name}</h3>
              <p style="margin: 0 0 8px; font-size: 11px; color: #64748b; line-height: 1.3;">${camp.address || ''}</p>
              
              <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; tracking-wider; color: #94a3b8; display: block; margin-bottom: 4px;">Inventory Stock</span>
                ${inventoryHtml}
              </div>
              
              <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; background: ${
                  camp.status === 'ACTIVE' ? '#d1fae5; color: #065f46;' : camp.status === 'FULL' ? '#fef3c7; color: #92400e;' : '#fee2e2; color: #991b1b;'
                }">${camp.status}</span>
                <a href="/donate?campId=${camp.id}" style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; background: #6366f1; color: #ffffff; text-decoration: none; transition: background 0.2s;">Donate Now</a>
              </div>
            </div>
          `);
        markersGroup.current.addLayer(marker);
      }
    });

    // Fit map bounds to show all markers if any exist and no single selectedCamp
    if (camps.length > 0 && !selectedCamp && !tempLat) {
      const validCamps = camps.filter(c => c.latitude && c.longitude);
      if (validCamps.length > 0) {
        const bounds = L.latLngBounds(validCamps.map(c => [c.latitude, c.longitude]));
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [camps, selectedCamp, tempLat]);

  // Pan to selected camp
  useEffect(() => {
    if (!mapInstance.current || !selectedCamp) return;

    if (selectedCamp.latitude && selectedCamp.longitude) {
      mapInstance.current.setView([selectedCamp.latitude, selectedCamp.longitude], 14, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedCamp]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapRef} className="w-full h-full z-10" style={{ minHeight: '300px' }} />
    </div>
  );
};

export default CampMap;

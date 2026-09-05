import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const PropertyMap = ({ latitude, longitude, propertyName }) => {
    if (
        latitude === undefined ||
        longitude === undefined ||
        latitude === null ||
        longitude === null
    ) {
        return (
            <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100">
                <p className="text-sm text-gray-500">
                    Location coordinates unavailable
                </p>
            </div>
        );
    }

    const position = [
        Number(latitude),
        Number(longitude),
    ];

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;

    return (
        <div className="mt-4 overflow-hidden rounded-xl">
            <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block"
                aria-label={`Open ${propertyName || "property"} in Google Maps`}
            >
                <MapContainer
                    center={position}
                    zoom={15}
                    scrollWheelZoom={false}
                    dragging={false}
                    doubleClickZoom={false}
                    zoomControl={false}
                    className="pointer-events-none h-64 w-full"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={position}>
                        <Popup>
                            <strong>
                                {propertyName || "Property"}
                            </strong>
                        </Popup>
                    </Marker>
                </MapContainer>

                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-gray-800 shadow">
                    Open in Google Maps
                </span>
            </a>
        </div>
    );
};

export default PropertyMap;
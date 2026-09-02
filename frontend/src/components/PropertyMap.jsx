import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

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

    return (
        <div className="mt-4 overflow-hidden rounded-xl">
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                className="h-64 w-full"
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
        </div>
    );
};

export default PropertyMap;
import { Link } from "react-router-dom";

const RoomCard = ({ room, image }) => {
    const roomTitle =
        room.sharing === 1
            ? "Single Sharing"
            : room.sharing === 2
                ? "Double Sharing"
                : room.sharing === 3
                    ? "Triple Sharing"
                    : `${room.sharing} Sharing`;

    return (
        <Link
            to={`/properties/${room.property}/rooms/${room._id}`}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm transition hover:shadow-md"
        >
            {/* IMAGE */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {image ? (
                    <img
                        src={image}
                        alt={roomTitle}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                        🛏️
                    </div>
                )}
            </div>

            {/* DETAILS */}
            <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-gray-900">
                    {roomTitle}
                </h4>

                <p className="mt-1 text-xs text-gray-600">
                    ₹{Number(room.price).toLocaleString("en-IN")} / month
                </p>

                <p className="mt-1 text-[11px] text-gray-500">
                    {room.availability} Rooms
                    {" • "}
                    <span className="font-medium text-green-600">
                        {room.availability} Available
                    </span>
                </p>
            </div>

            {/* ARROW */}
            <span className="pr-1 text-lg text-gray-400">
                ›
            </span>
        </Link>
    );
};

export default RoomCard;
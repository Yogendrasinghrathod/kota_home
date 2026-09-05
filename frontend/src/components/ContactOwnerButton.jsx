import { useState } from "react";

const digitsOnly = (phone = "") => phone.replace(/\D/g, "");

const formatPhone = (phone = "") => {
  const digits = digitsOnly(phone);
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone || "Not available";
};

const ContactOwnerButton = ({
  phone,
  ownerName,
  propertyName,
  roomLabel,
  available = true,
}) => {
  const [open, setOpen] = useState(false);

  if (!available) {
    return (
      <p className="rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-500">
        This room is currently full
      </p>
    );
  }

  const whatsappNumber = digitsOnly(phone);
  const message = encodeURIComponent(
    `Hi${ownerName ? ` ${ownerName}` : ""}, I found ${propertyName || "your PG"} on Kota Home${
      roomLabel ? ` (${roomLabel})` : ""
    } and want to reserve it.`
  );

  return (
    <div className="space-y-2">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-12 w-full rounded-xl bg-[#7c5cfc] text-sm font-semibold text-white"
        >
          Reserve / Contact Owner
        </button>
      ) : (
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
          <p className="text-[11px] text-gray-500">Owner number</p>
          <p className="mt-0.5 text-base font-semibold text-gray-900">
            {formatPhone(phone)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={`tel:${phone}`}
              className="rounded-lg bg-white py-2 text-center text-xs font-semibold text-[#7c5cfc]"
            >
              Call
            </a>
            <a
              href={
                whatsappNumber
                  ? `https://wa.me/${whatsappNumber}?text=${message}`
                  : "#"
              }
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-[#25D366] py-2 text-center text-xs font-semibold text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactOwnerButton;

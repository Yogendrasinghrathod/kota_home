import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Location from "../models/Location.js";
import Room from "../models/Room.js";
import Media from "../models/Media.js";
import Amenity from "../models/Amenity.js";
import RoomAmenity from "../models/RoomAmenity.js";
import Review from "../models/Review.js";

const STUDENT_PHONE = "+919782362967";
const OWNER_PHONE = "+919352563529";
const SEED_PREFIX = "seed-";

const IMAGES = {
  sharma:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  verma:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  heights:
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  krishna:
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  sunrise:
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  rajeev:
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80",
};

const amenityNames = ["AC", "WiFi", "Geyser", "Study Table", "Wardrobe"];

const dummyProperties = [
  {
    name: "Sharma PG",
    type: "PG",
    gender: "MALE",
    description: "Well-maintained PG near coaching hubs in Talwandi.",
    location: {
      address: "12-B, Talwandi, Kota",
      area: "Talwandi",
      latitude: 25.1684,
      longitude: 75.8512,
    },
    rooms: [
      { price: 8000, sharing: 2, availability: 2, amenities: ["AC", "WiFi", "Geyser"] },
      { price: 6500, sharing: 3, availability: 1, amenities: ["WiFi"] },
    ],
    image: IMAGES.sharma,
  },
  {
    name: "Verma Residency",
    type: "PG",
    gender: "COED",
    description: "Affordable rooms in Vigyan Nagar with homely food.",
    location: {
      address: "Plot 8, Vigyan Nagar, Kota",
      area: "Vigyan Nagar",
      latitude: 25.1541,
      longitude: 75.8468,
    },
    rooms: [
      { price: 5500, sharing: 3, availability: 5, amenities: ["WiFi", "Study Table"] },
      { price: 7200, sharing: 2, availability: 2, amenities: ["AC", "WiFi"] },
    ],
    image: IMAGES.verma,
  },
  {
    name: "Kota Heights",
    type: "HOSTEL",
    gender: "MALE",
    description: "Hostel-style stay near Rajeev Gandhi Nagar.",
    location: {
      address: "Sector 4, Rajeev Gandhi Nagar, Kota",
      area: "Rajeev Gandhi",
      latitude: 25.1722,
      longitude: 75.8621,
    },
    rooms: [
      { price: 9000, sharing: 1, availability: 1, amenities: ["AC", "WiFi", "Wardrobe"] },
      { price: 7000, sharing: 2, availability: 3, amenities: ["WiFi", "Geyser"] },
    ],
    image: IMAGES.heights,
  },
  {
    name: "Shree Krishna PG",
    type: "PG",
    gender: "FEMALE",
    description: "Safe girls PG in Talwandi with 24x7 warden.",
    location: {
      address: "Nayapura Road, Talwandi, Kota",
      area: "Talwandi",
      latitude: 25.1699,
      longitude: 75.8534,
    },
    rooms: [
      { price: 8500, sharing: 2, availability: 3, amenities: ["AC", "WiFi", "Geyser"] },
    ],
    image: IMAGES.krishna,
  },
  {
    name: "Sunrise Hostel",
    type: "HOSTEL",
    gender: "MALE",
    description: "Budget hostel for JEE/NEET students.",
    location: {
      address: "Main Road, Vigyan Nagar, Kota",
      area: "Vigyan Nagar",
      latitude: 25.1555,
      longitude: 75.8481,
    },
    rooms: [
      { price: 4800, sharing: 3, availability: 6, amenities: ["WiFi"] },
      { price: 6200, sharing: 2, availability: 2, amenities: ["WiFi", "Study Table"] },
    ],
    image: IMAGES.sunrise,
  },
  {
    name: "Agarwal PG",
    type: "PG",
    gender: "COED",
    description: "New PG with balcony rooms in Rajeev Gandhi Nagar.",
    location: {
      address: "Lane 3, Rajeev Gandhi Nagar, Kota",
      area: "Rajeev Gandhi",
      latitude: 25.1738,
      longitude: 75.8644,
    },
    rooms: [
      { price: 7800, sharing: 2, availability: 4, amenities: ["AC", "WiFi", "Wardrobe"] },
    ],
    image: IMAGES.rajeev,
  },
];

const resetDatabase = async () => {
  await mongoose.connection.dropDatabase();
  console.log("Dropped existing database collections.");
};

const seed = async () => {
  await connectDB();
  await resetDatabase();

  const [owner, student, reviewer] = await User.create([
    {
      firebaseUid: `${SEED_PREFIX}owner`,
      phone: OWNER_PHONE,
      name: "Dummy Owner",
      role: "OWNER",
    },
    {
      firebaseUid: `${SEED_PREFIX}student`,
      phone: STUDENT_PHONE,
      name: "Rahul",
      role: "STUDENT",
    },
    {
      firebaseUid: `${SEED_PREFIX}reviewer`,
      phone: "+910000000003",
      name: "Ananya",
      role: "STUDENT",
    },
  ]);

  const amenityDocs = await Amenity.insertMany(
    amenityNames.map((name) => ({ name }))
  );

  const amenityByName = Object.fromEntries(
    amenityDocs.map((item) => [item.name, item._id])
  );

  for (const item of dummyProperties) {
    const property = await Property.create({
      owner: owner._id,
      name: item.name,
      type: item.type,
      gender: item.gender,
      description: item.description,
      status: "ACTIVE",
    });

    await Location.create({
      property: property._id,
      ...item.location,
    });

    let primaryRoom = null;

    for (const [index, roomData] of item.rooms.entries()) {
      const room = await Room.create({
        property: property._id,
        price: roomData.price,
        sharing: roomData.sharing,
        availability: roomData.availability,
      });

      if (index === 0) primaryRoom = room;

      await RoomAmenity.insertMany(
        roomData.amenities.map((name) => ({
          room: room._id,
          amenity: amenityByName[name],
        }))
      );
    }

    await Media.create({
      property: property._id,
      room: primaryRoom._id,
      type: "IMAGE",
      url: item.image,
      isPrimary: true,
    });

    await Review.create({
      user: student._id,
      property: property._id,
      rating: 4,
      comment: "Clean rooms and good location for coaching.",
    });
  }

  await Review.create({
    user: reviewer._id,
    property: (await Property.findOne({ name: "Sharma PG" }))._id,
    rating: 5,
    comment: "Best PG in Talwandi. Food is decent.",
  });

  console.log("Dummy data seeded successfully.");
  console.log(`Student phone: ${STUDENT_PHONE}`);
  console.log(`Owner phone: ${OWNER_PHONE}`);
  console.log(`Properties: ${dummyProperties.length}`);
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

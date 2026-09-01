🏠 Kota Home — Backend Architecture

Authentication + Property Ecosystem Documentation

Kota Home is a PG/room discovery platform focused initially on Kota. The backend uses Node.js, Express, MongoDB/Mongoose, Firebase Authentication, Firebase Admin SDK, and a React frontend with React Router.
1. Project Overview
•	Node.js + Express
•	MongoDB + Mongoose
•	Firebase Phone Authentication
•	Firebase Admin SDK
•	React frontend
•	React Router
•	REST APIs
•	Authentication and ownership-based authorization
2. Current ER Diagram

                              ┌──────────────────────┐
                              │         USER         │
                              │──────────────────────│
                              │ _id PK               │
                              │ firebaseUid UNIQUE   │
                              │ phone UNIQUE         │
                              │ name                 │
                              │ role                 │
                              │ isPhoneVerified      │
                              │ createdAt            │
                              │ updatedAt            │
                              └──────────┬───────────┘
                                         │ owns
                                         ▼
                              ┌──────────────────────┐
                              │       PROPERTY       │
                              │──────────────────────│
                              │ _id PK               │
                              │ owner FK → User      │
                              │ name                 │
                              │ type                 │
                              │ gender               │
                              │ description          │
                              │ status               │
                              └──────────┬───────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
             ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
             │    ROOM     │     │  LOCATION   │     │    MEDIA    │
             │─────────────│     │─────────────│     │─────────────│
             │ _id PK      │     │ _id PK      │     │ _id PK      │
             │ property FK │     │ property FK │     │ property FK │
             │ price       │     │ address     │     │ room FK     │
             │ sharing     │     │ area        │     │ type        │
             │ availability│     │ latitude    │     │ url         │
             └──────┬──────┘     │ longitude   │     │ isPrimary   │
                    │             └─────────────┘     └─────────────┘
                    │ has
                    ▼
             ┌─────────────────┐
             │  ROOM_AMENITY   │
             │─────────────────│
             │ room FK         │
             │ amenity FK      │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │     AMENITY     │
             │─────────────────│
             │ _id PK          │
             │ name            │
             └─────────────────┘

                              USER
                                │ writes
                                ▼
                       ┌─────────────────┐
                       │     REVIEW      │
                       │─────────────────│
                       │ _id PK          │
                       │ user FK         │
                       │ property FK     │
                       │ rating          │
                       │ comment         │
                       │ createdAt       │
                       └─────────────────┘

3. Authentication Architecture

                     FRONTEND
                        │
                        │ Phone number
                        ▼
                 Firebase Phone Auth
                        │
                        │ OTP
                        ▼
                     User
                        │
                        │ Verify OTP
                        ▼
                 Firebase User
                        │
                        │ getIdToken()
                        ▼
                Firebase ID Token
                        │
                        │ Authorization: Bearer <token>
                        ▼
                    Express Backend
                        │
                        ▼
              Firebase Admin SDK
                        │
                        │ verifyIdToken()
                        ▼
                   req.user
                        │
                        │ Firebase UID
                        ▼
                  MongoDB User
                        │
                        ▼
                 Authenticated API

4. Complete Login Flow

User
 │
 │ Enter phone number
 ▼
React App
 │
 │ sendOTP()
 ▼
Firebase
 │
 │ OTP
 ▼
User
 │
 │ Enter OTP
 ▼
React App
 │
 │ verifyOTP()
 ▼
Firebase
 │
 │ Firebase User
 ▼
getIdToken()
 │
 ▼
POST /api/auth/login
 │
 ▼
authenticateUser middleware
 │
 ▼
Firebase Admin verifyIdToken()
 │
 ▼
req.user.uid
 │
 ▼
MongoDB User
 │
 ├── Exists → retrieve user
 │
 └── Doesn't exist → create user
 │
 ▼
Login Response
 │
 ▼
AuthContext
 │
 ▼
Logged-in application

5. Authentication vs Authorization
Authentication answers: “Who are you?”

Firebase ID Token
        ↓
Firebase Admin
        ↓
verifyIdToken()
        ↓
req.user

Authorization answers: “Are you allowed to perform this action?”

User
 ↓
Property
 ↓
Owner?
 ↓
YES → allow
NO  → 403 Forbidden

6. Auth Middleware

Request
   │
   ▼
Authorization Header
   │
   │ Bearer <Firebase ID Token>
   ▼
Firebase Admin
   │
   ▼
verifyIdToken()
   │
   ├── Invalid → 401
   │
   └── Valid
         │
         ▼
      req.user
         │
         ▼
      Controller

7. Frontend AuthContext + Persistence

Firebase
   │
   │ onAuthStateChanged()
   ▼
AuthContext
   │
   ├── user
   ├── loading
   └── logout
   │
   ▼
React Application


LOGIN
  │
  ▼
Firebase Authentication
  │
  ▼
Authenticated Firebase User
  │
  ▼
Browser refresh
  │
  ▼
Firebase restores session
  │
  ▼
onAuthStateChanged()
  │
  ▼
AuthContext
  │
  ▼
User remains logged in

8. React Protected Routes

                    React Router
                         │
                         ▼
                  ProtectedRoute
                         │
                  ┌──────┴──────┐
                  │             │
              Logged in      Not logged in
                  │             │
                  ▼             ▼
             Dashboard        Login

Frontend route protection improves user experience, but backend authentication is still required because frontend protection alone is not security.
9. Property Architecture

USER
 │
 │ owns
 ▼
PROPERTY
 ├── ROOM
 ├── LOCATION
 ├── MEDIA
 └── REVIEW

10. Property APIs

POST /api/properties
GET  /api/properties
GET  /api/properties/:id

Create Property flow:

Request
  ↓
authenticateUser
  ↓
createProperty
  ↓
MongoDB
  ↓
Property created

11. Property Ownership

Firebase User
     │
     ▼
authenticateUser
     │
     ▼
MongoDB User
     │
     ▼
Property.owner
     │
     ▼
Compare IDs
     │
 ┌───┴────┐
 │        │
MATCH   NO MATCH
 │        │
 ▼        ▼
Allow    403

12. Room Architecture

PROPERTY
   │
   │ contains
   ▼
ROOM
 ├── price
 ├── sharing
 └── availability


POST /api/properties/:propertyId/rooms
                  │
                  ▼
          authenticateUser
                  │
                  ▼
        verifyPropertyOwner
                  │
                  ▼
             createRoom
                  │
                  ▼
               MongoDB

13. Room Authorization

Firebase User
      ↓
MongoDB User
      ↓
Room
      ↓
Room.property
      ↓
Property.owner
      ↓
Compare with User

14. Location Architecture

PROPERTY
   │
   │ has
   ▼
LOCATION
 ├── address
 ├── area
 ├── latitude
 └── longitude

The current location design is for the Kota-focused version of Kota Home.
15. Amenity Architecture

AMENITY
 ├── WiFi
 ├── AC
 ├── Laundry
 ├── Parking
 ├── Mess
 └── Power Backup

ROOM
  │
  ▼
ROOM_AMENITY
  │
  ▼
AMENITY

Room ↔ Amenity is a many-to-many relationship: one room can have many amenities, and one amenity can belong to many rooms.
16. Room-Amenity APIs

POST /api/amenities
POST /api/rooms/:roomId/amenities
GET  /api/rooms/:roomId/amenities


POST /api/rooms/:roomId/amenities
                  │
                  ▼
          authenticateUser
                  │
                  ▼
           verifyRoomOwner
                  │
                  ▼
          addAmenityToRoom
                  │
                  ▼
            RoomAmenity
                  │
             ┌────┴────┐
             ▼         ▼
           ROOM     AMENITY

17. Media Architecture

PROPERTY
   │
   └── MEDIA
         │
         └── ROOM

MEDIA
 ├── property
 ├── room
 ├── type
 ├── url
 └── isPrimary


POST /api/properties/:propertyId/media
                  │
                  ▼
          authenticateUser
                  │
                  ▼
         verifyPropertyOwner
                  │
                  ▼
     verifyRoomBelongsToProperty
                  │
                  ▼
             createMedia
                  │
                  ▼
              MongoDB

18. Review Architecture

USER
 │
 │ writes
 ▼
REVIEW
 │
 │ belongs to
 ▼
PROPERTY

REVIEW
 ├── user
 ├── property
 ├── rating
 ├── comment
 └── createdAt


POST /api/properties/:propertyId/reviews
GET  /api/properties/:propertyId/reviews

The backend determines the reviewer from the Firebase-authenticated user rather than trusting a userId sent by the frontend.

Firebase ID Token
       ↓
authenticateUser
       ↓
req.user.uid
       ↓
MongoDB User
       ↓
user._id
       ↓
Create Review

One user can review different properties, but the same user cannot review the same property twice.
19. Current API List
AUTH
•	POST /api/auth/login
PROPERTY
•	POST /api/properties
•	GET /api/properties
•	GET /api/properties/:id
ROOM
•	POST /api/properties/:propertyId/rooms
•	GET /api/properties/:propertyId/rooms
LOCATION
•	POST /api/properties/:propertyId/location
•	GET /api/properties/:propertyId/location
AMENITY
•	POST /api/amenities
ROOM AMENITY
•	POST /api/rooms/:roomId/amenities
•	GET /api/rooms/:roomId/amenities
MEDIA
•	POST /api/properties/:propertyId/media
•	GET /api/properties/:propertyId/media
REVIEW
•	POST /api/properties/:propertyId/reviews
•	GET /api/properties/:propertyId/reviews
20. Complete Backend Request Architecture

                         CLIENT
                           │
                           ▼
                    React Frontend
                           │
                           ▼
                    React Router
                           │
                           ▼
                    AuthContext
                           │
                           ▼
                  Firebase Authentication
                           │
                           ▼
                    Firebase ID Token
                           │
                           │ Bearer Token
                           ▼
                    Express Backend
                           │
                           ▼
                ┌──────────────────────┐
                │ authenticateUser     │
                │ Firebase Admin SDK   │
                └──────────┬───────────┘
                           │
                           ▼
                       req.user
                           │
                           ▼
                  Authorization Layer
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
       Property Owner   Room Owner   Relationship
             │             │              │
             └─────────────┼──────────────┘
                           ▼
                      Controller
                           │
                           ▼
                    Mongoose Models
                           │
                           ▼
                       MongoDB

21. Complete Kota Home Data Flow

                         USER
                          │
                          │ owns
                          ▼
                      PROPERTY
                     /    |                        /     |                       ROOM LOCATION MEDIA
                   │
                   │
                   ▼
             ROOM_AMENITY
                   │
                   ▼
                AMENITY

                  USER
                   │
                 writes
                   ▼
                REVIEW
                   │
                   ▼
                PROPERTY

22. Current Development Status
Module	Status
Firebase Phone OTP	✅ Complete
Firebase Admin	✅ Complete
Authentication middleware	✅ Complete
MongoDB User creation	✅ Complete
AuthContext	✅ Complete
Persistent login	✅ Complete
Logout	✅ Complete
React Router	✅ Complete
Protected frontend routes	✅ Complete
Property	✅ Complete
Property ownership	✅ Complete
Room	✅ Complete
Room availability	✅ Complete
Room ownership	✅ Complete
Location	✅ Complete
Amenity	✅ Complete
Room ↔ Amenity	✅ Complete
Media	✅ Complete
Review	✅ Complete
23. Key Architecture Principles
•	Firebase is responsible for phone OTP authentication and identity.
•	Firebase Admin verifies Firebase ID tokens on protected backend requests.
•	MongoDB stores the application-level User record.
•	The backend never trusts a userId supplied by the frontend for authenticated actions.
•	Ownership middleware protects Property and Room modification operations.
•	Room ↔ Amenity uses a junction collection for a many-to-many relationship.
•	Media validates that a room belongs to the property being modified.
•	Reviews enforce one review per user per property.
•	React Router protects frontend pages, while backend middleware provides actual API security.
24. Final Architecture to Remember

                       FIREBASE
                    PHONE AUTH + OTP
                           │
                           ▼
                    FIREBASE ID TOKEN
                           │
                           ▼
                   EXPRESS BACKEND
                           │
                           ▼
                  AUTHENTICATION
                           │
                           ▼
                       USER
                           │
                         owns
                           ▼
                      PROPERTY
                     /    |                        /     |                       ROOM LOCATION MEDIA
                   │
                   ▼
             ROOM_AMENITY
                   │
                   ▼
                AMENITY

                  USER
                   │
                 writes
                   ▼
                REVIEW
                   │
                   ▼
                PROPERTY


Current milestone: Core authentication + Property ecosystem completed.

```
ER Diagram
                     ┌──────────────────────┐

                     │         USER         │

                     │──────────────────────│

                     │ user_id PK           │

                     │ firebase_uid UNIQUE  │

                     │ phone UNIQUE         │

                     │ name                 │

                     │ role                 │

                     │ is_phone_verified    │

                     │ created_at           │

                     │ updated_at           │

                     └──────────┬───────────┘

                                │

                                │ owns

                                │

                                ▼

                     ┌──────────────────────┐

                     │       PROPERTY       │

                     │──────────────────────│

                     │ property_id PK       │

                     │ owner_id FK          │

                     │ name                 │

                     │ type                 │

                     │ gender               │

                     │ description          │

                     │ status               │

                     └──────────┬───────────┘

                                │

                ┌───────────────┼────────────────┐

                │               │                │

                ▼               ▼                ▼

         ┌────────────┐  ┌────────────┐  ┌────────────┐

         │    ROOM    │  │  LOCATION  │  │   MEDIA    │

         │────────────│  │────────────│  │────────────│

         │ room_id PK │  │location_id │  │ media_id PK│

         │ property_id│  │ property_id│  │ property_id│

         │ price      │  │ address    │  │ room_id FK │

         │ sharing    │  │ area       │  │ type       │

         │ availability│ │ latitude   │  │ url        │

         └──────┬─────┘  │ longitude  │  │ is_primary │

                │         └────────────┘  └────────────┘

                │

                │ has

                ▼

         ┌────────────────┐

         │ ROOM_AMENITY   │

         │────────────────│

         │ room_id FK     │

         │ amenity_id FK  │

         └───────┬────────┘

                 │

                 ▼

         ┌────────────────┐

         │    AMENITY      │

         │────────────────│

         │ amenity_id PK   │

         │ name            │

         └────────────────┘

  ┌──────────────────────┐

  │         USER         │

  └──────────┬───────────┘

             │

             │ writes

             ▼

  ┌──────────────────────┐

  │        REVIEW        │

  │──────────────────────│

  │ review_id PK         │

  │ user_id FK           │

  │ property_id FK       │

  │ rating               │

  │ comment              │

  │ created_at           │

  └──────────┬───────────┘

             │

             ▼

          PROPERTY
```



Authentication Flow



```mermaid

flowchart TD

    A["👤 User"] --> B["Login.jsx<br/>Enter Phone Number"]

    B --> C["sendOTP()"]

    C --> D["Firebase Phone Authentication"]

    D --> E["OTP Sent"]

    E --> F["User Enters OTP"]

    F --> G["verifyOTP()"]

    G --> H{"OTP Valid?"}

    H -- "No" --> I["Show Error"]

    I --> F

    H -- "Yes" --> J["Firebase User<br/>UID + Phone"]

    J --> K["onAuthStateChanged()"]

    K --> L["AuthContext"]

    L --> M["getIdToken()"]

    M --> N["POST /api/auth/login<br/>Authorization: Bearer ID_TOKEN"]

    N --> O["Express Backend"]

    O --> P["Auth Middleware"]

    P --> Q["Firebase Admin SDK"]

    Q --> R{"ID Token Valid?"}

    R -- "No" --> S["401 Unauthorized"]

    R -- "Yes" --> T["Firebase UID"]

    T --> U["Auth Controller"]

    U --> V["Find User by firebaseUid"]

    V --> W{"User Exists?"}

    W -- "No" --> X["Create MongoDB User"]

    W -- "Yes" --> Y["Get Existing MongoDB User"]

    X --> Z["MongoDB User"]

    Y --> Z

    Z --> AA["Return User to Frontend"]

    AA --> AB["AuthContext.setUser()"]

    AB --> AC["React Router"]

    AC --> AD["ProtectedRoute"]

    AD --> AE{"Authenticated?"}

    AE -- "No" --> AF["Navigate to /login"]

    AE -- "Yes" --> AG["Dashboard / Protected Page"]

    %% Persistence

    AG --> AH["🔄 Page Refresh"]

    AH --> AI["AuthProvider Starts"]

    AI --> K

    %% Logout

    AG --> AJ["🚪 User Clicks Logout"]

    AJ --> AK["logoutUser()"]

    AK --> AL["Firebase signOut()"]

    AL --> AM["Firebase Session Removed"]

    AM --> K

    K --> AN["firebaseUser = null"]

    AN --> AB

    AB --> AF

```


```
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

Phone Auth  using firebase

flowchart TD

    A[Student opens Kota Home] --> B[Enter Phone Number]

    B --> C[React Frontend]

    C --> D[Firebase Phone Authentication]

    D --> E[Firebase sends OTP]

    E --> F[Student enters OTP]

    F --> G{OTP Valid?}

    G -- No --> H[Show Authentication Error]

    H --> F

    G -- Yes --> I[Firebase creates/authenticates User]

    I --> J[Firebase User UID]

    J --> K[React gets Firebase ID Token]

    K --> L[POST /api/auth/login]

    L --> M[Express Backend]

    M --> N[Auth Middleware]

    N --> O[Extract Bearer Token]

    O --> P[Firebase Admin SDK]

    P --> Q{ID Token Valid?}

    Q -- No --> R[Return 401 Unauthorized]

    Q -- Yes --> S[Decode Firebase User]

    S --> T[req.user]

    T --> U[Auth Controller]

    U --> V{User exists in MongoDB?}

    V -- Yes --> W[Find Existing User]

    V -- No --> X[Create New User]

    X --> Y[MongoDB User]

    W --> Y

    Y --> Z[Return User Data]

    Z --> AA[React Frontend]

    AA --> AB[User Logged In]


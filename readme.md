                         ┌──────────────┐

                         │     USER     │

                         │──────────────│

                         │ user_id PK   │

                         │ name         │

                         │ phone        │

                         │ role         │

                         └──────┬───────┘

                                │

                                │ owns

                                │

                                ▼

                         ┌──────────────┐

                         │   PROPERTY   │

                         │──────────────│

                         │ property_id  │

                         │ owner_id FK  │

                         │ name         │

                         │ type         │

                         │ gender       │

                         └──────┬───────┘

                                │

                   ┌────────────┼─────────────┐

                   │            │             │

                   │            │             │

                   ▼            ▼             ▼

             ┌──────────┐ ┌──────────┐ ┌────────────┐

             │   ROOM   │ │ LOCATION │ │   MEDIA    │

             │──────────│ │──────────│ │────────────│

             │ room_id  │ │location_id│ │ media_id   │

             │ property │ │ property  │ │ property   │

             │ price    │ │ lat       │ │ room_id    │

             │ sharing  │ │ lng       │ │ url        │

             └────┬─────┘ └──────────┘ └────────────┘

                  │

                  │

                  ▼

             ┌──────────────┐

             │ ROOM_AMENITY │

             └──────┬───────┘

                    │

                    ▼

             ┌──────────────┐

             │   AMENITY    │

             └──────────────┘

      ┌──────────────┐

      │     USER     │

      └──────┬───────┘

             │

             │ writes

             ▼

      ┌──────────────┐

      │    REVIEW    │

      │──────────────│

      │ review_id PK │

      │ user_id FK   │

      │ property_id  │

      │ rating       │

      │ comment      │

      └──────┬───────┘

             │

             │

             ▼

         PROPERTY







USER       1 ─────── N  PROPERTY

PROPERTY   1 ─────── N  ROOM

PROPERTY   1 ─────── 1  LOCATION

PROPERTY   1 ─────── N  MEDIA

ROOM       1 ─────── N  MEDIA

ROOM       N ─────── N  AMENITY

USER       1 ─────── N  REVIEW

PROPERTY   1 ─────── N  REVIEW
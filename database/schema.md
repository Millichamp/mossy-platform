# Mossy Database Schema

## Users
- id (UUID, Primary Key)
- email (TEXT, Unique)
- password (TEXT, hashed)
- role (TEXT) - buyer/seller/service_provider
- name (TEXT)
- phone (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Listings
- id (UUID, Primary Key)
- title (TEXT, Required)
- description (TEXT, Required)
- price (INTEGER, Required) - in pence
- bedrooms (INTEGER, Required)
- bathrooms (INTEGER, Required)
- receptions (INTEGER, Default: 0)
- property_type (TEXT, Required) - detached/semi-detached/terraced/flat/bungalow
- address (JSONB, Required) - {line1, city, postcode, displayAddress}
- coordinates (JSONB) - {lat, lng}
- images (JSONB) - [{url, caption, isMain}]
- floor_plan (TEXT) - Optional floor plan image URL
- key_features (JSONB) - [string array]
- square_feet (INTEGER)
- year_built (INTEGER)
- tenure (TEXT) - freehold/leasehold
- leasehold_years (INTEGER) - if leasehold
- ground_rent (DECIMAL) - if leasehold
- service_charge (DECIMAL) - if leasehold
- council_tax_band (TEXT) - A-H
- epc_rating (TEXT) - A-G
- epc_certificate_url (TEXT)
- chain_free (BOOLEAN, Default: false)
- parking_spaces (INTEGER, Default: 0)
- reason_for_sale (TEXT)
- completion_timeline (TEXT)
- virtual_tour_url (TEXT)
- status (TEXT, Default: 'active') - active/sold/hidden/draft
- listed_date (TIMESTAMP)
- seller_id (UUID, Foreign Key -> Users.id)
- seller_name (TEXT)
- seller_response_time (TEXT)
- view_count (INTEGER, Default: 0)
- save_count (INTEGER, Default: 0)
- price_history (JSONB) - [{date, price, event}]
- nearby_schools (JSONB) - [{name, type, distance, ofstedRating}]
- transport_links (JSONB) - [{type, name, distance}]

## Offers
- id (UUID, Primary Key)
- property_id (UUID, Foreign Key -> Listings.id)
- buyer_id (UUID, Foreign Key -> Users.id)
- amount (INTEGER, Required) - in pence
- status (TEXT, Default: 'pending') - pending/accepted/rejected
- message (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Saved_Properties
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> Users.id)
- property_id (UUID, Foreign Key -> Listings.id)
- created_at (TIMESTAMP)

## Service_Providers
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> Users.id)
- business_name (TEXT)
- service_type (TEXT) - photography/conveyancing/negotiation/moving
- description (TEXT)
- price_range (TEXT)
- rating (DECIMAL)
- verified (BOOLEAN, Default: false)
- created_at (TIMESTAMP)
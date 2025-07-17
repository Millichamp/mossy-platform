# Mossy Database Schema

## Users
- id
- email
- password (hashed)
- role (buyer/seller/service_provider)
- name
- phone
- created_at
- updated_at

## Properties
- id
- seller_id (references Users)
- title
- description
- price
- bedrooms
- bathrooms
- address
- city
- postcode
- images[]
- status (active/sold/hidden)
- created_at
- updated_at

## Offers
- id
- property_id
- buyer_id
- amount
- status (pending/accepted/rejected)
- message
- created_at
- updated_at

## Service Providers
- id
- user_id (references Users)
- business_name
- service_type (photography/conveyancing/negotiation/moving)
- description
- price_range
- rating
- verified
- created_at
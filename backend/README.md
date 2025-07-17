# Listings Data Management Scripts

## Flush Listings

Deletes all rows from the `listings` table in Supabase.

**Command:**

```
npm run flush:listings
```

---


## Seed Listings

Flushes all listings, then uploads Unsplash images to Supabase Storage, updates listing image URLs, and seeds the listings table with demo data.

**Command:**

```
npm run seed:listings
```

This will first delete all existing listings, then reseed with fresh data and Supabase-hosted images.

---

**Note:** Ensure your `.env` contains valid `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (for flush) and `SUPABASE_SERVICE_KEY` (for seeding/uploading) before running these scripts.
# Mossy Backend API

This is the backend for the Mossy property marketplace, built with Node.js, Express, TypeScript, and Prisma ORM (PostgreSQL).

## Features
- REST API for property listings (CRUD)
- PostgreSQL database via Prisma
- TypeScript for type safety
- .env for environment variables

## Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Set your PostgreSQL connection string in `.env`:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mossy_db?schema=public"
   ```
3. Run Prisma migrations:
   ```
   npx prisma migrate dev --name init
   ```
4. Start the server:
   ```
   npx ts-node-dev src/index.ts
   ```

## API Endpoints
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

## Development
- Edit the Prisma schema in `prisma/schema.prisma` and run `npx prisma migrate dev` to update the database.
- Use TypeScript for all source files in `src/`.

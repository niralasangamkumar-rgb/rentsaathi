# RentSaathi - Rental Marketplace App

A mobile-first rental marketplace for hostels, PGs, rooms, flats, commercial spaces, bikes, and cars.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Firebase
  - Authentication (Phone OTP + Email/Password)
  - Cloud Firestore (Database)
  - Firebase Storage (Image uploads)
- **Styling**: Tailwind CSS (Clean minimal design)

## Features

### 1. Authentication
- **Phone OTP Authentication** (Primary) - Firebase Phone Auth with OTP verification
- **Email/Password Authentication** (Fallback option)
- **User Roles**: Owner or Renter (selected during signup)
- Protected routes for logged-in users and owner-only features

### 2. City-Based Navigation
- Users must select a city to continue
- Supported cities: Patna, Delhi, Mumbai, Bangalore (extensible)
- Listings are filtered by selected city

### 3. Listings
- Browse listings with filters (Category, Price Range, Area)
- View detailed listing information:
  - Multiple images
  - Rent price
  - Category (PG, Room, Flat, Bike, Car, etc.)
  - Area/Locality
  - Description
  - Amenities
  - Owner contact info

### 4. Featured Listings
- Featured listings appear at the top of the home page
- Regular listings appear below
- Featured flag stored in Firestore

### 5. Contact Owner
- **Call Owner** button (tel: link)
- **Chat on WhatsApp** button (wa.me link)
- Uses phone number stored with the listing

### 6. Post a Listing (Owners Only)
- Simple form with:
  - Category selection
  - Rent/Price
  - Area/Locality
  - Description
  - Contact phone number
  - Multiple image upload
- Only users with "owner" role can post listings

### 7. Saved Listings
- Logged-in users can save/unsave listings
- Saved listing IDs stored in user profile
- Dedicated "Saved Listings" page

### 8. Filters
- Filter by Category
- Filter by Rent range (min/max)
- Filter by Area/Locality

## Firestore Structure

```
/cities/{cityId}
  - name: string
  - state: string
  - createdAt: timestamp

/users/{userId}
  - name: string
  - email: string
  - phone: string
  - role: 'owner' | 'renter'
  - savedListings: string[] (listing IDs)
  - createdAt: timestamp

/listings/{listingId}
  - title: string
  - description: string
  - category: string
  - price: number
  - area: string
  - phone: string
  - images: string[]
  - amenities: string[]
  - ownerId: string
  - ownerName: string
  - cityId: string
  - cityName: string
  - featured: boolean
  - contact: { phone, email }
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with:
  - Authentication enabled (Phone + Email/Password)
  - Firestore Database
  - Storage

### Installation

1. Clone the repository
```bash
cd /app/frontend
```

2. Install dependencies
```bash
yarn install
```

3. Configure Firebase (already configured in `/src/config/firebase.js`)

4. Run the development server
```bash
yarn dev
```

5. Open http://localhost:3000 in your browser

### Firebase Setup Required

1. **Enable Phone Authentication**:
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Phone provider
   - Add test phone numbers if needed

2. **Create Firestore Indexes** (if prompted):
   - The app will automatically create composite indexes when needed
   - Follow the Firebase Console link in error messages to create indexes

3. **Set Firestore Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cities/{cityId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
  }
}
```

4. **Set Storage Rules**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## User Flows

### Renter Flow
1. Select city
2. Browse/search listings
3. Filter by category, price, area
4. View listing details
5. Call owner or WhatsApp
6. Save favorite listings

### Owner Flow
1. Select city
2. Sign up with "Owner" role
3. Post new listings
4. Manage listings from dashboard
5. Edit/delete own listings

## Categories

- 🏨 Hostel
- 🏠 PG (Paying Guest)
- 🚪 Room
- 🏢 Flat
- 🏪 Commercial Space
- 🏍️ Bike Rent
- 🚗 Car Rent

## License

MIT

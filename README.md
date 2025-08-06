# Home Organization App

A comprehensive home organization web application that allows users to create custom categories for tracking and managing household items with flexible data structures.

## Features

- **Dynamic Category System**: Create unlimited custom categories (e.g., "Clothes", "Fridge", "Tools")
- **Configurable Field Types**: Each category supports multiple field types:
  - Basic fields: item name, description, date added
  - Optional fields: images, boolean toggles, quantity with units, tags, location, expiry dates
- **Flexible Item Management**: Add, edit, delete, and search items within categories
- **Image Upload**: Store multiple images per item using Supabase Storage
- **User Authentication**: Secure registration and login system
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Search & Filter**: Advanced search and filtering across categories and items

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express.js
- TypeScript for type safety
- Supabase Auth for authentication
- Multer for file uploads
- Zod for validation

### Database & Storage
- Supabase (PostgreSQL) for database
- Supabase Storage for image uploads
- Row Level Security (RLS) for data isolation

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn package manager
- A Supabase account and project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sorting-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies (client & server)
npm run install:all
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and API keys
3. In the SQL Editor, run the migration file:
   ```sql
   -- Copy and paste the contents of server/migrations/001_initial_schema.sql
   ```
4. Set up Storage:
   - Go to Storage in the Supabase dashboard
   - Create a new bucket called "images"
   - Set the bucket to public

### 4. Environment Variables

Create the following environment files:

**Root `.env` file:**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Note: JWT is now handled by Supabase Auth
# No custom JWT configuration needed

# Database
DATABASE_URL=your_supabase_database_connection_string_here
```

**Client `.env` file (client/.env):**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### 5. Start the Application

```bash
# Start both client and server concurrently
npm run dev

# Or start them separately:
npm run client:dev  # Frontend at http://localhost:5173
npm run server:dev  # Backend at http://localhost:3001
```

## Development Commands

### Root Level
- `npm run dev` - Start both client and server
- `npm run build` - Build both client and server
- `npm run install:all` - Install dependencies for all projects

### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (server/)
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server

## Project Structure

```
sorting-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries (API, Supabase)
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── migrations/        # Database migrations
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Categories
- `GET /api/categories` - Get all user categories
- `POST /api/categories` - Create new category
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Items
- `GET /api/items` - Get all items (with filters)
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `PATCH /api/items/bulk` - Bulk update items

### Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `DELETE /api/upload/:path` - Delete image

## Usage Examples

### Creating a Category

A category defines the structure for items. For example, a "Clothes" category might have:

```json
{
  "name": "Clothes",
  "description": "My wardrobe items",
  "color": "#3B82F6",
  "field_config": [
    {
      "id": "season",
      "name": "Season",
      "type": "select",
      "required": false,
      "options": {
        "options": ["Spring", "Summer", "Fall", "Winter"]
      }
    },
    {
      "id": "is_clean",
      "name": "Is Clean",
      "type": "boolean",
      "required": false
    },
    {
      "id": "location",
      "name": "Location",
      "type": "text",
      "required": false,
      "options": {
        "placeholder": "e.g., Closet shelf 2"
      }
    }
  ]
}
```

### Adding Items

Items conform to their category's field configuration:

```json
{
  "category_id": "category-uuid",
  "name": "Blue Jeans",
  "description": "Comfortable everyday jeans",
  "field_data": {
    "season": "Fall",
    "is_clean": true,
    "location": "Closet shelf 1"
  },
  "images": ["url-to-image"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Ensure your environment variables are correctly set
2. **CORS issues**: Check that CLIENT_URL matches your frontend URL
3. **Image upload fails**: Verify Supabase Storage bucket is created and public
4. **Authentication issues**: Verify Supabase Auth is properly configured

### Getting Help

- Check the browser console for client-side errors
- Check the server console for backend errors
- Verify Supabase dashboard for database issues
- Ensure all environment variables are properly configured

## Future Enhancements

- [ ] Category templates for common use cases
- [ ] Data export/import functionality
- [ ] Mobile app using React Native
- [ ] Barcode scanning for quick item entry
- [ ] Inventory alerts and notifications
- [ ] Advanced reporting and analytics
- [ ] Sharing categories between users
- [ ] Offline support with sync
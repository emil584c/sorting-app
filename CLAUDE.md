# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a home organization web application that allows users to create custom categories for tracking household items with flexible data structures. Users can create unlimited custom categories (e.g., "Clothes", "Fridge", "Tools") with configurable field types.

## Tech Stack
- **Frontend**: React with TypeScript, shadcn/ui components, Tailwind CSS
- **Backend**: Node.js with Express.js, RESTful API, Supabase Auth
- **Database**: Supabase (PostgreSQL) for database and authentication
- **Storage**: Supabase Storage for image uploads

## Core Architecture

### Dynamic Category System
The app centers around a flexible category creation system where:
- Users create custom categories with configurable fields
- Each category supports different field types (text, images, booleans, quantities with units, dates, etc.)
- Items within categories have dynamic schemas based on the category configuration

### Data Structure Approach
- Categories define field schemas that determine what data can be stored for items
- Items conform to their parent category's field configuration
- Field types include: basic text, images, boolean toggles, quantity fields with units, category tags, location, expiry dates, and custom text fields

### Authentication & Data Isolation
- Each user only sees their own categories and items
- All API endpoints require authentication
- Data is user-scoped at the database level

## Development Commands

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
npm run type-check   # TypeScript type checking
```

### Backend Development
```bash
npm run server:dev   # Start backend development server
npm run server:build # Build backend
npm run server:test  # Run backend tests
```

### Database
```bash
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed development data
```

## Key Implementation Priorities
1. Dynamic category creation with field type selection
2. Flexible item CRUD operations that adapt to category schemas
3. Image upload integration with Supabase Storage
4. Quantity tracking with customizable units
5. Boolean field support for toggleable states
6. Search and filtering across categories

## Development Notes
- The app should feel like a personal inventory management system
- Field configurations are stored as JSON schemas in the categories table
- Item data is validated against the parent category's field schema
- Mobile-responsive design is required
- Real-time updates may be implemented using Supabase's real-time capabilities

## Database Schema Considerations
- `categories` table stores field configurations as JSON
- `items` table has flexible JSON column for dynamic field data
- User-scoped data with proper foreign key relationships
- Consider indexing for search functionality across item data
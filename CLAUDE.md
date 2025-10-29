# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitBite is a Next.js-based healthy food ordering application with macro-nutrient tracking. The app allows users to order healthy meals with detailed customization options and track their nutritional intake.

### Key Features
- Menu browsing with detailed macro information (protein, carbs, fats, calories)
- Food customization with macro calculations
- Shopping cart management
- User authentication with role-based access
- Order management and payment processing (Xendit integration)
- Admin panel for menu and order management

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **UI Components**: Radix UI + Tailwind CSS
- **Payment**: Xendit integration
- **Form Handling**: React Hook Form + Zod validation

### Project Structure
- `app/` - Next.js App Router pages and API routes
  - `(auth)/` - Authentication pages (sign-in, sign-up)
  - `api/` - API routes including auth and webhooks
  - `actions/` - Server actions (cart, orders)
  - `admin/` - Admin panel pages
- `components/` - React components
  - `ui/` - Reusable UI components (shadcn/ui)
  - Feature-specific components (menu-list, shopping-cart, etc.)
- `lib/` - Utility functions and configurations
  - `auth.ts` - Better Auth configuration
  - `menu-data.ts` - Static menu data with macros
  - `actions/` - Server actions for menu and admin
- `db/` - Database configuration and schema
- `scripts/` - Database seeding and reset scripts

### Database Schema
- **User Management**: user, session, account, verification tables
- **Menu System**: menu_item table with JSON fields for macros and customization
- **Order System**: order and order_item tables with customer data and payment tracking

## Development Commands

```bash
# Development
npm run dev                    # Start development server (localhost:3000)

# Database Operations
npm run db:push               # Push schema changes to database
npm run db:studio             # Open Drizzle Studio for database inspection
npm run db:seed               # Seed menu items from static data
npm run db:reset              # Reset database and reseed

# Build & Production
npm run build                 # Build production application
npm run start                 # Start production server
npm run lint                  # Run ESLint
```

## Key Implementation Details

### Menu System
- Static menu data in `lib/menu-data.ts` with 20+ healthy items
- Each item has base macros and customizable options
- Customization system supports:
  - Choice-based options (protein size, base type)
  - Add-on extras with quantity limits
  - Real-time macro recalculation

### Authentication Flow
- Better Auth integration with custom role field
- Session management via SessionProvider wrapper
- Role-based access (member vs admin)
- Email/password authentication with verification

### Order Processing
- Shopping cart persists in component state
- Orders can be placed by guests or authenticated users
- Payment integration with Xendit (Indonesian payment gateway)
- Webhook handling for payment status updates
- Order tracking through multiple statuses (pending → completed)

### Admin Features
- Menu item management (CRUD operations)
- Order status management
- Customer order viewing
- Access restricted to users with admin role

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `BETTER_AUTH_URL` - Application URL
- `XENDIT_API_KEY` - Xendit payment gateway key

## Development Notes

### Database Migrations
- Uses Drizzle Kit for schema management
- Schema changes require `npm run db:push` to sync
- Database seeding available via `npm run db:seed`

### UI Components
- Built on Radix UI primitives with Tailwind styling
- Follows shadcn/ui component patterns
- Responsive design with mobile-first approach

### Code Organization
- Server actions separated by feature (cart, orders, menu, admin)
- Type definitions in `lib/types.ts` for shared interfaces
- Reusable UI components in dedicated folder structure
- Consistent naming conventions and file organization
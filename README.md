# SocialConnect - Modern Social Media Platform

A full-featured social media platform built with Next.js 15, Supabase, and modern web technologies. Features include user authentication, content management, real-time interactions, and a comprehensive admin panel.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - Secure JWT-based authentication with role-based access
- **Email Verification System** - Hybrid system supporting both Supabase native and custom email verification
- **Social Feed** - Real-time post feed with like, comment, and follow functionality
- **User Profiles** - Customizable profiles with privacy settings (Public/Private/Followers Only)
- **Content Management** - Create, edit, and delete posts with image uploads
- **Real-time Notifications** - Instant notifications for interactions
- **Responsive Design** - Mobile-first design with dark/light theme support

### Admin Panel
- **Dashboard Analytics** - Real-time statistics with dynamic growth calculations
- **User Management** - View user details, manage accounts, and handle user privacy settings
- **Content Moderation** - Manage posts, view likes/comments, and moderate content
- **Comment Management** - Delete inappropriate comments with soft delete functionality
- **Health Monitoring** - Database connection monitoring and health checks

## 🛠 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Authentication:** JWT with bcrypt password hashing + Supabase Auth integration
- **Storage:** Supabase Storage for file uploads
- **Real-time:** Supabase Realtime subscriptions
- **Deployment:** Vercel-ready with environment configuration

## 📋 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm/bun
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Rohit7008/SocialConnect.git
cd SocialConnect
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up Supabase
1. Create a new Supabase project
2. Enable Realtime on `public.notifications` table
3. **Configure Email Authentication:**
   - Go to Authentication > Settings in Supabase dashboard
   - Enable "Enable email confirmations"
   - Set "Site URL" to your domain (e.g., `http://localhost:3000`)
   - Configure email templates if needed
4. Run the SQL schema: Copy contents of `sql/schema.sql` and execute in Supabase SQL editor

### 4. Environment Configuration
Create `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# JWT Configuration
JWT_ISSUER=socialconnect
JWT_AUDIENCE=socialconnect-users
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600

# Storage Configuration
SUPABASE_STORAGE_BUCKET=avatars
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Settings (optional)
DEV_SKIP_VERIFICATION=true
```

### 5. Create Admin User
```bash
curl -X POST http://localhost:3000/api/util/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@yourdomain.com", "password": "yourpassword"}'
```

### 6. Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### 7. Test Email Verification
```bash
# Test custom email verification system
node test-email-verification.js

# Test Supabase native email verification
node test-supabase-verification.js
```

## 📱 Usage

### Regular Users
- **Login/Register** at `/`
- **Browse Feed** at `/feed` 
- **Explore Content** at `/explore`
- **Manage Profile** at `/profile`

### Admin Users
- **Admin Dashboard** at `/admin`
- **User Management** at `/admin/users`
- **Content Moderation** at `/admin/posts`
- **Health Monitoring** at `/api/health`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (hybrid verification system)
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with custom token
- `POST /api/auth/verify-supabase-email` - Verify email with Supabase token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/send-verification-email` - Send custom verification email
- `POST /api/auth/token/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/password-reset-confirm` - Confirm password reset
- `POST /api/auth/change-password` - Change user password

### User Management
- `GET /api/users/:id` - Get user profile
- `GET/PATCH /api/users/me` - Get/update current user
- `GET /api/users/:id/followers` - Get user followers
- `GET /api/users/:id/following` - Get user following
- `POST/DELETE /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/search` - Search users

### Content Management
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get posts (with pagination)
- `GET/PATCH/DELETE /api/posts/:post_id` - Get/update/delete post
- `POST/DELETE /api/posts/:post_id/like` - Like/unlike post
- `GET /api/posts/:post_id/like-status` - Check like status
- `POST/GET /api/posts/:post_id/comments` - Create/get comments
- `DELETE /api/comments/:comment_id` - Delete comment

### Feed & Notifications
- `GET /api/feed` - Get user feed
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/mark-all-read` - Mark all notifications as read

### Admin Panel
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users/:id/deactivate` - Deactivate user
- `GET /api/admin/posts` - Get all posts
- `DELETE /api/admin/posts/:id` - Delete post
- `GET /api/admin/posts/:id/likes` - Get post likes
- `GET /api/admin/posts/:id/comments` - Get post comments
- `DELETE /api/admin/comments/:id` - Delete comment
- `GET /api/admin/stats` - Get platform statistics

### Utilities
- `POST /api/util/create-admin` - Create admin user
- `GET /api/health` - Database health check

## 🎨 UI Components

### Public Pages
- `/` - Login/Register page
- `/verify-email` - Email verification page (handles both Supabase and custom tokens)
- `/feed` - Main social feed
- `/explore` - Discover content
- `/profile` - User profile management
- `/posts/:id` - Individual post view

### Admin Pages
- `/admin` - Admin dashboard with analytics
- `/admin/users` - User management interface
- `/admin/posts` - Content moderation interface

## 🔧 Database Connection & Performance

### Connection Management
- **Optimized Supabase Configuration** - Proper client setup with connection pooling
- **Retry Logic** - Automatic retry for failed database operations
- **Health Monitoring** - Real-time database connection status
- **Error Handling** - Comprehensive error handling with detailed logging

### Performance Features
- **Connection Pooling** - Efficient database connection management
- **Caching Strategy** - Optimized data fetching patterns
- **Real-time Updates** - Live data synchronization
- **Responsive Design** - Mobile-first approach with theme support

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SUPABASE_JWT_SECRET=your_production_jwt_secret
JWT_ISSUER=socialconnect
JWT_AUDIENCE=socialconnect-users
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600
SUPABASE_STORAGE_BUCKET=avatars
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Setup
1. Run the SQL schema in your production Supabase instance
2. Enable Row Level Security (RLS) policies
3. Configure storage buckets for file uploads
4. Set up realtime subscriptions for notifications

## 🛠 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:exec      # Execute SQL schema
npm run db:push      # Push database changes
npm run db:types     # Generate TypeScript types
```

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   └── (pages)/           # Public pages
├── components/            # React components
├── context/              # React context providers
├── lib/                  # Utility libraries
└── types/                # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at any scale


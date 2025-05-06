# SkillLink - Hyperlocal Skill Exchange Platform

SkillLink is a modern web application that connects local skill providers with seekers in a community, enabling users to exchange services, learn new skills, and build professional relationships within their geographical area.

## 🚀 Features

### Core Features

- **User Authentication**
  - Secure login/signup with email or social providers
  - Profile management with skill listing and verification
  - Role-based access (skill providers, seekers, admin)

- **Skill Marketplace**
  - Browse skill providers by categories
  - Filter by location, rating, availability
  - Detailed provider profiles with skills, pricing, and reviews

- **Booking System**
  - Interactive calendar for availability management
  - Real-time booking and appointment scheduling
  - Time slot selection and confirmation flow

- **Messaging & Communication**
  - Private messaging between providers and seekers
  - Notification system for bookings, messages, and updates
  - Read receipts and typing indicators

- **Reviews & Ratings**
  - Post-service review and rating system
  - Detailed feedback with comments and category ratings
  - Review moderation and verification

- **Admin Dashboard**
  - User management and moderation
  - Content administration and analytics
  - System health monitoring and reporting

### Advanced Features

- **3D Interactive Hero Section**
  - Dynamic three.js based 3D visualization
  - Interactive elements that respond to user actions
  - Cross-device compatible with optimized performance

- **Skill Exchange & Bartering**
  - Skill swap arrangements without monetary exchange
  - Mutual rating system for exchange quality
  - Skill equivalence suggestion system

- **Location-Based Matching**
  - Geolocation services to find nearby skill providers
  - Distance-based filtering and sorting

- **Progressive Web App Support**
  - Offline functionality with service workers
  - Push notifications for bookings and messages
  - "Add to Home Screen" functionality

- **Smooth Animation & Transitions**
  - GSAP and Framer Motion powered animations
  - Smooth scroll effects with Locomotive Scroll
  - Responsive design with adaptive animations

## 💡 MVP (Minimum Viable Product)

The MVP version of SkillLink includes:

1. **User Registration & Profiles**
   - Basic authentication and user profiles
   - Simple skill listing functionality

2. **Skill Discovery**
   - Browsable directory of skills and providers
   - Basic search and filtering

3. **Booking & Scheduling**
   - Simple calendar integration
   - Booking request and confirmation flow

4. **Basic Messaging**
   - Text-based communication between users
   - Booking-related notifications

5. **Simple Reviews**
   - Star rating system
   - Text feedback for completed services

## 🛠️ Tech Stack

SkillLink is built with a modern tech stack:

- **Frontend**
  - Next.js 15 (React framework)
  - React 19 (UI library)
  - TypeScript (Type safety)
  - TailwindCSS (Styling)
  - shadcn/ui components (UI components based on Radix UI)
  - Three.js / React Three Fiber (3D graphics)
  - Framer Motion / GSAP (Animations)

- **Backend**
  - Supabase (Backend as a Service)
  - NextAuth (Authentication)

- **Deployment & Infrastructure**
  - Vercel (Hosting)
  - Supabase (Backend services)

## 📋 Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- pnpm (Package manager)
- Supabase account for backend services

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/skilllink.git
   cd skilllink
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the database schema migration scripts (located in `/lib/seed-database.ts`)
   - Enable authentication providers in Supabase dashboard

5. **Run the development server**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

6. **Build for production**

   ```bash
   pnpm build
   pnpm start
   ```

## 🧪 Testing

Run tests using the following command:

```bash
pnpm test
```

## 📚 Documentation

Additional documentation:

- [Component Architecture](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or support, please reach out to the team at support@skilllink.com
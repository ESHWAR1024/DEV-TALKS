# 🚀 DEV-TALKS - Community-Driven Idea Management Platform

Empowering Teams to Collaborate, Vote, and Build Better Products Together

DEV-TALKS is a modern community platform that enables teams and organizations to collect, discuss, and prioritize ideas collaboratively. Built with Next.js 15, MongoDB, and NextAuth, it provides a seamless experience for idea management with real-time voting, status tracking, and comprehensive analytics.

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![NextAuth](https://img.shields.io/badge/NextAuth-Latest-purple?style=flat-square)

---

## ✨ Features

### 🎯 Core Capabilities
- **Private Communities**: Password-protected spaces for team collaboration
- **Idea Management**: Submit, discuss, and track ideas with rich descriptions
- **Democratic Voting**: Upvote/downvote system to prioritize best ideas
- **Real-time Discussions**: Threaded replies and comments on every idea
- **Status Tracking**: Four-stage workflow (Chat → Proceed → Hold → Discard)

### 📊 Analytics & Insights
- **Community Dashboard**: Comprehensive statistics and activity metrics
- **Top Contributors**: Leaderboard of most active community members
- **Engagement Metrics**: Track votes, replies, and participation trends
- **Activity Timeline**: 7-day activity graphs and recent updates
- **Most Voted/Discussed**: Highlight trending and popular ideas

### 👥 Member Management
- **Role-Based Access**: Creator admin privileges with member management
- **Member Statistics**: Individual contribution tracking (ideas, votes, replies)
- **Kick Members**: Admin controls to manage community membership
- **Activity Scores**: Comprehensive engagement metrics per member

### 🔒 Security & Authentication
- **NextAuth Integration**: Secure credential-based authentication
- **Password Protection**: Hashed community passwords with bcrypt
- **Session Management**: Secure user sessions and authorization
- **Protected Routes**: API-level security for all sensitive operations

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js 15    │◄──►│   API Routes     │◄──►│  MongoDB Atlas  │
│                 │    │                  │    │                 │
│ • App Router    │    │ • Communities    │    │ • Users         │
│ • Server Comp.  │    │ • Ideas          │    │ • Communities   │
│ • Client Comp.  │    │ • Votes/Replies  │    │ • Ideas         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └─────────────►│   NextAuth.js    │◄───────────┘
                        │                  │
                        │ • Credentials    │
                        │ • Sessions       │
                        │ • JWT Tokens     │
                        └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ESHWAR1024/DEV-TALKS.git
cd DEV-TALKS
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# For production
# NEXTAUTH_URL=https://your-domain.netlify.app
```

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

---

## ⚙️ Configuration

### Environment Variables

#### Development (.env.local)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devtalks
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

#### Production (Netlify Environment Variables)
```env
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-app.netlify.app
```

### Generate NextAuth Secret
```bash
openssl rand -base64 32
```

---

## 📊 Usage

### 1. Create an Account
- Sign up with username and password
- Secure authentication with NextAuth
- Automatic session management

### 2. Browse Communities
- Explore existing communities
- View member counts and descriptions
- Join with community password

### 3. Create Your Community
- Set a unique community name
- Add detailed description
- Choose a secure password (6+ characters)
- Automatically become admin

### 4. Manage Ideas
- **Submit Ideas**: Share your thoughts with title and description
- **Vote**: Upvote ideas you support, downvote to deprioritize
- **Discuss**: Add replies and engage in conversations
- **Track Status**: Monitor progress through workflow stages

### 5. Admin Features
- **View Dashboard**: Access comprehensive analytics
- **Manage Members**: View contributor stats and activity
- **Kick Members**: Remove inactive or disruptive users
- **Update Status**: Move ideas through workflow stages

### 6. Track Analytics
- **Statistics Overview**: Total ideas, votes, replies, members
- **Status Breakdown**: Distribution across workflow stages
- **Top Contributors**: Most active community members
- **Activity Graphs**: 7-day trends and patterns
- **Recent Activity**: Latest idea submissions

---

## 🛠️ API Routes

### Communities
```
GET    /api/communities              # List all communities
POST   /api/communities              # Create new community
GET    /api/communities/my-communities # User's joined communities
POST   /api/communities/join         # Join a community
GET    /api/communities/[id]         # Get community details
GET    /api/communities/[id]/dashboard # Community analytics
GET    /api/communities/[id]/members # Member statistics
POST   /api/communities/[id]/kick    # Kick a member (admin only)
```

### Ideas
```
GET    /api/ideas?communityId=[id]   # List community ideas
POST   /api/ideas                     # Create new idea
GET    /api/ideas/[id]               # Get idea details
PATCH  /api/ideas/[id]/vote          # Vote on idea
POST   /api/ideas/[id]/reply         # Add reply to idea
PATCH  /api/ideas/[id]/status        # Update idea status (admin)
```

### Authentication
```
POST   /api/auth/signup              # Create new account
POST   /api/auth/signin              # Sign in
POST   /api/auth/signout             # Sign out
GET    /api/auth/session             # Get current session
```

---

## 🎨 Key Components

### Frontend (Next.js 15)
- **App Router**: Modern Next.js routing with server components
- **Server Components**: Optimized data fetching and rendering
- **Client Components**: Interactive UI elements with React hooks
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dynamic Routes**: Community and idea detail pages

### Backend (API Routes)
- **RESTful APIs**: Standard HTTP methods for CRUD operations
- **Authentication**: NextAuth credential provider
- **Authorization**: Role-based access control (creator/member)
- **Data Validation**: Input sanitization and error handling

### Database (MongoDB)
- **Collections**: Users, Communities, Ideas
- **Indexing**: Optimized queries for performance
- **Population**: Efficient data relationships
- **Aggregation**: Complex analytics calculations

---

## 🚀 Performance

- **Fast Rendering**: Server components for optimal performance
- **Efficient Queries**: MongoDB indexing and aggregation
- **Session Caching**: NextAuth JWT tokens
- **Responsive UI**: Instant feedback on user actions
- **Optimized Builds**: Next.js production optimization

---

## 📁 Project Structure

```
DEV-TALKS/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Authentication
│   │   ├── communities/       # Community endpoints
│   │   └── ideas/             # Idea endpoints
│   ├── components/            # React Components
│   ├── lib/                   # Utility functions
│   │   └── mongodb.ts        # Database connection
│   ├── models/               # MongoDB Models
│   │   ├── User.ts
│   │   ├── community.ts
│   │   └── idea.ts
│   └── (pages)/              # App Router pages
├── public/                   # Static assets
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS config
└── tsconfig.json            # TypeScript config
```

---

## 🔧 Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

---

## 🚢 Deployment

### Netlify Deployment

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Select the main branch

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Ensure `NEXTAUTH_URL` points to your domain

4. **Deploy**
   - Automatic deployments on push to main
   - Preview deployments for pull requests

### MongoDB Atlas Setup

1. Create a new cluster
2. Add database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string
5. Add to environment variables

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** for the amazing React framework
- **MongoDB** for flexible database solutions
- **NextAuth** for authentication made easy
- **Tailwind CSS** for rapid UI development
- **Vercel** for Next.js development and resources

---

## 👥 Team

**ESHWAR** - [eshwar10245@gmail.com](mailto:eshwar10245@gmail.com)

Project Link: [https://github.com/ESHWAR1024/DEV-TALKS](https://github.com/ESHWAR1024/DEV-TALKS)

---

**Built with ❤️ for better team collaboration**

*Turning ideas into reality, one vote at a time.*

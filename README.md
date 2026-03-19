# 🐝 CourseHive - AI-Powered Learning Platform

CourseHive is a comprehensive, AI-enhanced learning platform that provides personalized educational resources, intelligent content curation, and interactive learning experiences. Built with a microservices architecture, it combines web scraping, AI analysis, and user personalization to create a powerful educational ecosystem.

## 🌟 Key Features

### 🔗 Intelligent Link Management
- **AI-Powered Categorization**: Automatically categorizes educational content using OpenAI
- **Multi-language Support**: Detects and translates content from various languages
- **Difficulty Classification**: Smart difficulty assessment (Beginner/Intermediate/Advanced)
- **Content Validation**: Comprehensive link validation with safety checks
- **Quality Scoring**: AI-based quality assessment and educational value rating

### 🎯 Personalization & Recommendations
- **Semantic Search**: AI-powered search using embeddings and natural language processing
- **Personalized Feed**: Tailored content recommendations based on user behavior
- **Skill Profiling**: Tracks user skills and learning progress
- **Learning Paths**: Suggests structured learning journeys
- **Trending Content**: Real-time trending analysis based on engagement

### 🤖 AI Tutor Mode
- **Interactive Q&A**: Ask questions and get intelligent responses
- **Context-Aware**: Understands user's learning context and skill level
- **Resource Suggestions**: Recommends relevant learning materials
- **Follow-up Questions**: Generates thoughtful follow-up questions
- **Learning Guidance**: Provides personalized learning suggestions

### 📊 Advanced Analytics
- **Performance Tracking**: Detailed analytics on learning progress
- **Engagement Metrics**: Click tracking, time spent, and interaction analysis
- **Skill Gap Analysis**: Identifies areas for improvement
- **Learning Insights**: AI-generated insights and recommendations
- **Progress Visualization**: Interactive charts and progress indicators

### 🎮 Gamification
- **Badge System**: Earn badges for learning achievements
- **Streak Tracking**: Daily learning streaks and consistency rewards
- **Leaderboards**: Compare progress with other learners
- **Progress Tracking**: Visual progress indicators and milestones

### 🔒 Security & Safety
- **Safe Browsing**: Real-time Google Safe Browsing API integration for threat detection
- **Virus Scanning**: VirusTotal API integration for comprehensive malware detection
- **Content Moderation**: AI-powered content quality assessment
- **User Feedback**: Community-driven content reporting system
- **Multi-layer Security**: Combined threat detection from multiple security providers

### 📚 Content Management
- **Student Uploads**: Students can upload study materials (notes, papers, question banks, videos, articles, books)
- **Mock Test Creation**: Students can create custom tests with multiple-choice questions
- **Admin Approval**: All content and tests require admin approval before going live
- **Submission Tracking**: View all submissions with approval status
- **Learning Paths**: Create and manage structured learning journeys with progress tracking

## 🏗️ Architecture

### Microservices Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  AI Evaluator   │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 5002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   MongoDB       │    │   Redis Cache   │
│   (Reverse      │    │   (Database)    │    │   (Caching)     │
│    Proxy)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Web Scraper   │
│   (Python)      │
│   Port: 5003    │
└─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18** with hooks and functional components
- **React Query** for data fetching and caching
- **React Router** for navigation
- **TailwindCSS** for styling with custom design system
- **Lucide React** for icons
- **React Hot Toast** for notifications

#### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Redis** for caching and session management
- **JWT** authentication with bcrypt password hashing
- **Express Rate Limit** for API protection
- **Helmet** for security headers
- **CORS** for cross-origin requests

#### AI Services
- **FastAPI** for AI service endpoints
- **OpenAI API** for content analysis and generation
- **scikit-learn** for machine learning operations
- **langdetect** for language detection
- **googletrans** for translation services

#### Web Scraping
- **Python** with asyncio for concurrent scraping
- **aiohttp** for async HTTP requests
- **BeautifulSoup** for HTML parsing
- **Rate limiting** and respectful scraping practices

#### Infrastructure
- **Docker** and Docker Compose for containerization
- **Nginx** for reverse proxy and static file serving
- **Redis** for caching and session storage
- **MongoDB** for data persistence

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB 5.0+
- Redis 6.0+ (Required for caching and performance)
- Docker and Docker Compose (optional)

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd coursehive
```

2. **Backend Setup**
```bash
cd backend
npm install
cp config.env.example config.env
# Edit config.env with your settings
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **AI Evaluator Setup**
```bash
cd ai-evaluator
pip install -r requirements.txt
# Set OPENAI_API_KEY environment variable
python main.py
```

5. **Web Scraper Setup**
```bash
cd scraper
pip install -r requirements.txt
python enhanced_scraper.py
```

### Docker Setup (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
coursehive/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                # Node.js backend API
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic services
│   ├── scripts/           # Database seeding scripts
│   └── server.js         # Main server file
├── ai-evaluator/          # FastAPI AI service
│   ├── main.py           # AI service endpoints
│   └── requirements.txt  # Python dependencies
├── scraper/              # Web scraping service
│   ├── enhanced_scraper.py # Main scraper
│   └── requirements.txt   # Python dependencies
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/config.env`)
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/coursehive
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
OPENAI_API_KEY=your-openai-api-key
AI_SERVICE_URL=http://localhost:5002
REDIS_URL=redis://localhost:6379
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

#### AI Evaluator
```env
OPENAI_API_KEY=your-openai-api-key
SAFE_BROWSING_API_KEY=your-safe-browsing-api-key
VIRUS_TOTAL_API_KEY=your-virus-total-api-key
```

### Email Setup

The application includes comprehensive email notifications for:
- Password changes
- Two-factor authentication setup/disable
- Account deletion
- Login notifications

#### Gmail App Password Setup
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. At the bottom, select "App passwords"
4. Generate a new app password for "Mail"
5. Use this password as `EMAIL_PASSWORD` in your config

## 🎯 API Endpoints

### Links API (`/api/links`)
- `GET /` - Get paginated links with filtering and caching
- `GET /trending` - Get trending links (cached)
- `GET /recommendations` - Get personalized recommendations (cached)
- `POST /search` - Semantic search
- `GET /:id` - Get specific link
- `POST /:id/click` - Track link click
- `POST /:id/bookmark` - Bookmark/unbookmark link
- `POST /:id/rate` - Rate link (1-5 stars)
- `POST /:id/feedback` - Submit feedback
- `GET /:id/similar` - Get similar links
- `POST /tutor` - AI Tutor mode

### Learning Paths API (`/api/learning-paths`)
- `GET /` - Get all learning paths with filtering
- `POST /` - Create new learning path
- `GET /:id` - Get learning path details
- `PUT /:id` - Update learning path
- `DELETE /:id` - Delete learning path
- `POST /:id/add-link` - Add link to path
- `POST /:id/remove-link` - Remove link from path
- `POST /:id/complete-link` - Mark link as completed
- `GET /:id/progress` - Get path progress

### Content API (`/api/content`)
- `GET /` - Get approved content
- `POST /` - Upload new content (students)
- `GET /my-submissions` - Get user's content submissions
- `GET /pending` - Get pending content (admin)
- `POST /:id/approve` - Approve content (admin)
- `POST /:id/reject` - Reject content (admin)

### Tests API (`/api/tests`)
- `GET /` - Get approved tests
- `POST /` - Create new test (students)
- `GET /my-submissions` - Get user's test submissions
- `GET /pending` - Get pending tests (admin)
- `POST /:id/approve` - Approve test (admin)
- `POST /:id/reject` - Reject test (admin)
- `GET /:id` - Get specific test
- `POST /:id/attempt` - Submit test attempt

### AI Services (`/api/ai-evaluator`)
- `POST /analyze-link` - Comprehensive link analysis
- `POST /validate-link` - Link validation and safety checks
- `POST /personalized-recommendations` - Generate recommendations
- `POST /tutor-mode` - AI Tutor interactions
- `POST /semantic-search` - Semantic search with embeddings

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Vibrant, accessible color scheme
- **Typography**: Inter font family for readability
- **Animations**: Smooth transitions and micro-interactions
- **Glassmorphism**: Modern glass-effect components
- **Responsive Design**: Mobile-first approach

### Interactive Elements
- **Floating AI Tutor**: Always-available learning assistant
- **Smart Search**: AI-powered semantic search
- **Personalized Feed**: Tailored content recommendations
- **Progress Tracking**: Visual learning progress indicators
- **Gamification**: Badges, streaks, and achievements

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Secure cross-origin requests
- **Helmet Security**: Security headers implementation
- **Safe Browsing**: Real-time Google Safe Browsing API integration
- **Virus Scanning**: Comprehensive VirusTotal API integration

## 📈 Performance Optimizations

- **Redis Caching**: Comprehensive caching system for API responses, user sessions, and frequently accessed data
- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **API Response Caching**: Intelligent caching of links, recommendations, and trending content
- **Image Optimization**: Compressed and optimized assets
- **Code Splitting**: Lazy loading for better performance
- **CDN Ready**: Static asset optimization
- **Pagination**: Efficient data loading
- **Background Processing**: Async task processing

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                    # Run tests
npm run test:coverage      # Coverage report
npm run test:watch         # Watch mode
```

### Backend Testing
```bash
cd backend
npm test                   # Run tests
npm run test:coverage     # Coverage report
```

### AI Service Testing
```bash
cd ai-evaluator
python -m pytest          # Run tests
python -m pytest --cov   # Coverage report
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb://your-mongo-host:27017/coursehive
export JWT_SECRET=your-production-jwt-secret
export OPENAI_API_KEY=your-openai-api-key
```

2. **Docker Deployment**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

3. **Manual Deployment**
```bash
# Backend
cd backend
npm install --production
npm run build
npm start

# Frontend
cd frontend
npm install --production
npm run build
# Serve build/ directory with nginx or similar
```

### Monitoring and Logging

- **Application Logs**: Structured logging with Winston
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Response time tracking
- **Health Checks**: Service health monitoring
- **Metrics Collection**: Usage analytics and metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow semantic versioning
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- MongoDB for database services
- React team for the frontend framework
- Node.js community for backend tools
- All contributors and users
##Authors

-Venu Enugula (AI Engineer and Python Developer)
-Shriya Vemula (Full stack Developer)

---

**CourseHive** - Empowering learners with AI-driven educational experiences 🚀

# CourseHive - AI-Powered Learning Resource Aggregator

A full-stack web application that aggregates and recommends learning resources from across the web, powered by OpenAI for intelligent categorization and personalized recommendations.

## 🚀 Features

### Core Functionality
- **Link Aggregation**: Scrapes and stores metadata from learning resources (no full content download)
- **AI-Powered Categorization**: Uses OpenAI GPT models to automatically categorize resources by subject, topic, difficulty, and tags
- **Personalized Recommendations**: Smart suggestions based on user interaction history
- **Advanced Search & Filtering**: Search by title, description, tags, subject, topic, and difficulty
- **User Interaction Tracking**: Click tracking, save functionality, and rating system
- **Background Link Validation**: Automated job to validate links and update metrics

### Technical Features
- **Modern UI**: Beautiful, responsive design with gradient backgrounds and glassmorphism effects
- **Real-time Updates**: Live search and filtering with React Query
- **Authentication**: JWT-based user authentication with role-based access
- **Database**: MongoDB with optimized schemas and indexing
- **API**: RESTful API with comprehensive error handling
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Properly configured for frontend-backend communication

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Models**: User, Content, Test, Link, Subject, Topic, UserHistory, Analytics, AIFeedback
- **Routes**: Authentication, Content Management, Link Management, Analytics, Admin
- **Services**: OpenAI integration for content categorization
- **Jobs**: Background link validation and metrics updates
- **Middleware**: Authentication, validation, rate limiting, CORS

### Frontend (React.js)
- **Pages**: Home, Dashboard, Links, Recommendations, Content, Tests, Admin
- **Components**: Reusable UI components with modern design
- **Context**: Authentication and state management
- **Styling**: TailwindCSS with custom gradients and animations
- **Icons**: Lucide React for consistent iconography

### Scraper (Python)
- **Web Scraping**: BeautifulSoup for metadata extraction
- **AI Integration**: OpenAI API for content categorization
- **Batch Processing**: Handles multiple URLs efficiently
- **Error Handling**: Robust error handling and retry logic

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB
- OpenAI API Key

### Backend Setup
```bash
cd backend
npm install
cp config.env.example config.env
# Edit config.env with your settings
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Scraper Setup
```bash
cd scraper
pip install -r requirements.txt
python3 link_scraper.py --help
```

## 🔧 Configuration

### Environment Variables
```env
# Backend
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/coursehive
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Frontend
REACT_APP_API_URL=http://localhost:5001
```

### OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to `backend/config.env`
3. The system will automatically use it for content categorization

## 🎯 Usage

### For Users
1. **Register/Login**: Create an account or login
2. **Browse Resources**: Explore the curated learning resources
3. **Search & Filter**: Use advanced search and filtering options
4. **Get Recommendations**: View personalized suggestions
5. **Interact**: Click, save, and rate resources

### For Administrators
1. **Content Management**: Approve/reject user-submitted content
2. **User Management**: Manage user accounts and roles
3. **Analytics**: View system usage and performance metrics
4. **Link Validation**: Trigger background validation jobs

### For Developers
1. **API Documentation**: All endpoints are documented in the code
2. **Database Schema**: Well-structured MongoDB collections
3. **Extensible Design**: Easy to add new features and integrations

## 📊 Database Schema

### Core Collections
- **Users**: User accounts and profiles
- **Links**: Learning resource metadata
- **Subjects**: Subject categories
- **Topics**: Topic categories within subjects
- **UserHistory**: User interaction tracking
- **Analytics**: Usage statistics and insights

### Key Features
- **Indexing**: Optimized for fast queries
- **Relationships**: Proper foreign key relationships
- **Validation**: Data validation at schema level
- **Timestamps**: Automatic creation and update tracking

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Links
- `GET /api/links` - Get learning resources
- `POST /api/links` - Add new resource
- `GET /api/links/subjects` - Get all subjects
- `GET /api/links/topics` - Get topics by subject
- `POST /api/links/:id/click` - Track click
- `GET /api/links/recommendations/:userId` - Get recommendations

### Content Management
- `GET /api/content` - Get content
- `POST /api/content` - Upload content
- `GET /api/content/pending` - Get pending content (admin)
- `POST /api/content/:id/approve` - Approve content (admin)

## 🎨 UI/UX Features

### Design Principles
- **Modern Aesthetics**: Gradient backgrounds, glassmorphism effects
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper contrast and keyboard navigation
- **Performance**: Optimized loading and smooth animations

### Key Components
- **LinkCard**: Beautiful resource cards with metadata
- **SearchBar**: Advanced search with real-time suggestions
- **FilterPanel**: Multi-criteria filtering interface
- **RecommendationEngine**: Personalized content suggestions
- **AdminDashboard**: Comprehensive admin interface

## 🚀 Deployment

### Production Setup
1. **Environment**: Set production environment variables
2. **Database**: Use MongoDB Atlas or self-hosted MongoDB
3. **Frontend**: Build and serve static files
4. **Backend**: Use PM2 or similar process manager
5. **Scraper**: Set up cron jobs for regular scraping

### Docker Support
- `docker-compose.yml` for easy deployment
- Individual Dockerfiles for each service
- Environment variable configuration

## 🔧 Development

### Adding New Features
1. **Backend**: Add routes, models, and services
2. **Frontend**: Create components and pages
3. **Database**: Update schemas and migrations
4. **Testing**: Add unit and integration tests

### Code Quality
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety (optional)
- **Testing**: Jest and React Testing Library

## 📈 Performance

### Optimizations
- **Database Indexing**: Optimized queries
- **Caching**: React Query for data caching
- **Lazy Loading**: Component and route lazy loading
- **Image Optimization**: Optimized images and icons
- **Bundle Splitting**: Code splitting for faster loading

### Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage pattern tracking
- **Health Checks**: System health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI**: For AI-powered content categorization
- **React**: For the frontend framework
- **Node.js**: For the backend runtime
- **MongoDB**: For the database
- **TailwindCSS**: For the styling framework
- **Lucide**: For the beautiful icons

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**CourseHive** - Empowering learners with AI-driven resource discovery and personalized recommendations.
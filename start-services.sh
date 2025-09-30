#!/bin/bash

# CourseHive Enhanced Services Startup Script
echo "🐝 Starting CourseHive Enhanced Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✓ $service_name is ready!${NC}"
            return 0
        fi
        echo -e "${BLUE}Attempt $attempt/$max_attempts - $service_name not ready yet${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}✗ $service_name failed to start within expected time${NC}"
    return 1
}

# Check if required services are installed
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.8+${NC}"
    exit 1
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}MongoDB not found. Please ensure MongoDB is installed and running${NC}"
fi

# Check Redis
if ! command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}Redis not found. Please ensure Redis is installed and running${NC}"
fi

echo -e "${GREEN}✓ Prerequisites check completed${NC}"

# Create logs directory
mkdir -p logs

# Start MongoDB if not running
if ! check_port 27017; then
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    mongod --dbpath ./data/db --logpath ./logs/mongodb.log --fork
    sleep 3
fi

# Start Redis if not running
if ! check_port 6379; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    redis-server --daemonize yes --logfile ./logs/redis.log
    sleep 2
fi

# Start AI Evaluator Service
echo -e "${BLUE}Starting AI Evaluator Service...${NC}"
cd ai-evaluator

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

# Install requirements
echo -e "${YELLOW}Installing AI service dependencies...${NC}"
pip install -r requirements.txt > ../logs/ai-install.log 2>&1

# Start AI service
echo -e "${BLUE}Starting AI Evaluator on port 5002...${NC}"
python main.py > ../logs/ai-evaluator.log 2>&1 &
AI_PID=$!
echo $AI_PID > ../logs/ai-evaluator.pid

cd ..

# Wait for AI service
wait_for_service "AI Evaluator" 5002

# Start Backend Service
echo -e "${BLUE}Starting Backend Service...${NC}"
cd backend

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install > ../logs/backend-install.log 2>&1
fi

# Start backend service
echo -e "${BLUE}Starting Backend on port 5001...${NC}"
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid

cd ..

# Wait for backend service
wait_for_service "Backend" 5001

# Start Frontend Service
echo -e "${BLUE}Starting Frontend Service...${NC}"
cd frontend

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install > ../logs/frontend-install.log 2>&1
fi

# Start frontend service
echo -e "${BLUE}Starting Frontend on port 3000...${NC}"
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

cd ..

# Wait for frontend service
wait_for_service "Frontend" 3000

# Start Web Scraper Service (optional)
echo -e "${BLUE}Starting Web Scraper Service...${NC}"
cd scraper

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment for scraper...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

# Install requirements
echo -e "${YELLOW}Installing scraper dependencies...${NC}"
pip install -r requirements.txt > ../logs/scraper-install.log 2>&1

# Start scraper service (as a background task)
echo -e "${BLUE}Starting Web Scraper on port 5003...${NC}"
python enhanced_scraper.py > ../logs/scraper.log 2>&1 &
SCRAPER_PID=$!
echo $SCRAPER_PID > ../logs/scraper.pid

cd ..

# Display service status
echo -e "\n${GREEN}🎉 CourseHive Enhanced Services Started Successfully!${NC}"
echo -e "\n${BLUE}Service Status:${NC}"
echo -e "${GREEN}✓ Frontend:     http://localhost:3000${NC}"
echo -e "${GREEN}✓ Backend:      http://localhost:5001${NC}"
echo -e "${GREEN}✓ AI Evaluator: http://localhost:5002${NC}"
echo -e "${GREEN}✓ Web Scraper:  http://localhost:5003${NC}"
echo -e "${GREEN}✓ MongoDB:     mongodb://localhost:27017${NC}"
echo -e "${GREEN}✓ Redis:       redis://localhost:6379${NC}"

echo -e "\n${BLUE}Process IDs:${NC}"
echo -e "Frontend PID: $FRONTEND_PID"
echo -e "Backend PID:  $BACKEND_PID"
echo -e "AI Evaluator PID: $AI_PID"
echo -e "Scraper PID:  $SCRAPER_PID"

echo -e "\n${BLUE}Log Files:${NC}"
echo -e "Frontend:     ./logs/frontend.log"
echo -e "Backend:      ./logs/backend.log"
echo -e "AI Evaluator: ./logs/ai-evaluator.log"
echo -e "Scraper:      ./logs/scraper.log"
echo -e "MongoDB:      ./logs/mongodb.log"
echo -e "Redis:        ./logs/redis.log"

echo -e "\n${YELLOW}To stop all services, run: ./stop-services.sh${NC}"
echo -e "${YELLOW}To view logs, run: tail -f logs/[service-name].log${NC}"

# Create a simple status check script
cat > check-status.sh << 'EOF'
#!/bin/bash
echo "CourseHive Service Status:"
echo "=========================="

services=("Frontend:3000" "Backend:5001" "AI Evaluator:5002" "Scraper:5003" "MongoDB:27017" "Redis:6379")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✓ $name (port $port) - Running"
    else
        echo "✗ $name (port $port) - Not running"
    fi
done
EOF

chmod +x check-status.sh

echo -e "\n${GREEN}Status check script created: ./check-status.sh${NC}"

# Keep script running and show real-time logs
echo -e "\n${BLUE}Press Ctrl+C to stop all services${NC}"
echo -e "${BLUE}Or run './stop-services.sh' in another terminal${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    
    # Kill all services
    if [ -f logs/frontend.pid ]; then
        kill $(cat logs/frontend.pid) 2>/dev/null
        rm logs/frontend.pid
    fi
    
    if [ -f logs/backend.pid ]; then
        kill $(cat logs/backend.pid) 2>/dev/null
        rm logs/backend.pid
    fi
    
    if [ -f logs/ai-evaluator.pid ]; then
        kill $(cat logs/ai-evaluator.pid) 2>/dev/null
        rm logs/ai-evaluator.pid
    fi
    
    if [ -f logs/scraper.pid ]; then
        kill $(cat logs/scraper.pid) 2>/dev/null
        rm logs/scraper.pid
    fi
    
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user interrupt
while true; do
    sleep 1
done

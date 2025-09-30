#!/bin/bash

# CourseHive Enhanced Services Stop Script
echo "🛑 Stopping CourseHive Enhanced Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill "$pid"
            sleep 2
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${RED}Force stopping $service_name...${NC}"
                kill -9 "$pid"
            fi
            
            echo -e "${GREEN}✓ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}$service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}No PID file found for $service_name${NC}"
    fi
}

# Stop services in reverse order
echo -e "${BLUE}Stopping services...${NC}"

# Stop Web Scraper
stop_service "Web Scraper" "logs/scraper.pid"

# Stop Frontend
stop_service "Frontend" "logs/frontend.pid"

# Stop Backend
stop_service "Backend" "logs/backend.pid"

# Stop AI Evaluator
stop_service "AI Evaluator" "logs/ai-evaluator.pid"

# Kill any remaining processes on our ports
echo -e "${BLUE}Cleaning up any remaining processes...${NC}"

ports=(3000 5001 5002 5003)
for port in "${ports[@]}"; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 "$pid" 2>/dev/null
    fi
done

# Optional: Stop MongoDB and Redis (uncomment if needed)
# echo -e "${BLUE}Stopping MongoDB and Redis...${NC}"
# 
# # Stop MongoDB
# mongod_pid=$(pgrep mongod)
# if [ ! -z "$mongod_pid" ]; then
#     echo -e "${YELLOW}Stopping MongoDB (PID: $mongod_pid)...${NC}"
#     kill "$mongod_pid"
#     echo -e "${GREEN}✓ MongoDB stopped${NC}"
# fi
# 
# # Stop Redis
# redis_pid=$(pgrep redis-server)
# if [ ! -z "$redis_pid" ]; then
#     echo -e "${YELLOW}Stopping Redis (PID: $redis_pid)...${NC}"
#     kill "$redis_pid"
#     echo -e "${GREEN}✓ Redis stopped${NC}"
# fi

echo -e "\n${GREEN}🎉 All CourseHive services stopped successfully!${NC}"

# Show final status
echo -e "\n${BLUE}Final Status Check:${NC}"
services=("Frontend:3000" "Backend:5001" "AI Evaluator:5002" "Scraper:5003")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}✗ $name (port $port) - Still running${NC}"
    else
        echo -e "${GREEN}✓ $name (port $port) - Stopped${NC}"
    fi
done

echo -e "\n${BLUE}To start services again, run: ./start-services.sh${NC}"


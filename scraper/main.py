import requests
from bs4 import BeautifulSoup
import json
import time
import os
from datetime import datetime
from typing import List, Dict, Any
import pymongo
from urllib.parse import urljoin, urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CourseHiveScraper:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # MongoDB connection
        self.mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
        self.db = self.mongo_client["coursehive"]
        self.content_collection = self.db["content"]
    
    def scrape_educational_sites(self):
        """
        Scrape content from various educational websites
        """
        sites = [
            {
                "name": "Khan Academy",
                "base_url": "https://www.khanacademy.org",
                "subjects": ["math", "science", "computing", "economics"],
                "scraper": self.scrape_khan_academy
            },
            {
                "name": "Coursera",
                "base_url": "https://www.coursera.org",
                "subjects": ["computer-science", "data-science", "business"],
                "scraper": self.scrape_coursera
            },
            {
                "name": "MIT OpenCourseWare",
                "base_url": "https://ocw.mit.edu",
                "subjects": ["mathematics", "physics", "computer-science"],
                "scraper": self.scrape_mit_ocw
            }
        ]
        
        for site in sites:
            try:
                logger.info(f"Scraping {site['name']}...")
                content = site["scraper"](site)
                self.save_content(content)
                logger.info(f"Successfully scraped {len(content)} items from {site['name']}")
            except Exception as e:
                logger.error(f"Error scraping {site['name']}: {str(e)}")
    
    def scrape_khan_academy(self, site: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape Khan Academy content
        """
        content = []
        
        for subject in site["subjects"]:
            try:
                url = f"{site['base_url']}/subject/{subject}"
                response = self.session.get(url)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find course links
                course_links = soup.find_all('a', href=True)
                
                for link in course_links[:10]:  # Limit to 10 courses per subject
                    href = link.get('href')
                    if href and '/courses/' in href:
                        course_url = urljoin(site['base_url'], href)
                        
                        try:
                            course_content = self.scrape_khan_course(course_url, subject)
                            content.extend(course_content)
                        except Exception as e:
                            logger.error(f"Error scraping course {course_url}: {str(e)}")
                            
            except Exception as e:
                logger.error(f"Error scraping Khan Academy subject {subject}: {str(e)}")
        
        return content
    
    def scrape_khan_course(self, course_url: str, subject: str) -> List[Dict[str, Any]]:
        """
        Scrape individual Khan Academy course
        """
        content = []
        
        try:
            response = self.session.get(course_url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract course title
            title_elem = soup.find('h1') or soup.find('title')
            title = title_elem.get_text().strip() if title_elem else "Khan Academy Course"
            
            # Find video links
            video_links = soup.find_all('a', href=True)
            
            for link in video_links[:5]:  # Limit to 5 videos per course
                href = link.get('href')
                if href and '/v/' in href:
                    video_url = urljoin(course_url, href)
                    
                    content.append({
                        "title": f"{title} - {link.get_text().strip()}",
                        "subject": subject,
                        "type": "video",
                        "url": video_url,
                        "description": f"Khan Academy video from {subject} course",
                        "tags": [subject, "khan-academy", "video"],
                        "difficulty": "intermediate",
                        "metadata": {
                            "source": "Khan Academy",
                            "author": "Khan Academy",
                            "publishDate": datetime.now(),
                            "duration": None
                        },
                        "status": "pending"
                    })
            
        except Exception as e:
            logger.error(f"Error scraping Khan Academy course {course_url}: {str(e)}")
        
        return content
    
    def scrape_coursera(self, site: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape Coursera content
        """
        content = []
        
        for subject in site["subjects"]:
            try:
                url = f"{site['base_url']}/browse/{subject}"
                response = self.session.get(url)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find course cards
                course_cards = soup.find_all('div', class_='rc-Card')
                
                for card in course_cards[:10]:  # Limit to 10 courses per subject
                    try:
                        title_elem = card.find('h2') or card.find('h3')
                        title = title_elem.get_text().strip() if title_elem else "Coursera Course"
                        
                        link_elem = card.find('a', href=True)
                        if link_elem:
                            course_url = urljoin(site['base_url'], link_elem.get('href'))
                            
                            content.append({
                                "title": title,
                                "subject": subject,
                                "type": "course",
                                "url": course_url,
                                "description": f"Coursera course in {subject}",
                                "tags": [subject, "coursera", "course"],
                                "difficulty": "intermediate",
                                "metadata": {
                                    "source": "Coursera",
                                    "author": "Various Universities",
                                    "publishDate": datetime.now(),
                                    "duration": None
                                },
                                "status": "pending"
                            })
                    except Exception as e:
                        logger.error(f"Error processing Coursera course card: {str(e)}")
                        
            except Exception as e:
                logger.error(f"Error scraping Coursera subject {subject}: {str(e)}")
        
        return content
    
    def scrape_mit_ocw(self, site: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape MIT OpenCourseWare content
        """
        content = []
        
        for subject in site["subjects"]:
            try:
                url = f"{site['base_url']}/search?d={subject}"
                response = self.session.get(url)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find course links
                course_links = soup.find_all('a', href=True)
                
                for link in course_links[:10]:  # Limit to 10 courses per subject
                    href = link.get('href')
                    if href and '/courses/' in href:
                        course_url = urljoin(site['base_url'], href)
                        
                        try:
                            course_content = self.scrape_mit_course(course_url, subject)
                            content.extend(course_content)
                        except Exception as e:
                            logger.error(f"Error scraping MIT course {course_url}: {str(e)}")
                            
            except Exception as e:
                logger.error(f"Error scraping MIT OCW subject {subject}: {str(e)}")
        
        return content
    
    def scrape_mit_course(self, course_url: str, subject: str) -> List[Dict[str, Any]]:
        """
        Scrape individual MIT course
        """
        content = []
        
        try:
            response = self.session.get(course_url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract course title
            title_elem = soup.find('h1') or soup.find('title')
            title = title_elem.get_text().strip() if title_elem else "MIT Course"
            
            # Find lecture notes and assignments
            links = soup.find_all('a', href=True)
            
            for link in links[:5]:  # Limit to 5 resources per course
                href = link.get('href')
                text = link.get_text().strip()
                
                if href and text and any(keyword in text.lower() for keyword in ['lecture', 'notes', 'assignment', 'exam']):
                    resource_url = urljoin(course_url, href)
                    
                    # Determine resource type
                    resource_type = "notes"
                    if "assignment" in text.lower():
                        resource_type = "question_bank"
                    elif "exam" in text.lower():
                        resource_type = "previous_paper"
                    
                    content.append({
                        "title": f"{title} - {text}",
                        "subject": subject,
                        "type": resource_type,
                        "url": resource_url,
                        "description": f"MIT OpenCourseWare {resource_type} from {subject}",
                        "tags": [subject, "mit", "opencourseware", resource_type],
                        "difficulty": "advanced",
                        "metadata": {
                            "source": "MIT OpenCourseWare",
                            "author": "MIT",
                            "publishDate": datetime.now(),
                            "fileSize": None
                        },
                        "status": "pending"
                    })
            
        except Exception as e:
            logger.error(f"Error scraping MIT course {course_url}: {str(e)}")
        
        return content
    
    def save_content(self, content: List[Dict[str, Any]]):
        """
        Save scraped content to database
        """
        try:
            # Add uploadedBy field (system user)
            for item in content:
                item["uploadedBy"] = "000000000000000000000000"  # System user ID
                item["createdAt"] = datetime.now()
                item["updatedAt"] = datetime.now()
            
            # Insert into MongoDB
            if content:
                result = self.content_collection.insert_many(content)
                logger.info(f"Inserted {len(result.inserted_ids)} content items")
                
        except Exception as e:
            logger.error(f"Error saving content: {str(e)}")
    
    def scrape_competitive_exam_sites(self):
        """
        Scrape content from competitive exam preparation sites
        """
        exam_sites = [
            {
                "name": "Previous Year Papers",
                "base_url": "https://example-exam-site.com",
                "exams": ["JEE", "NEET", "GATE", "UPSC"],
                "scraper": self.scrape_exam_papers
            }
        ]
        
        for site in exam_sites:
            try:
                logger.info(f"Scraping {site['name']}...")
                content = site["scraper"](site)
                self.save_content(content)
                logger.info(f"Successfully scraped {len(content)} items from {site['name']}")
            except Exception as e:
                logger.error(f"Error scraping {site['name']}: {str(e)}")
    
    def scrape_exam_papers(self, site: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape previous year exam papers
        """
        content = []
        
        for exam in site["exams"]:
            # Mock data for demonstration
            content.append({
                "title": f"{exam} Previous Year Paper 2023",
                "subject": exam.lower(),
                "type": "previous_paper",
                "url": f"https://example.com/{exam.lower()}-2023.pdf",
                "description": f"Previous year {exam} question paper with solutions",
                "tags": [exam.lower(), "previous-paper", "exam", "2023"],
                "difficulty": "advanced",
                "metadata": {
                    "source": site["name"],
                    "author": "Exam Board",
                    "publishDate": datetime.now(),
                    "fileSize": 1024000  # 1MB
                },
                "status": "pending"
            })
        
        return content

def main():
    """
    Main function to run the scraper
    """
    scraper = CourseHiveScraper()
    
    logger.info("Starting CourseHive content scraper...")
    
    # Scrape educational sites
    scraper.scrape_educational_sites()
    
    # Scrape competitive exam sites
    scraper.scrape_competitive_exam_sites()
    
    logger.info("Scraping completed!")

if __name__ == "__main__":
    main()

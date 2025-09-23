#!/usr/bin/env python3
"""
CourseHive Link Scraper
Scrapes learning resources and extracts metadata without downloading full content.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
from urllib.parse import urljoin, urlparse
from datetime import datetime
import logging
from typing import Dict, List, Optional
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LinkScraper:
    def __init__(self, backend_url: str = "http://localhost:5001", auth_token: str = None):
        self.backend_url = backend_url
        self.auth_token = auth_token
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        if auth_token:
            self.session.headers.update({
                'Authorization': f'Bearer {auth_token}'
            })
        
        # Common learning resource patterns
        self.learning_patterns = [
            r'(tutorial|guide|course|lesson|learn|study|education|training)',
            r'(programming|coding|development|software|tech)',
            r'(math|mathematics|science|physics|chemistry|biology)',
            r'(history|literature|art|music|language)',
            r'(business|economics|finance|marketing)'
        ]

    def extract_metadata(self, url: str) -> Optional[Dict]:
        """Extract metadata from a URL without downloading full content."""
        try:
            logger.info(f"Scraping: {url}")
            
            # Make request with timeout
            response = self.session.get(url, timeout=10, allow_redirects=True)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title = self._extract_title(soup, url)
            if not title:
                logger.warning(f"No title found for {url}")
                return None
            
            # Extract description
            description = self._extract_description(soup)
            
            # Extract other metadata
            metadata = {
                'title': title,
                'description': description,
                'url': url,
                'sourceSite': urlparse(url).netloc,
                'imageUrl': self._extract_image(soup),
                'author': self._extract_author(soup),
                'publishDate': self._extract_publish_date(soup),
                'estimatedReadTime': self._estimate_read_time(soup),
                'language': self._detect_language(soup)
            }
            
            # Check if it's a learning resource
            if not self._is_learning_resource(metadata):
                logger.info(f"Not a learning resource: {url}")
                return None
            
            return metadata
            
        except requests.RequestException as e:
            logger.error(f"Request failed for {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error processing {url}: {e}")
            return None

    def _extract_title(self, soup: BeautifulSoup, url: str) -> Optional[str]:
        """Extract title from various sources."""
        # Try Open Graph title first
        og_title = soup.find('meta', {'property': 'og:title'})
        if og_title and og_title.get('content'):
            return og_title['content'].strip()
        
        # Try Twitter title
        twitter_title = soup.find('meta', {'name': 'twitter:title'})
        if twitter_title and twitter_title.get('content'):
            return twitter_title['content'].strip()
        
        # Try HTML title
        title_tag = soup.find('title')
        if title_tag and title_tag.get_text():
            return title_tag.get_text().strip()
        
        # Try h1 tag
        h1_tag = soup.find('h1')
        if h1_tag and h1_tag.get_text():
            return h1_tag.get_text().strip()
        
        return None

    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract description from various sources."""
        # Try Open Graph description first
        og_desc = soup.find('meta', {'property': 'og:description'})
        if og_desc and og_desc.get('content'):
            return og_desc['content'].strip()
        
        # Try Twitter description
        twitter_desc = soup.find('meta', {'name': 'twitter:description'})
        if twitter_desc and twitter_desc.get('content'):
            return twitter_desc['content'].strip()
        
        # Try meta description
        meta_desc = soup.find('meta', {'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        
        # Try to find first paragraph
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text().strip()
            if len(text) > 50:  # Minimum description length
                return text[:500]  # Limit description length
        
        return ""

    def _extract_image(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract main image URL."""
        # Try Open Graph image
        og_image = soup.find('meta', {'property': 'og:image'})
        if og_image and og_image.get('content'):
            return og_image['content']
        
        # Try Twitter image
        twitter_image = soup.find('meta', {'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            return twitter_image['content']
        
        # Try to find first img tag
        img_tag = soup.find('img')
        if img_tag and img_tag.get('src'):
            return img_tag['src']
        
        return None

    def _extract_author(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract author information."""
        # Try various author meta tags
        author_selectors = [
            {'name': 'author'},
            {'property': 'article:author'},
            {'property': 'og:article:author'}
        ]
        
        for attrs in author_selectors:
            element = soup.find('meta', attrs)
            if element and element.get('content'):
                return element['content'].strip()
        
        # Try rel="author"
        author_link = soup.find('a', {'rel': 'author'})
        if author_link and author_link.get_text():
            return author_link.get_text().strip()
        
        return None

    def _extract_publish_date(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract publish date."""
        # Try various date meta tags
        date_attrs = [
            {'property': 'article:published_time'},
            {'property': 'og:article:published_time'},
            {'name': 'date'},
            {'name': 'DC.date.issued'}
        ]
        
        for attrs in date_attrs:
            element = soup.find('meta', attrs)
            if element and element.get('content'):
                return element['content'].strip()
        
        # Try time tag with datetime
        time_tag = soup.find('time', {'datetime': True})
        if time_tag and time_tag.get('datetime'):
            return time_tag['datetime'].strip()
        
        return None

    def _estimate_read_time(self, soup: BeautifulSoup) -> int:
        """Estimate reading time in minutes."""
        # Get all text content
        text_content = soup.get_text()
        word_count = len(text_content.split())
        
        # Average reading speed: 200 words per minute
        read_time = max(1, word_count // 200)
        return min(read_time, 60)  # Cap at 60 minutes

    def _detect_language(self, soup: BeautifulSoup) -> str:
        """Detect page language."""
        # Try HTML lang attribute
        html_tag = soup.find('html')
        if html_tag and html_tag.get('lang'):
            return html_tag['lang'].split('-')[0]  # Get primary language
        
        # Try meta language
        lang_meta = soup.find('meta', {'http-equiv': 'Content-Language'})
        if lang_meta and lang_meta.get('content'):
            return lang_meta['content'].split('-')[0]
        
        return 'en'  # Default to English

    def _is_learning_resource(self, metadata: Dict) -> bool:
        """Check if the resource appears to be educational."""
        text_to_check = f"{metadata['title']} {metadata['description']}".lower()
        
        # Check against learning patterns
        for pattern in self.learning_patterns:
            if re.search(pattern, text_to_check):
                return True
        
        # Check for educational keywords
        educational_keywords = [
            'learn', 'study', 'education', 'tutorial', 'guide', 'course',
            'lesson', 'training', 'academic', 'university', 'school',
            'knowledge', 'skill', 'development', 'programming', 'coding'
        ]
        
        for keyword in educational_keywords:
            if keyword in text_to_check:
                return True
        
        return False

    def scrape_urls(self, urls: List[str]) -> List[Dict]:
        """Scrape multiple URLs and return metadata."""
        results = []
        
        for url in urls:
            metadata = self.extract_metadata(url)
            if metadata:
                results.append(metadata)
            
            # Be respectful - add delay between requests
            time.sleep(1)
        
        return results

    def send_to_backend(self, metadata: Dict) -> bool:
        """Send scraped metadata to backend API."""
        try:
            response = self.session.post(
                f"{self.backend_url}/api/links",
                json=metadata,
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            logger.info(f"Successfully sent to backend: {metadata['title']}")
            return True
        except requests.RequestException as e:
            logger.error(f"Failed to send to backend: {e}")
            return False

    def scrape_and_send(self, urls: List[str]) -> Dict:
        """Scrape URLs and send to backend."""
        results = {
            'total': len(urls),
            'scraped': 0,
            'sent': 0,
            'failed': 0
        }
        
        for url in urls:
            try:
                metadata = self.extract_metadata(url)
                if metadata:
                    results['scraped'] += 1
                    
                    if self.send_to_backend(metadata):
                        results['sent'] += 1
                    else:
                        results['failed'] += 1
                else:
                    results['failed'] += 1
            except Exception as e:
                logger.error(f"Error processing {url}: {e}")
                results['failed'] += 1
        
        return results

def main():
    parser = argparse.ArgumentParser(description='CourseHive Link Scraper')
    parser.add_argument('--urls', nargs='+', help='URLs to scrape')
    parser.add_argument('--file', help='File containing URLs (one per line)')
    parser.add_argument('--backend', default='http://localhost:5001', help='Backend API URL')
    parser.add_argument('--token', help='Authentication token')
    parser.add_argument('--token-file', default='auth_token.txt', help='File containing auth token')
    
    args = parser.parse_args()
    
    # Get auth token
    auth_token = args.token
    if not auth_token and os.path.exists(args.token_file):
        with open(args.token_file, 'r') as f:
            auth_token = f.read().strip()
    
    if not auth_token:
        print("No authentication token provided. Use --token or ensure auth_token.txt exists.")
        return
    
    # Get URLs from arguments or file
    urls = []
    if args.urls:
        urls.extend(args.urls)
    if args.file:
        with open(args.file, 'r') as f:
            urls.extend([line.strip() for line in f if line.strip()])
    
    if not urls:
        print("No URLs provided. Use --urls or --file to specify URLs to scrape.")
        return
    
    # Create scraper and run
    scraper = LinkScraper(args.backend, auth_token)
    results = scraper.scrape_and_send(urls)
    
    print(f"Scraping completed:")
    print(f"  Total URLs: {results['total']}")
    print(f"  Successfully scraped: {results['scraped']}")
    print(f"  Sent to backend: {results['sent']}")
    print(f"  Failed: {results['failed']}")

if __name__ == '__main__':
    main()

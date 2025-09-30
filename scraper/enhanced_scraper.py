import asyncio
import aiohttp
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urlunparse
import re
import json
import time
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any, Optional
import hashlib
from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ScrapedLink:
    url: str
    title: str
    description: str
    content: str
    source_domain: str
    content_type: str
    word_count: int
    image_count: int
    video_duration: Optional[int]
    publish_date: Optional[datetime]
    author: Optional[str]
    language: str
    meta_tags: Dict[str, str]
    headings: List[str]
    links: List[str]
    images: List[str]

class EnhancedScraper:
    def __init__(self):
        self.session = None
        self.rate_limit_delay = 1.0  # seconds between requests
        self.max_retries = 3
        self.timeout = 10
        self.user_agent = "CourseHive-Bot/1.0 (Educational Content Scraper)"
        self.scraped_urls = set()
        self.domain_quotas = {}
        self.max_links_per_domain = 100  # 10% of 1000 total links
        
    async def __aenter__(self):
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=2)
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={'User-Agent': self.user_agent}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_url(self, url: str) -> Optional[ScrapedLink]:
        """Scrape a single URL with comprehensive data extraction"""
        try:
            # Check domain quota
            domain = urlparse(url).netloc
            if self.domain_quotas.get(domain, 0) >= self.max_links_per_domain:
                logger.warning(f"Domain quota exceeded for {domain}")
                return None
            
            # Check if already scraped
            if url in self.scraped_urls:
                logger.info(f"URL already scraped: {url}")
                return None
            
            # Rate limiting
            await asyncio.sleep(self.rate_limit_delay)
            
            # Fetch content
            content = await self._fetch_content(url)
            if not content:
                return None
            
            # Parse content
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract data
            scraped_data = self._extract_data(soup, url)
            
            # Update quotas and tracking
            self.domain_quotas[domain] = self.domain_quotas.get(domain, 0) + 1
            self.scraped_urls.add(url)
            
            logger.info(f"Successfully scraped: {url}")
            return scraped_data
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return None
    
    async def _fetch_content(self, url: str) -> Optional[str]:
        """Fetch content from URL with retries and error handling"""
        for attempt in range(self.max_retries):
            try:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        content = await response.text()
                        # Basic content validation
                        if len(content) < 100:
                            logger.warning(f"Content too short for {url}")
                            return None
                        return content
                    elif response.status == 429:  # Rate limited
                        wait_time = 2 ** attempt
                        logger.warning(f"Rate limited, waiting {wait_time}s")
                        await asyncio.sleep(wait_time)
                    else:
                        logger.warning(f"HTTP {response.status} for {url}")
                        return None
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed for {url}: {str(e)}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
        
        return None
    
    def _extract_data(self, soup: BeautifulSoup, url: str) -> ScrapedLink:
        """Extract comprehensive data from parsed HTML"""
        domain = urlparse(url).netloc
        
        # Title extraction
        title = self._extract_title(soup)
        
        # Description extraction
        description = self._extract_description(soup)
        
        # Content extraction
        content = self._extract_main_content(soup)
        
        # Content type detection
        content_type = self._detect_content_type(soup, url)
        
        # Word count
        word_count = len(content.split())
        
        # Image count
        images = soup.find_all('img')
        image_count = len(images)
        
        # Video duration (if available)
        video_duration = self._extract_video_duration(soup)
        
        # Publish date
        publish_date = self._extract_publish_date(soup)
        
        # Author
        author = self._extract_author(soup)
        
        # Language detection
        language = self._detect_language(content)
        
        # Meta tags
        meta_tags = self._extract_meta_tags(soup)
        
        # Headings
        headings = self._extract_headings(soup)
        
        # Internal and external links
        links = self._extract_links(soup, url)
        
        # Image URLs
        image_urls = self._extract_image_urls(soup, url)
        
        return ScrapedLink(
            url=url,
            title=title,
            description=description,
            content=content,
            source_domain=domain,
            content_type=content_type,
            word_count=word_count,
            image_count=image_count,
            video_duration=video_duration,
            publish_date=publish_date,
            author=author,
            language=language,
            meta_tags=meta_tags,
            headings=headings,
            links=links,
            images=image_urls
        )
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract title with fallback options"""
        # Try different title sources
        title_selectors = [
            'title',
            'h1',
            'meta[property="og:title"]',
            'meta[name="twitter:title"]'
        ]
        
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                title = element.get('content') if element.name == 'meta' else element.get_text()
                if title and len(title.strip()) > 0:
                    return title.strip()[:200]  # Limit length
        
        return "Untitled"
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract description with fallback options"""
        # Try different description sources
        desc_selectors = [
            'meta[name="description"]',
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
            '.description',
            '.summary',
            '.excerpt'
        ]
        
        for selector in desc_selectors:
            element = soup.select_one(selector)
            if element:
                desc = element.get('content') if element.name == 'meta' else element.get_text()
                if desc and len(desc.strip()) > 0:
                    return desc.strip()[:500]  # Limit length
        
        # Fallback to first paragraph
        first_p = soup.find('p')
        if first_p:
            return first_p.get_text().strip()[:500]
        
        return ""
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main content, removing navigation and ads"""
        # Remove unwanted elements
        for element in soup(['nav', 'header', 'footer', 'aside', 'script', 'style', 'noscript']):
            element.decompose()
        
        # Try to find main content area
        content_selectors = [
            'main',
            'article',
            '.content',
            '.post-content',
            '.entry-content',
            '.article-content',
            '#content',
            '.main-content'
        ]
        
        main_content = None
        for selector in content_selectors:
            element = soup.select_one(selector)
            if element:
                main_content = element
                break
        
        if not main_content:
            # Fallback to body
            main_content = soup.find('body')
        
        if main_content:
            # Extract text content
            text_content = main_content.get_text()
            # Clean up whitespace
            text_content = re.sub(r'\s+', ' ', text_content).strip()
            return text_content[:5000]  # Limit content length
        
        return ""
    
    def _detect_content_type(self, soup: BeautifulSoup, url: str) -> str:
        """Detect content type based on URL and content"""
        url_lower = url.lower()
        content_lower = soup.get_text().lower()
        
        # Check for video indicators
        if any(indicator in url_lower for indicator in ['youtube.com', 'vimeo.com', 'video']):
            return 'video'
        
        # Check for PDF
        if url_lower.endswith('.pdf') or 'pdf' in content_lower:
            return 'pdf'
        
        # Check for interactive content
        if soup.find(['canvas', 'svg']) or 'interactive' in content_lower:
            return 'interactive'
        
        # Check for course content
        if any(indicator in content_lower for indicator in ['course', 'lesson', 'module', 'chapter']):
            return 'course'
        
        # Check for tutorial content
        if any(indicator in content_lower for indicator in ['tutorial', 'how to', 'step by step']):
            return 'tutorial'
        
        # Default to article
        return 'article'
    
    def _extract_video_duration(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract video duration if available"""
        # Look for video duration in meta tags
        duration_meta = soup.find('meta', {'property': 'video:duration'})
        if duration_meta:
            try:
                return int(duration_meta.get('content'))
            except ValueError:
                pass
        
        # Look for duration in video elements
        video_element = soup.find('video')
        if video_element and video_element.get('duration'):
            try:
                return int(video_element.get('duration'))
            except ValueError:
                pass
        
        return None
    
    def _extract_publish_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract publish date from various sources"""
        date_selectors = [
            'meta[property="article:published_time"]',
            'meta[name="date"]',
            'meta[name="pubdate"]',
            'time[datetime]',
            '.publish-date',
            '.date'
        ]
        
        for selector in date_selectors:
            element = soup.select_one(selector)
            if element:
                date_str = element.get('content') or element.get('datetime') or element.get_text()
                try:
                    # Try to parse various date formats
                    for fmt in ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%SZ']:
                        try:
                            return datetime.strptime(date_str[:19], fmt)
                        except ValueError:
                            continue
                except:
                    continue
        
        return None
    
    def _extract_author(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract author information"""
        author_selectors = [
            'meta[name="author"]',
            'meta[property="article:author"]',
            '.author',
            '.byline',
            '.writer'
        ]
        
        for selector in author_selectors:
            element = soup.select_one(selector)
            if element:
                author = element.get('content') if element.name == 'meta' else element.get_text()
                if author and len(author.strip()) > 0:
                    return author.strip()[:100]
        
        return None
    
    def _detect_language(self, content: str) -> str:
        """Simple language detection"""
        # Simple heuristic - could be enhanced with langdetect library
        if any(word in content.lower() for word in ['the', 'and', 'or', 'but', 'in', 'on', 'at']):
            return 'en'
        elif any(word in content.lower() for word in ['el', 'la', 'de', 'que', 'y', 'en', 'un']):
            return 'es'
        elif any(word in content.lower() for word in ['le', 'de', 'et', 'à', 'un', 'une', 'dans']):
            return 'fr'
        else:
            return 'en'  # Default to English
    
    def _extract_meta_tags(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract relevant meta tags"""
        meta_tags = {}
        
        # Common meta tags to extract
        meta_selectors = [
            'meta[name="keywords"]',
            'meta[name="robots"]',
            'meta[property="og:type"]',
            'meta[property="og:site_name"]',
            'meta[name="viewport"]'
        ]
        
        for selector in meta_selectors:
            element = soup.select_one(selector)
            if element:
                name = element.get('name') or element.get('property')
                content = element.get('content')
                if name and content:
                    meta_tags[name] = content
        
        return meta_tags
    
    def _extract_headings(self, soup: BeautifulSoup) -> List[str]:
        """Extract all headings"""
        headings = []
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            text = heading.get_text().strip()
            if text:
                headings.append(text)
        return headings[:10]  # Limit to first 10 headings
    
    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract all links from the page"""
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            # Convert relative URLs to absolute
            absolute_url = urljoin(base_url, href)
            # Filter out unwanted links
            if self._is_valid_link(absolute_url):
                links.append(absolute_url)
        return links[:50]  # Limit to first 50 links
    
    def _extract_image_urls(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract all image URLs from the page"""
        image_urls = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            # Convert relative URLs to absolute
            absolute_url = urljoin(base_url, src)
            image_urls.append(absolute_url)
        return image_urls[:20]  # Limit to first 20 images
    
    def _is_valid_link(self, url: str) -> bool:
        """Check if link is valid and educational"""
        # Filter out unwanted URLs
        unwanted_patterns = [
            r'javascript:',
            r'mailto:',
            r'tel:',
            r'#',
            r'\.(jpg|jpeg|png|gif|svg|css|js|pdf)$',
            r'(facebook|twitter|instagram|linkedin)\.com',
            r'ads?\.',
            r'advertisement'
        ]
        
        for pattern in unwanted_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                return False
        
        return True

async def scrape_multiple_urls(urls: List[str]) -> List[ScrapedLink]:
    """Scrape multiple URLs concurrently"""
    async with EnhancedScraper() as scraper:
        tasks = [scraper.scrape_url(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out None results and exceptions
        scraped_links = []
        for result in results:
            if isinstance(result, ScrapedLink):
                scraped_links.append(result)
            elif isinstance(result, Exception):
                logger.error(f"Scraping error: {str(result)}")
        
        return scraped_links

def save_scraped_data(scraped_links: List[ScrapedLink], filename: str = None):
    """Save scraped data to JSON file"""
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"scraped_data_{timestamp}.json"
    
    data = []
    for link in scraped_links:
        data.append({
            'url': link.url,
            'title': link.title,
            'description': link.description,
            'content': link.content,
            'source_domain': link.source_domain,
            'content_type': link.content_type,
            'word_count': link.word_count,
            'image_count': link.image_count,
            'video_duration': link.video_duration,
            'publish_date': link.publish_date.isoformat() if link.publish_date else None,
            'author': link.author,
            'language': link.language,
            'meta_tags': link.meta_tags,
            'headings': link.headings,
            'links': link.links,
            'images': link.images,
            'scraped_at': datetime.now().isoformat()
        })
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved {len(data)} scraped links to {filename}")
    return filename

if __name__ == "__main__":
    # Example usage
    sample_urls = [
        "https://example.com",
        "https://docs.python.org/3/tutorial/",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
    ]
    
    async def main():
        scraped_links = await scrape_multiple_urls(sample_urls)
        save_scraped_data(scraped_links)
        print(f"Scraped {len(scraped_links)} links successfully")
    
    asyncio.run(main())

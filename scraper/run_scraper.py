#!/usr/bin/env python3
"""
Script to run the enhanced scraper and store links in MongoDB
"""

import asyncio
import aiohttp
import requests
import json
import os
import sys
from datetime import datetime, timedelta
from enhanced_scraper import scrape_multiple_urls, ScrapedLink

# Add parent directory to path to import backend models
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Educational URLs to scrape - Comprehensive List
EDUCATIONAL_URLS = [
    # Programming & Computer Science
    "https://docs.python.org/3/tutorial/",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    "https://react.dev/learn",
    "https://nodejs.org/en/docs/",
    "https://docs.djangoproject.com/en/stable/intro/",
    "https://docs.python.org/3/library/",
    "https://docs.python.org/3/reference/",
    "https://developer.mozilla.org/en-US/docs/Web/HTML",
    "https://developer.mozilla.org/en-US/docs/Web/CSS",
    "https://docs.python.org/3/howto/",
    "https://docs.python.org/3/install/",
    "https://docs.python.org/3/using/",
    "https://docs.python.org/3/extending/",
    "https://docs.python.org/3/distributing/",
    "https://docs.python.org/3/whatsnew/",
    
    # JavaScript & Web Development
    "https://developer.mozilla.org/en-US/docs/Web/API",
    "https://developer.mozilla.org/en-US/docs/Web/Events",
    "https://developer.mozilla.org/en-US/docs/Web/Guide",
    "https://developer.mozilla.org/en-US/docs/Web/Tutorials",
    "https://developer.mozilla.org/en-US/docs/Web/Reference",
    "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps",
    "https://developer.mozilla.org/en-US/docs/Web/Accessibility",
    "https://developer.mozilla.org/en-US/docs/Web/Security",
    "https://developer.mozilla.org/en-US/docs/Web/Performance",
    "https://developer.mozilla.org/en-US/docs/Web/Apps",
    
    # React & Frontend
    "https://react.dev/reference/react",
    "https://react.dev/learn/thinking-in-react",
    "https://react.dev/learn/state-a-components-memory",
    "https://react.dev/learn/render-and-commit",
    "https://react.dev/learn/state-as-a-snapshot",
    "https://react.dev/learn/queueing-a-series-of-state-updates",
    "https://react.dev/learn/updating-objects-in-state",
    "https://react.dev/learn/updating-arrays-in-state",
    "https://react.dev/learn/managing-state",
    "https://react.dev/learn/choosing-the-state-structure",
    
    # Node.js & Backend
    "https://nodejs.org/en/docs/guides/",
    "https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/",
    "https://nodejs.org/en/docs/guides/buffer-constructor-deprecation/",
    "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/",
    "https://nodejs.org/en/docs/guides/getting-started-guide/",
    "https://nodejs.org/en/docs/guides/simple-profiling/",
    "https://nodejs.org/en/docs/guides/security-policy/",
    "https://nodejs.org/en/docs/guides/working-with-different-filesystems/",
    "https://nodejs.org/en/docs/guides/writing-and-running-benchmarks/",
    "https://nodejs.org/en/docs/guides/",
    
    # Mathematics
    "https://www.khanacademy.org/math/algebra",
    "https://www.khanacademy.org/math/geometry",
    "https://www.khanacademy.org/math/trigonometry",
    "https://www.khanacademy.org/math/precalculus",
    "https://www.khanacademy.org/math/calculus-1",
    "https://www.khanacademy.org/math/calculus-2",
    "https://www.khanacademy.org/math/statistics-probability",
    "https://www.khanacademy.org/math/linear-algebra",
    "https://www.khanacademy.org/math/differential-equations",
    "https://www.khanacademy.org/math/multivariable-calculus",
    "https://www.mathsisfun.com/algebra/index.html",
    "https://www.mathsisfun.com/geometry/index.html",
    "https://www.mathsisfun.com/trigonometry/index.html",
    "https://www.mathsisfun.com/calculus/index.html",
    "https://www.mathsisfun.com/data/index.html",
    
    # Science
    "https://www.khanacademy.org/science/physics",
    "https://www.khanacademy.org/science/chemistry",
    "https://www.khanacademy.org/science/biology",
    "https://www.khanacademy.org/science/ap-physics-1",
    "https://www.khanacademy.org/science/ap-physics-2",
    "https://www.khanacademy.org/science/ap-chemistry",
    "https://www.khanacademy.org/science/ap-biology",
    "https://www.khanacademy.org/science/electrical-engineering",
    "https://www.khanacademy.org/science/health-and-medicine",
    "https://www.khanacademy.org/science/computer-science",
    
    # Engineering
    "https://www.engineering.com/",
    "https://www.allaboutcircuits.com/",
    "https://www.allaboutcircuits.com/textbook/",
    "https://www.allaboutcircuits.com/worksheets/",
    "https://www.allaboutcircuits.com/technical-articles/",
    "https://www.allaboutcircuits.com/videos/",
    "https://www.allaboutcircuits.com/tools/",
    "https://www.allaboutcircuits.com/calculators/",
    "https://www.allaboutcircuits.com/reference/",
    "https://www.allaboutcircuits.com/news/",
    
    # Online Learning Platforms
    "https://www.coursera.org/",
    "https://www.edx.org/",
    "https://www.udemy.com/",
    "https://www.freecodecamp.org/",
    "https://www.codecademy.com/",
    "https://www.pluralsight.com/",
    "https://www.linkedin.com/learning/",
    "https://www.skillshare.com/",
    "https://www.masterclass.com/",
    "https://www.udacity.com/",
    "https://www.alison.com/",
    "https://www.futurelearn.com/",
    "https://www.open.edu/",
    "https://www.mit.edu/",
    "https://www.stanford.edu/",
    
    # Documentation & Tutorials
    "https://docs.mongodb.com/",
    "https://docs.mongodb.com/manual/",
    "https://docs.mongodb.com/compass/",
    "https://docs.mongodb.com/atlas/",
    "https://docs.mongodb.com/realm/",
    "https://expressjs.com/en/guide/routing.html",
    "https://expressjs.com/en/guide/writing-middleware.html",
    "https://expressjs.com/en/guide/using-middleware.html",
    "https://expressjs.com/en/guide/error-handling.html",
    "https://expressjs.com/en/guide/debugging.html",
    "https://tailwindcss.com/docs",
    "https://tailwindcss.com/docs/installation",
    "https://tailwindcss.com/docs/configuration",
    "https://tailwindcss.com/docs/content-configuration",
    "https://tailwindcss.com/docs/theme",
    "https://getbootstrap.com/docs/",
    "https://getbootstrap.com/docs/5.3/getting-started/",
    "https://getbootstrap.com/docs/5.3/layout/",
    "https://getbootstrap.com/docs/5.3/content/",
    "https://getbootstrap.com/docs/5.3/components/",
    "https://getbootstrap.com/docs/5.3/forms/",
    
    # Competitive Programming
    "https://leetcode.com/",
    "https://leetcode.com/problemset/",
    "https://leetcode.com/contest/",
    "https://leetcode.com/explore/",
    "https://leetcode.com/interview/",
    "https://www.hackerrank.com/",
    "https://www.hackerrank.com/domains",
    "https://www.hackerrank.com/challenges",
    "https://www.hackerrank.com/contests",
    "https://www.hackerrank.com/jobs",
    "https://codeforces.com/",
    "https://codeforces.com/problemset",
    "https://codeforces.com/contests",
    "https://codeforces.com/gyms",
    "https://codeforces.com/groups",
    "https://www.codechef.com/",
    "https://www.codechef.com/problems",
    "https://www.codechef.com/contests",
    "https://www.codechef.com/practice",
    "https://www.codechef.com/learn",
    "https://www.topcoder.com/",
    "https://www.spoj.com/",
    "https://atcoder.jp/",
    "https://www.codingame.com/",
    "https://www.codewars.com/",
    
    # Academic Resources
    "https://scholar.google.com/",
    "https://arxiv.org/",
    "https://www.researchgate.net/",
    "https://www.jstor.org/",
    "https://www.academia.edu/",
    "https://www.springer.com/",
    "https://www.nature.com/",
    "https://www.science.org/",
    "https://www.cell.com/",
    "https://www.pnas.org/",
    "https://www.pubmed.ncbi.nlm.nih.gov/",
    "https://www.ncbi.nlm.nih.gov/",
    "https://www.ieee.org/",
    "https://www.acm.org/",
    "https://www.usenix.org/",
    
    # Data Science & AI
    "https://scikit-learn.org/stable/",
    "https://pandas.pydata.org/",
    "https://numpy.org/",
    "https://matplotlib.org/",
    "https://seaborn.pydata.org/",
    "https://plotly.com/python/",
    "https://www.tensorflow.org/",
    "https://pytorch.org/",
    "https://keras.io/",
    "https://scipy.org/",
    "https://jupyter.org/",
    "https://www.anaconda.com/",
    "https://www.datacamp.com/",
    "https://www.kaggle.com/",
    "https://www.tableau.com/",
    
    # Web Development Resources
    "https://web.dev/",
    "https://developers.google.com/web",
    "https://developer.chrome.com/",
    "https://firebase.google.com/docs",
    "https://cloud.google.com/docs",
    "https://aws.amazon.com/documentation/",
    "https://docs.microsoft.com/en-us/",
    "https://docs.github.com/",
    "https://git-scm.com/doc",
    "https://www.docker.com/",
    "https://kubernetes.io/docs/",
    "https://www.nginx.com/resources/",
    "https://httpd.apache.org/docs/",
    "https://www.postgresql.org/docs/",
    "https://dev.mysql.com/doc/",
    
    # Design & UI/UX
    "https://www.figma.com/",
    "https://www.adobe.com/products/photoshop.html",
    "https://www.adobe.com/products/illustrator.html",
    "https://www.adobe.com/products/indesign.html",
    "https://www.sketch.com/",
    "https://www.invisionapp.com/",
    "https://www.canva.com/",
    "https://www.behance.net/",
    "https://dribbble.com/",
    "https://www.awwwards.com/",
    "https://www.smashingmagazine.com/",
    "https://www.nngroup.com/",
    "https://www.interaction-design.org/",
    "https://www.usability.gov/",
    "https://www.w3.org/WAI/",
    
    # Business & Marketing
    "https://www.hubspot.com/",
    "https://mailchimp.com/",
    "https://www.salesforce.com/",
    "https://www.marketo.com/",
    "https://www.hootsuite.com/",
    "https://buffer.com/",
    "https://www.google.com/analytics/",
    "https://analytics.google.com/",
    "https://ads.google.com/",
    "https://www.facebook.com/business/",
    "https://business.twitter.com/",
    "https://business.linkedin.com/",
    "https://www.instagram.com/business/",
    "https://www.youtube.com/creators/",
    "https://www.tiktok.com/business/",
    
    # Language Learning
    "https://www.duolingo.com/",
    "https://www.babbel.com/",
    "https://www.rosettastone.com/",
    "https://www.busuu.com/",
    "https://www.lingoda.com/",
    "https://www.italki.com/",
    "https://www.fluentu.com/",
    "https://www.memrise.com/",
    "https://www.hellotalk.com/",
    "https://www.tandem.net/",
    "https://www.cambly.com/",
    "https://www.preply.com/",
    "https://www.verbling.com/",
    "https://www.lingvist.com/",
    "https://www.mondly.com/",
]

async def process_and_store_links():
    """Scrape URLs and store them in MongoDB"""
    print("🚀 Starting educational link scraping...")
    
    # Step 1: Scrape the URLs
    print(f"📡 Scraping {len(EDUCATIONAL_URLS)} educational URLs...")
    scraped_links = await scrape_multiple_urls(EDUCATIONAL_URLS)
    print(f"✅ Successfully scraped {len(scraped_links)} links")
    
    if not scraped_links:
        print("❌ No links were scraped successfully")
        return
    
    # Step 2: Process through AI evaluator
    print("🤖 Processing links through AI evaluator...")
    processed_links = []
    
    for link in scraped_links:
        try:
            # Call AI evaluator to categorize and process the link
            ai_response = await call_ai_evaluator(link)
            if ai_response:
                processed_links.append(ai_response)
        except Exception as e:
            print(f"⚠️ Error processing {link.url}: {str(e)}")
            # Still add the link with basic info
            processed_links.append(create_basic_link_data(link))
    
    print(f"✅ Processed {len(processed_links)} links through AI")
    
    # Step 3: Store in MongoDB
    print("💾 Storing links in MongoDB...")
    stored_count = await store_links_in_db(processed_links)
    print(f"✅ Successfully stored {stored_count} links in database")
    
    return stored_count

async def call_ai_evaluator(scraped_link: ScrapedLink):
    """Call AI evaluator to categorize and process the link"""
    try:
        # Prepare data for AI evaluator
        data = {
            "url": scraped_link.url,
            "title": scraped_link.title,
            "description": scraped_link.description,
            "content": scraped_link.content[:2000],  # Limit content size
            "source_domain": scraped_link.source_domain,
            "content_type": scraped_link.content_type,
            "language": scraped_link.language,
            "word_count": scraped_link.word_count,
            "headings": scraped_link.headings[:10],  # Limit headings
            "meta_tags": scraped_link.meta_tags
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'http://localhost:5002/process-link',
                json=data,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return result
                else:
                    print(f"⚠️ AI evaluator returned status {response.status}")
                    return create_basic_link_data(scraped_link)
                    
    except Exception as e:
        print(f"⚠️ Error calling AI evaluator: {str(e)}")
        return create_basic_link_data(scraped_link)

def create_basic_link_data(scraped_link: ScrapedLink):
    """Create basic link data when AI processing fails"""
    return {
        "url": scraped_link.url,
        "title": scraped_link.title,
        "description": scraped_link.description,
        "summary": scraped_link.description[:200] if scraped_link.description else "",
        "language": scraped_link.language,
        "categories": {
            "primary": "General",
            "secondary": ["Education"]
        },
        "difficulty": "Beginner",
        "contentType": scraped_link.content_type,
        "sourceDomain": scraped_link.source_domain,
        "validStatus": True,
        "clickCount": 0,
        "popularityScore": 0,
        "qualityScore": 0.5,
        "tags": ["education", "learning"],
        "skillRelevance": ["General Skills"],
        "learningPath": [],
        "isSafe": True,
        "lastChecked": datetime.now().isoformat(),
        "nextCheckDate": (datetime.now() + timedelta(days=7)).isoformat()
    }

async def store_links_in_db(processed_links):
    """Store processed links in MongoDB using bulk endpoint"""
    try:
        if not processed_links:
            return 0
            
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'http://localhost:5001/api/links/bulk',
                json=processed_links,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                if response.status in [200, 201]:
                    result = await response.json()
                    stored_count = result.get('created', 0)
                    print(f"✅ Bulk stored {stored_count} links out of {len(processed_links)}")
                    return stored_count
                else:
                    error_text = await response.text()
                    print(f"⚠️ Bulk store failed: {response.status} - {error_text}")
                    return 0
        
    except Exception as e:
        print(f"❌ Error storing links in database: {str(e)}")
        return 0

async def main():
    """Main function"""
    print("🎓 CourseHive Educational Link Scraper")
    print("=" * 50)
    
    try:
        stored_count = await process_and_store_links()
        
        if stored_count > 0:
            print(f"\n🎉 Successfully scraped and stored {stored_count} educational links!")
            print("You can now view them in the CourseHive dashboard.")
        else:
            print("\n❌ No links were stored. Please check the logs above.")
            
    except Exception as e:
        print(f"\n❌ Error during scraping: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

import asyncio
import logging
import time
from typing import List, Optional
from urllib.parse import urlparse, urljoin
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from fake_useragent import UserAgent
from playwright.async_api import async_playwright
from .config import *
from .models import CrawlResult, CampsiteData
from .extractors import ContentExtractor
from .database import DatabaseManager

logger = logging.getLogger(__name__)

class WebCrawler:
    """Web crawler for campsite data extraction"""

    def __init__(self):
        self.session = self._setup_session()
        self.extractor = ContentExtractor()
        self.db_manager = DatabaseManager()
        self.user_agent = UserAgent()

    def _setup_session(self) -> requests.Session:
        """Setup requests session with retry strategy"""
        session = requests.Session()

        # Retry strategy
        retry_strategy = Retry(
            total=MAX_RETRIES,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        # Set default headers
        session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

        return session

    def crawl_url(self, url: str) -> CrawlResult:
        """Crawl a single URL and extract campsite data"""
        start_time = time.time()

        try:
            logger.info(f"Crawling URL: {url}")

            # Check if URL already exists in database
            if self.db_manager.url_exists(url):
                logger.info(f"URL already exists in database: {url}")
                return CrawlResult(
                    url=url,
                    success=False,
                    error="URL already exists",
                    processing_time=time.time() - start_time
                )

            # Make HTTP request
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()

            # Extract campsite data
            campsite_data = self.extractor.extract_campsite_data(response.text, url)

            if campsite_data:
                # Save to database
                success = self.db_manager.save_campsite(campsite_data)
                if success:
                    logger.info(f"Successfully saved campsite: {campsite_data.name}")
                else:
                    logger.error(f"Failed to save campsite: {campsite_data.name}")

            return CrawlResult(
                url=url,
                success=campsite_data is not None,
                campsite_data=campsite_data,
                status_code=response.status_code,
                processing_time=time.time() - start_time
            )

        except requests.exceptions.RequestException as e:
            logger.error(f"Request error for {url}: {str(e)}")
            return CrawlResult(
                url=url,
                success=False,
                error=str(e),
                processing_time=time.time() - start_time
            )
        except Exception as e:
            logger.error(f"Unexpected error for {url}: {str(e)}")
            return CrawlResult(
                url=url,
                success=False,
                error=str(e),
                processing_time=time.time() - start_time
            )

    def crawl_urls(self, urls: List[str]) -> List[CrawlResult]:
        """Crawl multiple URLs"""
        results = []

        for i, url in enumerate(urls):
            if i > 0:
                time.sleep(REQUEST_DELAY)  # Rate limiting

            result = self.crawl_url(url)
            results.append(result)

            # Log progress
            if (i + 1) % 10 == 0:
                successful = sum(1 for r in results if r.success)
                logger.info(f"Progress: {i + 1}/{len(urls)} URLs crawled, {successful} successful")

        return results

    async def take_screenshot(self, url: str) -> Optional[str]:
        """Take a screenshot of a webpage using Playwright"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    viewport={'width': SCREENSHOT_WIDTH, 'height': SCREENSHOT_HEIGHT}
                )
                page = await context.new_page()

                # Set user agent
                await page.set_extra_http_headers({'User-Agent': self.user_agent.random})

                # Navigate to page
                await page.goto(url, wait_until='networkidle', timeout=30000)

                # Take screenshot
                screenshot_bytes = await page.screenshot(
                    full_page=False,
                    type='png'
                )

                await browser.close()

                # Upload to storage and return URL
                return await self.db_manager.upload_screenshot(screenshot_bytes, url)

        except Exception as e:
            logger.error(f"Error taking screenshot for {url}: {str(e)}")
            return None

    def discover_urls(self, seed_url: str, max_depth: int = 2) -> List[str]:
        """Discover relevant URLs from a seed URL"""
        discovered_urls = set()
        visited_urls = set()

        def crawl_for_links(url: str, current_depth: int):
            if current_depth > max_depth or url in visited_urls:
                return

            visited_urls.add(url)

            try:
                response = self.session.get(url, timeout=TIMEOUT)
                response.raise_for_status()

                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'lxml')

                # Find all links
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(url, href)

                    # Filter relevant links
                    if self._is_relevant_url(full_url) and self._is_same_domain(full_url, seed_url):
                        discovered_urls.add(full_url)

                        # Recursively crawl (with depth limit)
                        if current_depth < max_depth:
                            crawl_for_links(full_url, current_depth + 1)

                time.sleep(REQUEST_DELAY)

            except Exception as e:
                logger.error(f"Error discovering URLs from {url}: {str(e)}")

        crawl_for_links(seed_url, 0)
        return list(discovered_urls)

    def _is_relevant_url(self, url: str) -> bool:
        """Check if URL is relevant for crawling"""
        url_lower = url.lower()

        # Skip irrelevant file types
        skip_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.css', '.js']
        if any(url_lower.endswith(ext) for ext in skip_extensions):
            return False

        # Skip admin/private pages
        skip_patterns = ['admin', 'login', 'signup', 'cart', 'checkout', 'account']
        if any(pattern in url_lower for pattern in skip_patterns):
            return False

        # Look for relevant keywords in URL
        relevant_keywords = ['program', 'course', 'study', 'camp', 'abroad', 'international']
        return any(keyword in url_lower for keyword in relevant_keywords)

    def _is_same_domain(self, url1: str, url2: str) -> bool:
        """Check if two URLs are from the same domain"""
        domain1 = urlparse(url1).netloc.lower()
        domain2 = urlparse(url2).netloc.lower()

        # Remove www. for comparison
        domain1 = domain1.replace('www.', '')
        domain2 = domain2.replace('www.', '')

        return domain1 == domain2

    def run_batch_crawl(self, urls: List[str] = None) -> dict:
        """Run a batch crawl operation"""
        if urls is None:
            urls = SEED_URLS

        logger.info(f"Starting batch crawl of {len(urls)} URLs")

        start_time = time.time()
        results = self.crawl_urls(urls)

        # Generate summary
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]

        summary = {
            "total_urls": len(urls),
            "successful": len(successful),
            "failed": len(failed),
            "success_rate": len(successful) / len(urls) * 100,
            "total_time": time.time() - start_time,
            "campsites_found": sum(1 for r in successful if r.campsite_data),
            "results": [r.to_dict() for r in results]
        }

        logger.info(f"Batch crawl completed: {summary['successful']}/{summary['total_urls']} successful")

        return summary

    def __del__(self):
        """Cleanup resources"""
        if hasattr(self, 'session'):
            self.session.close()
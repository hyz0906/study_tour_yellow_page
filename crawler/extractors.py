import re
import logging
from typing import Optional, Dict, Any
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from .config import CONTENT_KEYWORDS
from .models import CampsiteData

logger = logging.getLogger(__name__)

class ContentExtractor:
    """Extract structured data from web pages"""

    def __init__(self):
        self.content_keywords = [kw.lower() for kw in CONTENT_KEYWORDS]

    def extract_campsite_data(self, html: str, url: str) -> Optional[CampsiteData]:
        """Extract campsite data from HTML content"""
        try:
            soup = BeautifulSoup(html, 'lxml')

            # Check if content is relevant
            if not self._is_relevant_content(soup):
                logger.debug(f"Content not relevant for URL: {url}")
                return None

            # Extract basic information
            name = self._extract_name(soup, url)
            description = self._extract_description(soup)
            country = self._extract_country(soup)
            category = self._extract_category(soup)
            thumbnail_url = self._extract_thumbnail(soup, url)

            if not name:
                logger.debug(f"Could not extract name from URL: {url}")
                return None

            return CampsiteData(
                name=name,
                url=url,
                description=description,
                country=country,
                category=category,
                thumbnail_url=thumbnail_url,
                meta_title=self._extract_meta_title(soup),
                meta_description=self._extract_meta_description(soup),
                language=self._extract_language(soup)
            )

        except Exception as e:
            logger.error(f"Error extracting data from {url}: {str(e)}")
            return None

    def _is_relevant_content(self, soup: BeautifulSoup) -> bool:
        """Check if the page content is relevant to study tours/camps"""
        text_content = soup.get_text().lower()

        # Check for keywords in content
        keyword_count = sum(1 for keyword in self.content_keywords if keyword in text_content)

        # Check for keywords in meta tags
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        meta_description = soup.find('meta', attrs={'name': 'description'})

        meta_text = ""
        if meta_keywords:
            meta_text += (meta_keywords.get('content', '') or '').lower()
        if meta_description:
            meta_text += (meta_description.get('content', '') or '').lower()

        meta_keyword_count = sum(1 for keyword in self.content_keywords if keyword in meta_text)

        # Consider relevant if we find keywords or relevant URL patterns
        return keyword_count > 0 or meta_keyword_count > 0

    def _extract_name(self, soup: BeautifulSoup, url: str) -> Optional[str]:
        """Extract the program/campsite name"""
        # Try different strategies to find the name

        # 1. Try h1 tag
        h1 = soup.find('h1')
        if h1 and h1.get_text().strip():
            return self._clean_text(h1.get_text())

        # 2. Try title tag
        title = soup.find('title')
        if title and title.get_text().strip():
            title_text = title.get_text().strip()
            # Remove common website suffixes
            cleaned_title = re.sub(r'\s*[\|\-\–]\s*.*$', '', title_text)
            if cleaned_title:
                return self._clean_text(cleaned_title)

        # 3. Try meta property og:title
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return self._clean_text(og_title['content'])

        # 4. Try meta name title
        meta_title = soup.find('meta', attrs={'name': 'title'})
        if meta_title and meta_title.get('content'):
            return self._clean_text(meta_title['content'])

        # 5. Fallback to domain name
        domain = urlparse(url).netloc
        if domain:
            # Remove www. and common TLDs, capitalize
            name = domain.replace('www.', '').split('.')[0]
            return name.capitalize()

        return None

    def _extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract program description"""
        # Try meta description first
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            desc = self._clean_text(meta_desc['content'])
            if len(desc) > 50:  # Ensure it's substantial
                return desc[:500]  # Limit length

        # Try og:description
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            desc = self._clean_text(og_desc['content'])
            if len(desc) > 50:
                return desc[:500]

        # Try to find a descriptive paragraph
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = self._clean_text(p.get_text())
            if len(text) > 100 and any(keyword in text.lower() for keyword in self.content_keywords):
                return text[:500]

        return None

    def _extract_country(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract country information"""
        text_content = soup.get_text().lower()

        # Common country patterns in study abroad context
        country_patterns = {
            r'\b(united kingdom|uk|britain|england)\b': 'United Kingdom',
            r'\b(united states|usa|america)\b': 'United States',
            r'\bcanada\b': 'Canada',
            r'\baustralia\b': 'Australia',
            r'\bnew zealand\b': 'New Zealand',
            r'\bfrance\b': 'France',
            r'\bgermany\b': 'Germany',
            r'\bspain\b': 'Spain',
            r'\bitaly\b': 'Italy',
            r'\bjapan\b': 'Japan',
            r'\bchina\b': 'China',
            r'\bsouth korea\b': 'South Korea',
            r'\bireland\b': 'Ireland',
            r'\bnetherlands\b': 'Netherlands',
            r'\bswitzerland\b': 'Switzerland',
            r'\baustria\b': 'Austria',
            r'\bbelgium\b': 'Belgium',
            r'\bczech republic\b': 'Czech Republic',
            r'\bdenmark\b': 'Denmark',
            r'\bfinland\b': 'Finland',
            r'\bnorway\b': 'Norway',
            r'\bsweden\b': 'Sweden',
            r'\bpoland\b': 'Poland',
            r'\bportugal\b': 'Portugal',
        }

        for pattern, country in country_patterns.items():
            if re.search(pattern, text_content):
                return country

        return None

    def _extract_category(self, soup: BeautifulSoup) -> str:
        """Extract program category"""
        text_content = soup.get_text().lower()
        title = soup.find('title')
        title_text = title.get_text().lower() if title else ""

        full_text = text_content + " " + title_text

        # Category detection patterns
        if any(keyword in full_text for keyword in ['summer camp', 'summer program', 'summer school']):
            return 'summer'
        elif any(keyword in full_text for keyword in ['winter camp', 'winter program', 'winter school']):
            return 'winter'
        elif any(keyword in full_text for keyword in ['online', 'virtual', 'remote', 'distance learning']):
            return 'online'
        else:
            return 'study'  # Default category

    def _extract_thumbnail(self, soup: BeautifulSoup, base_url: str) -> Optional[str]:
        """Extract thumbnail/hero image URL"""
        # Try og:image first
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return self._resolve_url(og_image['content'], base_url)

        # Try twitter:image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            return self._resolve_url(twitter_image['content'], base_url)

        # Try to find a hero/banner image
        hero_selectors = [
            'img[class*="hero"]',
            'img[class*="banner"]',
            'img[class*="header"]',
            '.hero img',
            '.banner img',
            '.header img'
        ]

        for selector in hero_selectors:
            img = soup.select_one(selector)
            if img and img.get('src'):
                return self._resolve_url(img['src'], base_url)

        # Fallback to first large image
        images = soup.find_all('img')
        for img in images:
            src = img.get('src') or img.get('data-src')
            if src:
                # Skip small images, icons, and tracking pixels
                if any(skip in src.lower() for skip in ['icon', 'logo', 'pixel', 'track']):
                    continue

                return self._resolve_url(src, base_url)

        return None

    def _extract_meta_title(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract meta title"""
        title = soup.find('title')
        return self._clean_text(title.get_text()) if title else None

    def _extract_meta_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract meta description"""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        return self._clean_text(meta_desc['content']) if meta_desc and meta_desc.get('content') else None

    def _extract_language(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract page language"""
        html_tag = soup.find('html')
        if html_tag and html_tag.get('lang'):
            return html_tag['lang']

        meta_lang = soup.find('meta', attrs={'http-equiv': 'content-language'})
        if meta_lang and meta_lang.get('content'):
            return meta_lang['content']

        return None

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())

        # Remove control characters
        text = re.sub(r'[\x00-\x1F\x7F]', '', text)

        return text

    def _resolve_url(self, url: str, base_url: str) -> str:
        """Resolve relative URLs to absolute URLs"""
        return urljoin(base_url, url)
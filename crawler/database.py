import logging
import hashlib
from typing import Optional
from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_SERVICE_KEY
from .models import CampsiteData

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Handle database operations for crawler"""

    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY")

        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    def url_exists(self, url: str) -> bool:
        """Check if URL already exists in database"""
        try:
            result = self.supabase.table('campsites').select('id').eq('url', url).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error checking URL existence: {str(e)}")
            return False

    def save_campsite(self, campsite_data: CampsiteData) -> bool:
        """Save campsite data to database"""
        try:
            # Check if URL already exists
            if self.url_exists(campsite_data.url):
                logger.warning(f"Campsite already exists: {campsite_data.url}")
                return False

            # Convert to database format
            data = campsite_data.to_dict()

            # Insert into database
            result = self.supabase.table('campsites').insert(data).execute()

            if result.data:
                logger.info(f"Successfully saved campsite: {campsite_data.name}")
                return True
            else:
                logger.error(f"Failed to save campsite: {campsite_data.name}")
                return False

        except Exception as e:
            logger.error(f"Error saving campsite {campsite_data.name}: {str(e)}")
            return False

    def update_campsite(self, url: str, updates: dict) -> bool:
        """Update existing campsite data"""
        try:
            result = self.supabase.table('campsites').update(updates).eq('url', url).execute()

            if result.data:
                logger.info(f"Successfully updated campsite: {url}")
                return True
            else:
                logger.error(f"Failed to update campsite: {url}")
                return False

        except Exception as e:
            logger.error(f"Error updating campsite {url}: {str(e)}")
            return False

    async def upload_screenshot(self, screenshot_bytes: bytes, url: str) -> Optional[str]:
        """Upload screenshot to Supabase storage"""
        try:
            # Generate unique filename
            url_hash = hashlib.md5(url.encode()).hexdigest()
            filename = f"screenshots/{url_hash}.png"

            # Upload to Supabase storage
            result = self.supabase.storage.from_('campsites').upload(
                filename,
                screenshot_bytes,
                file_options={"content-type": "image/png"}
            )

            if result:
                # Get public URL
                public_url = self.supabase.storage.from_('campsites').get_public_url(filename)
                logger.info(f"Screenshot uploaded successfully: {public_url}")
                return public_url

        except Exception as e:
            logger.error(f"Error uploading screenshot for {url}: {str(e)}")

        return None

    def get_crawl_statistics(self) -> dict:
        """Get crawling statistics"""
        try:
            # Total campsites
            total_result = self.supabase.table('campsites').select('id', count='exact').execute()
            total_campsites = total_result.count

            # By category
            categories_result = self.supabase.table('campsites').select('category', count='exact').execute()

            # By country
            countries_result = self.supabase.table('campsites').select('country', count='exact').execute()

            return {
                "total_campsites": total_campsites,
                "categories": {},  # Would need to aggregate by category
                "countries": {},   # Would need to aggregate by country
                "last_updated": None  # Could track in separate table
            }

        except Exception as e:
            logger.error(f"Error getting crawl statistics: {str(e)}")
            return {}

    def cleanup_old_data(self, days_old: int = 30) -> int:
        """Clean up old/outdated crawl data"""
        try:
            # This would require tracking crawl dates
            # For now, just log the intent
            logger.info(f"Cleanup requested for data older than {days_old} days")
            return 0

        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
            return 0

    def mark_url_as_failed(self, url: str, error: str):
        """Mark URL as failed (could be stored in separate table for monitoring)"""
        try:
            # For now, just log failed URLs
            # In production, you might want a separate 'failed_crawls' table
            logger.warning(f"Failed to crawl URL: {url} - {error}")

        except Exception as e:
            logger.error(f"Error marking URL as failed: {str(e)}")

    def get_urls_to_recrawl(self, days_since_last_crawl: int = 7) -> list:
        """Get URLs that need to be recrawled"""
        try:
            # This would require tracking last crawl dates
            # Return empty list for now
            return []

        except Exception as e:
            logger.error(f"Error getting URLs to recrawl: {str(e)}")
            return []
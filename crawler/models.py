from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass
class CampsiteData:
    """Data class for campsite information"""
    name: str
    url: str
    description: Optional[str] = None
    country: Optional[str] = None
    category: str = "study"  # summer, winter, study, online
    thumbnail_url: Optional[str] = None

    # Extracted metadata
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    language: Optional[str] = None

    # Crawling metadata
    crawled_at: Optional[datetime] = None
    source: str = "crawler"

    def __post_init__(self):
        if self.crawled_at is None:
            self.crawled_at = datetime.utcnow()

    def to_dict(self):
        """Convert to dictionary for Supabase insertion"""
        return {
            "name": self.name,
            "url": self.url,
            "description": self.description,
            "country": self.country,
            "category": self.category,
            "thumbnail_url": self.thumbnail_url,
        }

@dataclass
class CrawlResult:
    """Result of a single URL crawl"""
    url: str
    success: bool
    campsite_data: Optional[CampsiteData] = None
    error: Optional[str] = None
    status_code: Optional[int] = None
    processing_time: Optional[float] = None

    def to_dict(self):
        return {
            "url": self.url,
            "success": self.success,
            "error": self.error,
            "status_code": self.status_code,
            "processing_time": self.processing_time,
            "campsite_found": self.campsite_data is not None
        }
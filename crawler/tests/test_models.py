import pytest
from datetime import datetime
from crawler.models import CampsiteData, CrawlResult


class TestCampsiteData:
    def test_campsite_data_creation(self):
        """Test basic CampsiteData creation"""
        campsite = CampsiteData(
            name="Test Camp",
            url="https://example.com",
            description="A test camp",
            country="US",
            category="summer"
        )

        assert campsite.name == "Test Camp"
        assert campsite.url == "https://example.com"
        assert campsite.description == "A test camp"
        assert campsite.country == "US"
        assert campsite.category == "summer"
        assert campsite.source == "crawler"
        assert isinstance(campsite.crawled_at, datetime)

    def test_campsite_data_defaults(self):
        """Test CampsiteData with default values"""
        campsite = CampsiteData(
            name="Minimal Camp",
            url="https://minimal.com"
        )

        assert campsite.description is None
        assert campsite.country is None
        assert campsite.category == "study"  # default category
        assert campsite.thumbnail_url is None
        assert campsite.source == "crawler"

    def test_campsite_data_to_dict(self):
        """Test conversion to dictionary for database insertion"""
        campsite = CampsiteData(
            name="Dict Test Camp",
            url="https://dict-test.com",
            description="Test description",
            country="UK",
            category="winter",
            thumbnail_url="https://example.com/thumb.jpg"
        )

        data_dict = campsite.to_dict()

        expected_keys = {
            "name", "url", "description", "country",
            "category", "thumbnail_url"
        }

        assert set(data_dict.keys()) == expected_keys
        assert data_dict["name"] == "Dict Test Camp"
        assert data_dict["url"] == "https://dict-test.com"
        assert data_dict["category"] == "winter"

    def test_campsite_data_post_init(self):
        """Test __post_init__ behavior"""
        # Test with explicit crawled_at
        custom_time = datetime(2023, 1, 1, 12, 0, 0)
        campsite = CampsiteData(
            name="Time Test",
            url="https://time-test.com",
            crawled_at=custom_time
        )

        assert campsite.crawled_at == custom_time

        # Test with None crawled_at (should be set to current time)
        campsite2 = CampsiteData(
            name="Auto Time Test",
            url="https://auto-time.com"
        )

        assert campsite2.crawled_at is not None
        assert isinstance(campsite2.crawled_at, datetime)


class TestCrawlResult:
    def test_crawl_result_success(self):
        """Test successful crawl result"""
        campsite_data = CampsiteData(
            name="Success Camp",
            url="https://success.com"
        )

        result = CrawlResult(
            url="https://success.com",
            success=True,
            campsite_data=campsite_data,
            status_code=200,
            processing_time=1.5
        )

        assert result.url == "https://success.com"
        assert result.success is True
        assert result.campsite_data == campsite_data
        assert result.error is None
        assert result.status_code == 200
        assert result.processing_time == 1.5

    def test_crawl_result_failure(self):
        """Test failed crawl result"""
        result = CrawlResult(
            url="https://failed.com",
            success=False,
            error="Connection timeout",
            status_code=408,
            processing_time=30.0
        )

        assert result.url == "https://failed.com"
        assert result.success is False
        assert result.campsite_data is None
        assert result.error == "Connection timeout"
        assert result.status_code == 408

    def test_crawl_result_to_dict(self):
        """Test CrawlResult conversion to dictionary"""
        campsite_data = CampsiteData(
            name="Dict Result Camp",
            url="https://dict-result.com"
        )

        result = CrawlResult(
            url="https://dict-result.com",
            success=True,
            campsite_data=campsite_data,
            status_code=200,
            processing_time=2.3
        )

        result_dict = result.to_dict()

        expected_keys = {
            "url", "success", "error", "status_code",
            "processing_time", "campsite_found"
        }

        assert set(result_dict.keys()) == expected_keys
        assert result_dict["url"] == "https://dict-result.com"
        assert result_dict["success"] is True
        assert result_dict["campsite_found"] is True
        assert result_dict["error"] is None

    def test_crawl_result_to_dict_no_campsite(self):
        """Test CrawlResult to_dict when no campsite found"""
        result = CrawlResult(
            url="https://no-campsite.com",
            success=False,
            error="No relevant content"
        )

        result_dict = result.to_dict()

        assert result_dict["campsite_found"] is False
        assert result_dict["success"] is False
        assert result_dict["error"] == "No relevant content"

    def test_crawl_result_minimal(self):
        """Test CrawlResult with minimal data"""
        result = CrawlResult(
            url="https://minimal.com",
            success=False
        )

        assert result.url == "https://minimal.com"
        assert result.success is False
        assert result.campsite_data is None
        assert result.error is None
        assert result.status_code is None
        assert result.processing_time is None


class TestDataValidation:
    def test_campsite_data_validation(self):
        """Test that CampsiteData enforces required fields"""
        # Should work with required fields
        campsite = CampsiteData(
            name="Valid Camp",
            url="https://valid.com"
        )
        assert campsite.name == "Valid Camp"

        # Test with empty name - should still work but might not be ideal
        campsite_empty_name = CampsiteData(
            name="",
            url="https://empty-name.com"
        )
        assert campsite_empty_name.name == ""

    def test_crawl_result_validation(self):
        """Test CrawlResult data validation"""
        # Valid result
        result = CrawlResult(
            url="https://test.com",
            success=True
        )
        assert result.success is True

        # Test boolean conversion
        result_truthy = CrawlResult(
            url="https://truthy.com",
            success=1  # Should be treated as True
        )
        assert result_truthy.success == 1  # dataclass doesn't auto-convert

    def test_category_values(self):
        """Test that category accepts valid values"""
        valid_categories = ["summer", "winter", "study", "online"]

        for category in valid_categories:
            campsite = CampsiteData(
                name=f"{category.title()} Camp",
                url=f"https://{category}.com",
                category=category
            )
            assert campsite.category == category

    def test_source_default(self):
        """Test that source defaults to 'crawler'"""
        campsite = CampsiteData(
            name="Source Test",
            url="https://source-test.com"
        )

        assert campsite.source == "crawler"
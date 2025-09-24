import pytest
from bs4 import BeautifulSoup
from crawler.extractors import ContentExtractor
from crawler.models import CampsiteData


class TestContentExtractor:
    @pytest.fixture
    def extractor(self):
        return ContentExtractor()

    @pytest.fixture
    def sample_html(self):
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Amazing Summer Camp - Best Educational Experience</title>
            <meta name="description" content="Join our amazing summer camp for students aged 12-18. Language learning, cultural immersion, and unforgettable experiences in the UK.">
            <meta property="og:title" content="Amazing Summer Camp">
            <meta property="og:description" content="Educational summer program in the UK">
            <meta property="og:image" content="https://example.com/hero-image.jpg">
        </head>
        <body>
            <h1>Amazing Summer Camp</h1>
            <p>Welcome to our incredible summer program designed for international students.
               Our study abroad experience combines language learning with cultural immersion
               in beautiful United Kingdom locations.</p>
            <p>Program highlights include academic excellence, cultural activities, and lifelong friendships.</p>
            <img src="/hero-banner.jpg" alt="Students learning" class="hero-image">
        </body>
        </html>
        """

    @pytest.fixture
    def irrelevant_html(self):
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Online Shopping Store - Best Deals</title>
            <meta name="description" content="Shop online for the best deals on electronics, clothing, and more.">
        </head>
        <body>
            <h1>Welcome to Our Store</h1>
            <p>Find great deals on all your favorite products. Free shipping on orders over $50.</p>
        </body>
        </html>
        """

    def test_extract_relevant_campsite_data(self, extractor, sample_html):
        """Test extraction of relevant campsite data"""
        campsite_data = extractor.extract_campsite_data(sample_html, "https://example.com")

        assert campsite_data is not None
        assert isinstance(campsite_data, CampsiteData)
        assert campsite_data.name == "Amazing Summer Camp"
        assert campsite_data.url == "https://example.com"
        assert "summer program" in campsite_data.description.lower()
        assert campsite_data.country == "United Kingdom"
        assert campsite_data.category == "summer"
        assert campsite_data.thumbnail_url == "https://example.com/hero-image.jpg"

    def test_extract_irrelevant_content_returns_none(self, extractor, irrelevant_html):
        """Test that irrelevant content returns None"""
        campsite_data = extractor.extract_campsite_data(irrelevant_html, "https://shop.example.com")

        assert campsite_data is None

    def test_is_relevant_content_with_keywords(self, extractor):
        """Test content relevance detection"""
        relevant_html = "<html><body><p>This is a great study abroad program</p></body></html>"
        soup = BeautifulSoup(relevant_html, 'lxml')

        assert extractor._is_relevant_content(soup) is True

    def test_is_relevant_content_without_keywords(self, extractor):
        """Test content irrelevance detection"""
        irrelevant_html = "<html><body><p>This is about shopping and deals</p></body></html>"
        soup = BeautifulSoup(irrelevant_html, 'lxml')

        assert extractor._is_relevant_content(soup) is False

    def test_extract_name_from_h1(self, extractor):
        """Test name extraction from h1 tag"""
        html = "<html><body><h1>Test Camp Name</h1></body></html>"
        soup = BeautifulSoup(html, 'lxml')

        name = extractor._extract_name(soup, "https://example.com")

        assert name == "Test Camp Name"

    def test_extract_name_from_title(self, extractor):
        """Test name extraction from title tag"""
        html = "<html><head><title>Test Camp | Official Site</title></head></html>"
        soup = BeautifulSoup(html, 'lxml')

        name = extractor._extract_name(soup, "https://example.com")

        assert name == "Test Camp"

    def test_extract_name_fallback_to_domain(self, extractor):
        """Test name extraction fallback to domain"""
        html = "<html><body></body></html>"
        soup = BeautifulSoup(html, 'lxml')

        name = extractor._extract_name(soup, "https://testcamp.com/programs")

        assert name == "Testcamp"

    def test_extract_description_from_meta(self, extractor):
        """Test description extraction from meta tag"""
        html = '''<html><head>
        <meta name="description" content="This is a comprehensive summer program for international students offering language immersion.">
        </head></html>'''
        soup = BeautifulSoup(html, 'lxml')

        description = extractor._extract_description(soup)

        assert "comprehensive summer program" in description

    def test_extract_country_detection(self, extractor):
        """Test various country detection patterns"""
        test_cases = [
            ("Visit our program in the United Kingdom", "United Kingdom"),
            ("Study in beautiful France this summer", "France"),
            ("Experience Japan culture", "Japan"),
            ("Learn in the USA", "United States"),
            ("No country mentioned here", None),
        ]

        for text, expected_country in test_cases:
            html = f"<html><body><p>{text}</p></body></html>"
            soup = BeautifulSoup(html, 'lxml')

            country = extractor._extract_country(soup)

            assert country == expected_country

    def test_extract_category_detection(self, extractor):
        """Test category detection from content"""
        test_cases = [
            ("Join our summer camp program", "summer"),
            ("Winter school in the Alps", "winter"),
            ("Online virtual learning experience", "online"),
            ("International study program", "study"),
        ]

        for text, expected_category in test_cases:
            html = f"<html><head><title>{text}</title></head></html>"
            soup = BeautifulSoup(html, 'lxml')

            category = extractor._extract_category(soup)

            assert category == expected_category

    def test_extract_thumbnail_from_og_image(self, extractor):
        """Test thumbnail extraction from og:image"""
        html = '''<html><head>
        <meta property="og:image" content="https://example.com/image.jpg">
        </head></html>'''
        soup = BeautifulSoup(html, 'lxml')

        thumbnail = extractor._extract_thumbnail(soup, "https://example.com")

        assert thumbnail == "https://example.com/image.jpg"

    def test_extract_thumbnail_relative_url(self, extractor):
        """Test thumbnail extraction with relative URL"""
        html = '''<html><head>
        <meta property="og:image" content="/images/hero.jpg">
        </head></html>'''
        soup = BeautifulSoup(html, 'lxml')

        thumbnail = extractor._extract_thumbnail(soup, "https://example.com")

        assert thumbnail == "https://example.com/images/hero.jpg"

    def test_clean_text_normalization(self, extractor):
        """Test text cleaning and normalization"""
        dirty_text = "  Multiple    spaces\n\nand   newlines\t\ttabs  "

        cleaned = extractor._clean_text(dirty_text)

        assert cleaned == "Multiple spaces and newlines tabs"

    def test_resolve_url_absolute(self, extractor):
        """Test URL resolution for absolute URLs"""
        absolute_url = "https://other.com/image.jpg"
        base_url = "https://example.com"

        resolved = extractor._resolve_url(absolute_url, base_url)

        assert resolved == absolute_url

    def test_resolve_url_relative(self, extractor):
        """Test URL resolution for relative URLs"""
        relative_url = "/images/photo.jpg"
        base_url = "https://example.com/page"

        resolved = extractor._resolve_url(relative_url, base_url)

        assert resolved == "https://example.com/images/photo.jpg"

    def test_malformed_html_handling(self, extractor):
        """Test handling of malformed HTML"""
        malformed_html = "<html><head><title>Test</head><body><h1>Broken HTML"

        # Should not crash and should handle gracefully
        result = extractor.extract_campsite_data(malformed_html, "https://example.com")

        # Might return None due to lack of relevant content, but shouldn't crash
        assert result is None or isinstance(result, CampsiteData)

    def test_empty_html_handling(self, extractor):
        """Test handling of empty HTML"""
        empty_html = ""

        result = extractor.extract_campsite_data(empty_html, "https://example.com")

        assert result is None

    def test_extract_language_from_html_tag(self, extractor):
        """Test language extraction from html lang attribute"""
        html = '<html lang="en-US"><body></body></html>'
        soup = BeautifulSoup(html, 'lxml')

        language = extractor._extract_language(soup)

        assert language == "en-US"
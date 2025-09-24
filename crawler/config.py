import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Crawler Configuration
USER_AGENT = "StudyTourBot/1.0 (+https://studytour.com/bot)"
REQUEST_DELAY = 1  # Delay between requests in seconds
MAX_RETRIES = 3
TIMEOUT = 30

# Screenshot Configuration
SCREENSHOT_WIDTH = 1200
SCREENSHOT_HEIGHT = 800
THUMBNAIL_WIDTH = 400
THUMBNAIL_HEIGHT = 300

# Allowed domains (optional - for focused crawling)
ALLOWED_DOMAINS = []

# Seed URLs for initial crawling
SEED_URLS = [
    "https://www.cambridgeimmersion.com",
    "https://www.ef.com/wwen/programs/",
    "https://www.kaplaninternational.com/",
    "https://www.studyabroad.com/",
    "https://www.gooverseas.com/study-abroad",
]

# Keywords to identify camp/study abroad content
CONTENT_KEYWORDS = [
    "study abroad", "summer camp", "winter camp", "language camp",
    "educational program", "study tour", "international program",
    "student exchange", "immersion program", "academic program"
]

# Database Configuration
BATCH_SIZE = 10  # Number of records to insert at once

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
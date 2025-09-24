# StudyTour Campsite Crawler

A Python web crawler for extracting study tour and campsite information from websites and populating the StudyTour database.

## Features

- **Multi-source crawling**: Crawl from seed URLs, URL lists, or discover URLs from websites
- **Content extraction**: Extract structured data including name, description, country, category, and images
- **Smart filtering**: Only processes relevant educational content using keyword matching
- **Screenshot capture**: Optional Playwright-based screenshot generation
- **Database integration**: Direct integration with Supabase database
- **Rate limiting**: Respectful crawling with configurable delays
- **Error handling**: Robust error handling and retry mechanisms

## Installation

1. Install Python dependencies:
```bash
cd crawler
pip install -r requirements.txt
```

2. Install Playwright browsers:
```bash
playwright install chromium
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

## Usage

### Basic crawling with seed URLs:
```bash
python -m crawler.main --seed-only
```

### Crawl from URL list:
```bash
echo "https://example-camp.com" > urls.txt
echo "https://another-camp.com" >> urls.txt
python -m crawler.main --urls urls.txt
```

### Discover and crawl URLs from a website:
```bash
python -m crawler.main --discover https://example.com --max-depth 2
```

### Take screenshots:
```bash
python -m crawler.main --seed-only --screenshot
```

### Custom output and logging:
```bash
python -m crawler.main --seed-only --output my_results.json --log-level DEBUG
```

## Configuration

Key configuration options in `config.py`:

- `SEED_URLS`: Default URLs to crawl
- `CONTENT_KEYWORDS`: Keywords used to identify relevant content
- `REQUEST_DELAY`: Delay between requests (seconds)
- `MAX_RETRIES`: Maximum retry attempts for failed requests
- `SCREENSHOT_WIDTH/HEIGHT`: Screenshot dimensions

## Architecture

### Components

1. **WebCrawler**: Main crawler class handling HTTP requests and coordination
2. **ContentExtractor**: Extracts structured data from HTML content
3. **DatabaseManager**: Handles database operations and storage
4. **Models**: Data classes for campsite data and crawl results

### Data Extraction

The crawler extracts:
- **Name**: From h1 tags, title tags, or meta properties
- **Description**: From meta descriptions or relevant paragraphs
- **Country**: Pattern matching for country names in content
- **Category**: Classification as summer/winter/study/online programs
- **Images**: Hero images, og:image, or relevant page images

### Content Filtering

Only processes pages containing educational keywords such as:
- study abroad, summer camp, winter camp
- educational program, study tour
- international program, student exchange

## Database Schema

Crawled data is stored in the `campsites` table with fields:
- `name`: Program/campsite name
- `url`: Original URL
- `description`: Program description
- `country`: Country location
- `category`: Program type (summer/winter/study/online)
- `thumbnail_url`: Featured image URL

## Error Handling

The crawler handles various error conditions:
- Network timeouts and connection errors
- HTTP error responses (404, 500, etc.)
- Content parsing errors
- Database insertion failures

Failed URLs are logged for manual review.

## Rate Limiting

The crawler implements respectful crawling practices:
- Configurable delays between requests
- Retry logic with exponential backoff
- User-Agent identification
- Robots.txt respect (manual implementation recommended)

## Monitoring

Crawl results include statistics:
- Total URLs processed
- Success/failure counts
- Processing time
- Campsites found and saved

## Development

To extend the crawler:

1. **Add new extractors**: Modify `ContentExtractor` class
2. **Custom content filtering**: Update `CONTENT_KEYWORDS` or `_is_relevant_content`
3. **New data sources**: Add URL discovery methods
4. **Enhanced screenshots**: Customize Playwright automation

## Production Deployment

For production use:
1. Set up proper logging aggregation
2. Implement monitoring and alerting
3. Configure appropriate rate limits
4. Set up data validation and quality checks
5. Implement duplicate detection improvements

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure all dependencies are installed
2. **Playwright errors**: Run `playwright install`
3. **Database connection**: Verify Supabase credentials
4. **Rate limiting**: Increase `REQUEST_DELAY` for sensitive sites

### Logging

Set `--log-level DEBUG` for detailed crawling logs:
```bash
python -m crawler.main --seed-only --log-level DEBUG
```

Logs are written to both console and `crawler.log` file.
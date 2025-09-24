#!/usr/bin/env python3

import argparse
import logging
import json
import sys
from pathlib import Path
from typing import List

from .config import LOG_LEVEL, LOG_FORMAT, SEED_URLS
from .crawler import WebCrawler

def setup_logging(log_level: str = LOG_LEVEL):
    """Setup logging configuration"""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=LOG_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('crawler.log', mode='a')
        ]
    )

    # Reduce noise from external libraries
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)

def load_urls_from_file(file_path: str) -> List[str]:
    """Load URLs from a text file"""
    urls = []
    try:
        with open(file_path, 'r') as f:
            for line in f:
                url = line.strip()
                if url and not url.startswith('#'):  # Skip empty lines and comments
                    urls.append(url)
    except FileNotFoundError:
        logging.error(f"URL file not found: {file_path}")
        sys.exit(1)
    except Exception as e:
        logging.error(f"Error reading URL file: {str(e)}")
        sys.exit(1)

    return urls

def save_results(results: dict, output_file: str):
    """Save crawl results to JSON file"""
    try:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        logging.info(f"Results saved to: {output_file}")
    except Exception as e:
        logging.error(f"Error saving results: {str(e)}")

def main():
    """Main crawler entry point"""
    parser = argparse.ArgumentParser(description='StudyTour Campsite Crawler')

    parser.add_argument(
        '--urls',
        type=str,
        help='File containing URLs to crawl (one per line)'
    )

    parser.add_argument(
        '--seed-only',
        action='store_true',
        help='Only crawl seed URLs from config'
    )

    parser.add_argument(
        '--discover',
        type=str,
        help='Discover URLs from a seed URL'
    )

    parser.add_argument(
        '--max-depth',
        type=int,
        default=2,
        help='Maximum crawl depth for URL discovery (default: 2)'
    )

    parser.add_argument(
        '--output',
        type=str,
        default='crawl_results.json',
        help='Output file for results (default: crawl_results.json)'
    )

    parser.add_argument(
        '--screenshot',
        action='store_true',
        help='Take screenshots of crawled pages'
    )

    parser.add_argument(
        '--log-level',
        type=str,
        default=LOG_LEVEL,
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        help=f'Logging level (default: {LOG_LEVEL})'
    )

    args = parser.parse_args()

    # Setup logging
    setup_logging(args.log_level)

    # Initialize crawler
    try:
        crawler = WebCrawler()
        logging.info("Crawler initialized successfully")
    except Exception as e:
        logging.error(f"Failed to initialize crawler: {str(e)}")
        sys.exit(1)

    # Determine URLs to crawl
    urls_to_crawl = []

    if args.discover:
        logging.info(f"Discovering URLs from: {args.discover}")
        try:
            discovered_urls = crawler.discover_urls(args.discover, args.max_depth)
            urls_to_crawl.extend(discovered_urls)
            logging.info(f"Discovered {len(discovered_urls)} URLs")
        except Exception as e:
            logging.error(f"URL discovery failed: {str(e)}")
            sys.exit(1)

    elif args.urls:
        logging.info(f"Loading URLs from file: {args.urls}")
        urls_to_crawl = load_urls_from_file(args.urls)

    elif args.seed_only:
        logging.info("Using seed URLs from configuration")
        urls_to_crawl = SEED_URLS

    else:
        # Default: use seed URLs
        logging.info("No URL source specified, using seed URLs")
        urls_to_crawl = SEED_URLS

    if not urls_to_crawl:
        logging.error("No URLs to crawl")
        sys.exit(1)

    # Remove duplicates while preserving order
    urls_to_crawl = list(dict.fromkeys(urls_to_crawl))

    logging.info(f"Starting crawl of {len(urls_to_crawl)} URLs")

    # Run the crawl
    try:
        results = crawler.run_batch_crawl(urls_to_crawl)

        # Print summary
        print(f"\nCrawl Summary:")
        print(f"Total URLs: {results['total_urls']}")
        print(f"Successful: {results['successful']}")
        print(f"Failed: {results['failed']}")
        print(f"Success Rate: {results['success_rate']:.1f}%")
        print(f"Campsites Found: {results['campsites_found']}")
        print(f"Total Time: {results['total_time']:.1f}s")

        # Save results
        save_results(results, args.output)

        # Screenshots (if requested)
        if args.screenshot:
            logging.info("Taking screenshots of successful URLs...")
            import asyncio

            async def take_screenshots():
                successful_urls = [r['url'] for r in results['results'] if r['success']]
                for url in successful_urls[:5]:  # Limit to first 5 for demo
                    screenshot_url = await crawler.take_screenshot(url)
                    if screenshot_url:
                        logging.info(f"Screenshot saved: {screenshot_url}")

            asyncio.run(take_screenshots())

        logging.info("Crawl completed successfully")

    except KeyboardInterrupt:
        logging.info("Crawl interrupted by user")
        sys.exit(1)
    except Exception as e:
        logging.error(f"Crawl failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
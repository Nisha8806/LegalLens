#!/usr/bin/env python3
"""
Check what sci.gov.in's robots.txt currently allows before any automated
fetching. Run this yourself, from the machine that will do the collecting —
its answer can change over time and this repo can't verify it for you.

Usage:
    python scripts/check_robots.py
    python scripts/check_robots.py --path /judgements-judgement-date/
"""
import argparse
import sys
import urllib.robotparser
from urllib.parse import urljoin

BASE_URL = "https://www.sci.gov.in/"
ROBOTS_URL = urljoin(BASE_URL, "/robots.txt")

CANDIDATE_PATHS = [
    "/",
    "/judgements-judgement-date/",
    "/judgements-orders/",
    "/latest-orders/",
    "/case-status/",
    "/search/",
]

USER_AGENTS_TO_CHECK = [
    "*",
    "LegalLensBot",
    "Googlebot",
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", action="append", default=None,
                         help="Extra path(s) to check, e.g. /some-page/")
    args = parser.parse_args()

    paths = CANDIDATE_PATHS + (args.path or [])

    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(ROBOTS_URL)
    try:
        rp.read()
    except Exception as e:
        print(f"Could not fetch {ROBOTS_URL}: {e}", file=sys.stderr)
        print("Treat this as 'unknown' — do not assume permission.", file=sys.stderr)
        sys.exit(1)

    print(f"robots.txt source: {ROBOTS_URL}\n")
    any_disallowed = False
    for ua in USER_AGENTS_TO_CHECK:
        print(f"User-agent: {ua}")
        for path in paths:
            url = urljoin(BASE_URL, path)
            allowed = rp.can_fetch(ua, url)
            if not allowed:
                any_disallowed = True
            print(f"  {'ALLOWED    ' if allowed else 'DISALLOWED '} {path}")
        crawl_delay = rp.crawl_delay(ua)
        if crawl_delay:
            print(f"  crawl-delay: {crawl_delay}s")
        print()

    print("-" * 60)
    print("robots.txt only governs crawling permission, not licensing.")
    print("Before any bulk collection, also manually check the site's")
    print("Terms of Use / copyright notice (linked from the sci.gov.in")
    print("footer) and whether the pages you need require a CAPTCHA or")
    print("login — robots.txt won't tell you that, and those must never")
    print("be bypassed regardless of what robots.txt says.")
    if any_disallowed:
        print("\n>>> At least one checked path is DISALLOWED for at least")
        print(">>> one user-agent above. Do not automate requests to it —")
        print(">>> use the manual workflow in docs/DATA_COLLECTION_WORKFLOW.md")
        print(">>> for that path instead.")


if __name__ == "__main__":
    main()

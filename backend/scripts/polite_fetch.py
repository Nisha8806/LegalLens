#!/usr/bin/env python3
"""
Template for a conservative, robots.txt-respecting fetch of ONE page/PDF
that check_robots.py has already confirmed is allowed. Not a bulk crawler —
call it in a loop yourself, over a list of URLs you've manually vetted, with
your own judgment about volume.

Design choices, all deliberate:
  - re-checks robots.txt immediately before every single request
    (permissions can change; don't cache a stale "yes")
  - fixed minimum delay between requests (default 5s, be more conservative
    for a government site, not less)
  - honest User-Agent identifying the project and a contact method
  - stops on 403/429/CAPTCHA-looking responses instead of retrying
  - never touches any URL that requires login or solves a CAPTCHA

Usage:
    python scripts/polite_fetch.py <url> <output_path>
"""
import sys
import time
import urllib.robotparser
from urllib.parse import urljoin, urlparse

try:
    import requests
except ImportError:
    sys.exit("pip install requests")

USER_AGENT = "LegalLensResearchBot/1.0 (+contact: <fill in your email/contact URL>)"
MIN_DELAY_SECONDS = 5
CAPTCHA_MARKERS = ("captcha", "verify you are human", "recaptcha")


def robots_allow(url: str) -> bool:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    rp.read()
    return rp.can_fetch(USER_AGENT, url)


def fetch(url: str, output_path: str):
    if not robots_allow(url):
        print(f"robots.txt disallows this URL right now — refusing to fetch: {url}")
        return False

    time.sleep(MIN_DELAY_SECONDS)
    resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)

    if resp.status_code in (401, 403, 429):
        print(f"Got {resp.status_code} from {url} — stopping, not retrying. "
              f"This usually means access isn't permitted here; use the manual workflow instead.")
        return False

    body_snippet = resp.text[:2000].lower() if resp.headers.get("content-type", "").startswith("text") else ""
    if any(marker in body_snippet for marker in CAPTCHA_MARKERS):
        print(f"Response looks like a CAPTCHA/verification page — stopping. "
              f"Do not attempt to solve it programmatically; use the manual workflow.")
        return False

    resp.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(resp.content)
    print(f"Saved {url} -> {output_path}")
    return True


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Usage: python scripts/polite_fetch.py <url> <output_path>")
    ok = fetch(sys.argv[1], sys.argv[2])
    sys.exit(0 if ok else 1)

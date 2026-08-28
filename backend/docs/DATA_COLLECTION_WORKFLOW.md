# Data Collection Workflow — Supreme Court of India judgments

**I did not scrape sci.gov.in for this deliverable.** I have no live network
access from this environment, and more importantly, bulk automated
collection should never be the default even when it's technically possible —
it has to be checked against the site's current `robots.txt` and Terms of
Use *at the time you run it*, by whoever is running it, from a machine
that will actually make the requests. Below is (1) how to check that
correctly, and (2) a manual/permitted workflow that works regardless of
what the check finds, plus the loader scripts to go with it.

## 1. Before any automated request: check permissions yourself

Run this first, from the machine that will do the collecting:

```bash
python scripts/check_robots.py
```

It fetches `https://www.sci.gov.in/robots.txt`, parses it with Python's
standard `urllib.robotparser`, and tells you which paths (if any) are
disallowed for a generic crawler and for common bot user-agents. It also
prints a reminder to check the site's linked Terms of Use / copyright page,
since `robots.txt` covers crawling but not licensing.

Treat the result as informational, not a green light — a few things
`robots.txt` never tells you:
- Whether the site sits behind CAPTCHA or session-based access for search
  results (many Indian court portals do, including the SCI's own e-SCR
  search). **Do not attempt to bypass either** — that's excluded by your
  brief and by general good practice regardless.
- Rate limits that aren't published anywhere.
- Copyright terms on the judgment text itself (judgments are generally
  public record / government works in India, but confirm current wording
  on the site's copyright page rather than assuming).

If `check_robots.py` reports disallowed paths for the judgment/order
listing or search endpoints, or if reaching them requires a login/CAPTCHA
step, **don't automate that part** — use the manual workflow in section 2
for those paths, and reserve automation for whatever is left, e.g. the
Open Government Data license text or an official bulk export if SCI/NIC
publishes one.

## 2. Manual / permitted collection workflow (default — always works)

This is the one to actually use. It respects rate limits and access
controls by construction, because a person is doing the fetching through
the normal website UI.

1. **Browse the official source.** Go to `https://www.sci.gov.in/` →
   Judgments / Orders, or the **e-SCR** portal it links to
   (`https://www.sci.gov.in/judgements-judgement-date/` or similar; the
   exact path changes over time, so navigate from the homepage rather than
   guessing a URL).
2. **For each case you want**, record the page's own metadata into
   `data/manual_metadata/cases_template.csv` (provided in this repo):
   case title, case number, judgment date, bench, petitioner, respondent,
   the case's own **source URL** (the page you found it on), and the
   **direct PDF URL** if the site exposes one.
3. **Download the judgment PDF** through the browser, save it under
   `data/raw_pdfs/<case_id>.pdf`. This is a normal, permitted single-file
   download of a public document — not bulk scraping.
4. **Never fill in the analytical fields by hand from memory.** Facts,
   issues, reasoning, and the final order get *extracted from the PDF text*
   by `scripts/ingest_pdf.py` in step 3 below — not typed in based on what
   you recall the case being about. If a field isn't in the PDF, leave it
   blank rather than guessing.
5. Repeat for as many cases as you need. This scales to tens of cases
   comfortably; for hundreds, see section 3.

## 3. If you need real bulk volume

Two options that stay inside the brief's rules — pick based on what
`check_robots.py` and the site's own terms actually allow when you check:

- **A permitted bulk export**, if the Supreme Court / NIC (National
  Informatics Centre) publishes one — e.g. via `data.gov.in`, the Open
  Government Data (OGD) platform, or a stated e-SCR bulk-download
  facility. Search `data.gov.in` for "Supreme Court judgments" — this is
  the correct place to look for an authorized bulk dataset before writing
  any scraper.
- **A rate-limited, robots.txt-respecting crawl of only the paths that
  `check_robots.py` confirms are allowed**, run by a human who monitors
  it — never against a path that needs login/CAPTCHA. `scripts/polite_fetch.py`
  is a template for this: it re-checks `robots.txt` before every request,
  hardcodes a conservative delay (default 5s) between requests, sends an
  honest `User-Agent` identifying the project and a contact, and stops
  immediately on a 403/429 rather than retrying harder.

## 4. Loading what you collected

Once you have PDFs in `data/raw_pdfs/` and a filled-in
`data/manual_metadata/cases_template.csv`:

```bash
python scripts/load_case_metadata.py data/manual_metadata/cases_template.csv
python scripts/ingest_pdf.py --case-id sci-2023-civilappeal-1234 --pdf data/raw_pdfs/sci-2023-civilappeal-1234.pdf
python scripts/clean_and_chunk.py --case-id sci-2023-civilappeal-1234
python scripts/generate_embeddings.py --case-id sci-2023-civilappeal-1234
```

`ingest_pdf.py` extracts and stores the *verbatim* text (`cases.facts_of_case`,
`main_legal_issues`, `final_judgment_order`) directly from the PDF where the
judgment's own structure makes those sections identifiable — it does not
paraphrase. Anything that requires interpretation (a plain-English case
summary, "important legal principles" phrased for a search index, argument
comparison) is generated separately and written only to
`case_ai_annotations`, tagged with the model name and a confidence score,
and defaults to `human_verified = false` until a lawyer reviews it — see
`scripts/generate_ai_annotations.py`.

## Summary of what's automated vs. manual in this deliverable

| Step | Automated here? |
|---|---|
| Checking robots.txt / ToS | Script provided (`check_robots.py`), **you run it** |
| Finding & downloading judgment PDFs | **Manual**, via the browser |
| Recording case metadata (title, number, date, bench, parties, source URL) | **Manual**, from the page you're on |
| Extracting facts/issues/reasoning/order text from the PDF | Automated (`ingest_pdf.py`), from the file you downloaded |
| Cleaning + chunking for RAG | Automated (`clean_and_chunk.py`) |
| Embeddings + pgvector storage | Automated (`generate_embeddings.py`) |
| AI summaries / principles / argument analysis | Automated but clearly labeled `ai_generated`, unverified by default |
| Bulk crawling of sci.gov.in | **Not performed by me; only a polite, robots.txt-checked template provided** — run at your own discretion after step 1 |

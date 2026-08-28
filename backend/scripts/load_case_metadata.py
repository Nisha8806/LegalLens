#!/usr/bin/env python3
"""
Load the manually-filled cases_template.csv (fields 1-8, 20-21 — the parts a
human copies straight off the official sci.gov.in / e-SCR page) into
`cases`, `judges`, `case_bench`, `laws`, `legal_sections`, `case_legal_sections`.

This is the ONLY place case identity/citation/party data enters the system —
by design, nothing here is inferred or generated; every value must trace
back to what a human read on the source page.

Usage:
    python scripts/load_case_metadata.py data/manual_metadata/cases_template.csv
"""
import csv
import sys
sys.path.insert(0, ".")
from app.db import get_cursor


def get_or_create_judge(cur, full_name):
    cur.execute("SELECT judge_id FROM judges WHERE full_name = %s", (full_name,))
    row = cur.fetchone()
    if row:
        return row["judge_id"]
    cur.execute("INSERT INTO judges (full_name) VALUES (%s) RETURNING judge_id", (full_name,))
    return cur.fetchone()["judge_id"]


def get_or_create_law(cur, act_name):
    act_name = act_name.strip()
    cur.execute("SELECT law_id FROM laws WHERE act_name = %s", (act_name,))
    row = cur.fetchone()
    if row:
        return row["law_id"]
    cur.execute("INSERT INTO laws (act_name) VALUES (%s) RETURNING law_id", (act_name,))
    return cur.fetchone()["law_id"]


def get_or_create_section(cur, law_id, section_number):
    section_number = section_number.strip()
    cur.execute("SELECT section_id FROM legal_sections WHERE law_id = %s AND section_number = %s",
                (law_id, section_number))
    row = cur.fetchone()
    if row:
        return row["section_id"]
    cur.execute("INSERT INTO legal_sections (law_id, section_number) VALUES (%s, %s) RETURNING section_id",
                (law_id, section_number))
    return cur.fetchone()["section_id"]


def load(csv_path):
    with open(csv_path, newline="", encoding="utf-8") as f, get_cursor() as cur:
        reader = csv.DictReader(f)
        n = 0
        for row in reader:
            if not row.get("case_id"):
                continue
            cur.execute("""
                INSERT INTO cases (case_id, case_title, case_number, citation, neutral_citation,
                    judgment_date, petitioner, respondent, case_type, source_url, document_url,
                    collection_method)
                VALUES (%(case_id)s, %(case_title)s, %(case_number)s, %(citation)s, %(neutral_citation)s,
                    NULLIF(%(judgment_date)s,'')::date, %(petitioner)s, %(respondent)s, %(case_type)s,
                    %(source_url)s, %(document_url)s, 'manual_download')
                ON CONFLICT (case_id) DO UPDATE SET
                    case_title = EXCLUDED.case_title, case_number = EXCLUDED.case_number,
                    citation = EXCLUDED.citation, neutral_citation = EXCLUDED.neutral_citation,
                    judgment_date = EXCLUDED.judgment_date, petitioner = EXCLUDED.petitioner,
                    respondent = EXCLUDED.respondent, case_type = EXCLUDED.case_type,
                    source_url = EXCLUDED.source_url, document_url = EXCLUDED.document_url
            """, row)

            for judge_name in filter(None, (j.strip() for j in row.get("bench_judges", "").split(";"))):
                judge_id = get_or_create_judge(cur, judge_name)
                cur.execute("""
                    INSERT INTO case_bench (case_id, judge_id) VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (row["case_id"], judge_id))

            for act_name in filter(None, (a.strip() for a in row.get("acts_mentioned", "").split(";"))):
                law_id = get_or_create_law(cur, act_name)
                cur.execute("""
                    INSERT INTO case_laws (case_id, law_id) VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (row["case_id"], law_id))

            # legal_sections format: "Act Name:Section 73; Act Name:Section 74"
            for entry in filter(None, (s.strip() for s in row.get("legal_sections", "").split(";"))):
                if ":" not in entry:
                    continue
                act_name, section_number = entry.split(":", 1)
                law_id = get_or_create_law(cur, act_name)
                section_id = get_or_create_section(cur, law_id, section_number)
                cur.execute("""
                    INSERT INTO case_legal_sections (case_id, section_id) VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (row["case_id"], section_id))

            n += 1
        print(f"Loaded/updated {n} case(s) from {csv_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python scripts/load_case_metadata.py <csv_path>")
    load(sys.argv[1])

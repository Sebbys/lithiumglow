import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from markdownify import markdownify as md
from pathlib import Path
from urllib.parse import urljoin

URL = "https://nextjs.org/docs/app"

response = requests.get(URL, timeout=30)
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")
article = soup.find("article")
if not article:
    raise SystemExit("Could not find article element in docs page.")

header_block = article.find("div", attrs={"data-docs": True})
title = "App Router"
intro_paragraphs = []

if header_block:
    title_tag = header_block.find(["h1", "h2"])
    if title_tag:
        title = title_tag.get_text(strip=True)
    for paragraph in header_block.find_all("p"):
        text = md(str(paragraph), heading_style="ATX").strip()
        if text:
            intro_paragraphs.append(text)

next_steps_heading = article.find("h2", id="next-steps")
next_steps_summary = ""
cards = []

if next_steps_heading:
    next_steps_section = next_steps_heading.parent
    summary_div = next_steps_section.find("div", class_="mt-2")
    if summary_div:
        next_steps_summary = md(str(summary_div), heading_style="ATX").strip()

    grid = next_steps_section.find("div", class_="mt-8")
    if grid:
        for link in grid.find_all("a", href=True):
            card_title_tag = link.find(["h3", "h4"])
            card_title = card_title_tag.get_text(" ", strip=True) if card_title_tag else "Untitled"

            summary_candidates = [
                md(str(div), heading_style="ATX").strip()
                for div in link.find_all("div")
            ]
            card_summary = next((text for text in reversed(summary_candidates) if text), "")

            card_url = urljoin(URL, link["href"])
            cards.append((card_title, card_summary, card_url))

timestamp = datetime.now(timezone.utc).isoformat()

lines = [
    "# Next.js App Router Docs Snapshot (Next.js 16)",
    "",
    f"- Source: {URL}",
    f"- Retrieved: {timestamp}",
    "",
    f"## {title}",
    "",
]

for paragraph in intro_paragraphs:
    lines.append(paragraph)
    lines.append("")

if lines[-1] == "":
    lines.pop()

if next_steps_heading:
    lines.append("")
    lines.append("## Next Steps")
    lines.append("")
    if next_steps_summary:
        lines.append(next_steps_summary)
        lines.append("")
    for card_title, card_summary, card_url in cards:
        lines.append(f"### [{card_title}]({card_url})")
        lines.append("")
        if card_summary:
            lines.append(card_summary)
            lines.append("")
    if lines[-1] == "":
        lines.pop()

output_path = Path("NEXTJS16_APP_DOCS.md")
output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

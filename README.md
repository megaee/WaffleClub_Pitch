# WaffleClub · Online shop & pitch

> What if your waffle iron cost €1? WaffleClub is a smart waffle iron for €1, plus a batter subscription.

This repository turns the **WaffleClub E-Commerce group pitch** (`WaffleClub_Pitch.pptx`, 17 slides) into a working, responsive website:

- **The online shop** (Task 2, slides 9–15): every page from the sitemap, with a working cart, checkout, order confirmation and customer account.
- **The pitch** (`/pitch/`): every slide (1–17) as a web section, including all presenter notes, the three customer journeys, the sitemap diagram, live previews of the shop pages and an interactive KPI dashboard.

It is a **university prototype**. No real orders are placed and no payment is taken. Cart, orders and the demo account are stored only in the visitor's browser.

## Pages

| Path | Slide | What it does |
| --- | --- | --- |
| `/` | 10, 11 | Home: hook, plan selector (Family pre-selected, "Most popular"), CTA, trust line, food photo; How it works (3 steps), this month's flavours, FAQ, WaffleBot |
| `/how-it-works/` | 9 | 4 steps · What's in the box · The iron (specs) |
| `/shop/` | 12 | Build your box: Step 1 plan, Step 2 delivery, Step 3 flavours (max. 3), Party Box, live "Your box" summary, add to cart |
| `/flavours/` | 9 | 6 flavours with filter: vegan, gluten-free, savoury (deep-linkable `?filter=`) |
| `/gifts/` | 13 | 1, 3 or 6 months ("Most gifted"), message + date, gift wrap, validation |
| `/gifts/redeem/` | 7 | Recipient greeting "A gift from Tom" + own plan with first month 50% off |
| `/help/` | 9, 11 | FAQ · Shipping & returns · Contact form with validation |
| `/cart/` | 9, 14 | Quantities, remove with undo, order summary, discounts |
| `/checkout/` | 14 | One short page: address (validated), Klarna / PayPal / Apple Pay, order summary, "Place order" |
| `/confirmation/` | 9 | Order confirmation, next steps, receipt print |
| `/account/` | 15 | My WaffleClub: skip next box (1 click, undo), pause 1–3 months, change plan Single ↔ Family, change flavours, invite friends (€5 referral link), cancel (with "Skip next month instead?" offer), orders & invoices |
| `/imprint/`, `/privacy/`, `/terms/` | 9 | Footer legal pages |
| `/pitch/` | 1–17 | The full pitch deck as a website |

Header on every page: logo (back to Home) · 5 links (How it works, Shop, Flavours, Gifts, Help) · account + cart icons · CTA pill. Footer: Imprint · Privacy · Terms · Contact.

## WaffleBot

The AI assistant from slide 11 is implemented as a **scripted** assistant (GitHub Pages has no backend). It only answers with facts from the pitch, hands questions it can't answer from the pitch (for example "Is the iron safe for kids?") to a human, and when someone asks about cancelling it offers "Skip next month instead?" (Journey 2). As on the slide it is labelled "Answered by AI · a human is one click away".

## Content sources

The PowerPoint is the single source of truth. Where a slide names something without giving the details (the sitemap's "6 flavours", "4 steps", "The iron (specs)", "What's in the box", "Shipping & returns", "Contact"), the details come from the team's own prototype that the deck links to on slides 8 and 17 (`claude.ai/artifact/Q8YUzUdt3pEPmFhRo4rHCx`). Where the two differ, the deck wins (e.g. Strawberry Sunday is included as on slide 11; only the three payment methods from slide 14 are offered).

See [`docs/TRACEABILITY.md`](docs/TRACEABILITY.md) for a slide-by-slide checklist of every requirement and where it is implemented.

## Design

Colours, fonts and imagery come from the deck: ink `#2B1A10`, caramel `#E39B2D`, berry `#B5452F`, sage `#3E7D5A`, cream `#F8EEDF`; **Agbalumo** for display text (used throughout the deck), **Cinzel Decorative** and **Cambria** for the title slide, plus Nunito Sans for long body copy and forms. Photos are the deck's Pexels images (free licence). Visual details were checked against the deck's PDF export, page by page. The layout is responsive for desktop, tablet and mobile.

## Run locally

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Structure

```
index.html                 Home
how-it-works/ shop/ flavours/ gifts/ gifts/redeem/ help/
cart/ checkout/ confirmation/ account/
imprint/ privacy/ terms/   Legal
pitch/                     The pitch deck (slides 1–17)
404.html
assets/css/styles.css      Shop design system
assets/css/pitch.css       Pitch page
assets/js/app.js           Data, state, header/footer, cart, WaffleBot, page logic
assets/img, assets/icons   Images and icons from the deck
docs/TRACEABILITY.md       Slide-by-slide requirement checklist
```

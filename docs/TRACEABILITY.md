# Slide-by-slide traceability

Each requirement from `WaffleClub_Pitch.pptx` and where it is implemented. The text was checked against the PDF export (`WaffleClub_Pitch.pptx.pdf`, 17 pages): it is identical on every page. The shop's design follows the PDF rendering (caramel header button, wordmark logo, Agbalumo copy, plain flavour labels, highlighted Pause card). ✅ = implemented and tested in the browser (desktop 1366 px, tablet 768 px, mobile 375 px).

## Slide 1 · Title
| Content | Where |
| --- | --- |
| "WHAT IF YOUR WAFFLE IRON COST" · "€1?" · "WaffleClub" · "A smart waffle iron for €1, plus a batter subscription" · "E-Commerce · Group pitch" · waffle icon in caramel ring · presenter notes | `/pitch/#s1` ✅ |

## Slide 2 · Nespresso for waffles
| Content | Where |
| --- | --- |
| 1€ "smart iron when you subscribe" / "The batter is the subscription" | `/pitch/#s2` ✅ |
| Scan / Shake / Bake with icons and texts | `/pitch/#s2`, Home How it works ✅ |
| Plans / month: Single €9.99 4 pouches · Family €19.99 10 pouches (highlighted) · Party Box on demand, events | `/pitch/#s2` (rows link to the shop) ✅ |
| Customers: cheap to start · no waste · new flavours · vegan & gluten-free | `/pitch/#s2` ✅ |
| Company: recurring revenue · flavour data · loyalty, as mixes fit the iron | `/pitch/#s2` ✅ |
| Notes: flavours rotate monthly incl. vegan, gluten-free, savoury | Flavours page lead, FAQ, WaffleBot ✅ |

## Slide 3 · Task 1: Customer Journeys
| Content | Where |
| --- | --- |
| TASK 1 · Customer Journeys · subtitle · Awareness → Consideration → Acquisition → Service → Loyalty · family photo | `/pitch/#s3` ✅ |

## Slide 4 · Target groups & personas
| Content | Where |
| --- | --- |
| Lisa, 38 · The busy family · Instagram Reel · Buys the Family plan · Key moment | `/pitch/#s4` ✅ |
| Leo, 22 · The student on a budget · referral link · Buys the Single plan · Key moment | `/pitch/#s4` ✅ |
| Tom, 45 · The gift buyer · Google search · Buys a 3-month gift box · Key moment | `/pitch/#s4` ✅ |

## Slides 5–7 · Journeys (text on the pitch page, features in the shop)
| Journey step | Shop feature |
| --- | --- |
| Lisa: filters for gluten-free | `/flavours/?filter=gluten-free` ✅ |
| Lisa: asks the AI chat "Is the iron safe for kids?" | WaffleBot chip + hand-off to a human ✅ |
| Lisa: PayPal checkout, €1 iron + Family plan €19.99, first box ships in 2 days | `/checkout/` (PayPal pre-selected), confirmation text ✅ |
| Lisa: QR auto-setting, recipe tips | How it works, gift greeting ✅ |
| Lisa: AI suggests a Party Box, shares referral code | `/account/` WaffleBot suggestion + Invite friends ✅ |
| Leo: friend's referral link | `?ref=CODE` banner + €5 discount in cart ✅ |
| Leo: price per waffle and "cancel anytime" on mobile | Shop plan cards (≈ €0.62 / €0.50 per waffle), FAQ, responsive layout ✅ |
| Leo: Apple Pay, Single €9.99 | `/checkout/` Apple Pay option ✅ |
| Leo: wants to cancel, AI offers "Skip next month instead?" | `/account/` Cancel plan dialog + WaffleBot cancel answer ✅ |
| Leo: savoury mixes, invites friends | `/flavours/?filter=savoury`, Invite friends ✅ |
| Tom: gift page, 3-month box, Gingerbread, personal message | `/gifts/` (3 months default, flavour, message) ✅ |
| Tom: pays once, delivery 23 December, gift-wrapped | Gift date defaults to 23 Dec, gift-only order shows "One-time payment" ✅ |
| Tom: sister scans QR code, app greets "A gift from Tom" | `/gifts/redeem/` ✅ |
| Tom: AI offers her own plan, first month 50% off | `/gifts/redeem/` → `/shop/?offer=gift50` discount ✅ |
| Moment-of-truth lines and all presenter notes | `/pitch/#s5`–`#s7` ✅ |

## Slide 8 · Task 2: Online Shop
| Content | Where |
| --- | --- |
| TASK 2 · Online Shop · subtitle · "Try it live: claude.ai/artifact/Q8YUzUdt3pEPmFhRo4rHCx" · waffle photo | `/pitch/#s8` (+ button to this site) ✅ |

## Slide 9 · Sitemap & navigation
| Requirement | Where |
| --- | --- |
| Home | `/` ✅ |
| How it works: 4 steps · What's in the box · The iron (specs) | `/how-it-works/` ✅ |
| Shop: Step 1 plan · Step 2 delivery · Step 3 flavours · Party Box | `/shop/` ✅ |
| Flavours: 6 flavours · Filter: vegan, gluten-free, savoury | `/flavours/` ✅ |
| Gifts: 1, 3 or 6 months · Message + date · Gift wrap | `/gifts/` ✅ |
| Help: FAQ · Shipping & returns · Contact | `/help/` ✅ |
| My account: Skip or pause a box · Change plan · Invite friends | `/account/` ✅ |
| From every page: Cart → Checkout → Order confirmation → My account | Header cart icon on every page, `/cart/` → `/checkout/` → `/confirmation/` → `/account/` ✅ |
| Header: logo · 5 links · account + cart | Every page (logo links Home) ✅ |
| Footer: imprint · privacy · terms · contact | Every page ✅ |
| Sitemap diagram | `/pitch/#s9` (every node links to its page) ✅ |

## Slide 10 · Home (first screen)
| Requirement | Where |
| --- | --- |
| waffleclub.de · nav How it works · Shop · Flavours · Gifts · Help · "Start now" | Header ✅ |
| SMART WAFFLE IRON + BATTER SUBSCRIPTION · "Your waffle iron for €1." · "Fresh batter pouches every month. Scan, shake, bake: perfect waffles in four minutes." | `/` ✅ |
| Single €9.99 4 pouches / month · Family €19.99 10 pouches / month MOST POPULAR (pre-selected) · Party Box €29 one box, any time | `/` plan selector ✅ |
| "Start my WaffleClub →" (dark) · "Give it as a gift" (quiet link) | `/` (button carries the selected plan to the shop) ✅ |
| ✓ Free delivery ✓ Skip or pause anytime ✓ PayPal · Apple Pay · Klarna | `/` ✅ |
| Large real food photo on the right | `/` ✅ |

## Slide 11 · Home (scrolling down)
| Requirement | Where |
| --- | --- |
| waffleclub.de/#how-it-works | `/#how-it-works` anchor ✅ |
| 1 Scan the pouch / 2 Add milk, shake / 3 Bake, with photos and texts | `/` ✅ |
| This month's flavours: Classic Buttermilk (in every plan), Berry Crush (vegan), Strawberry Sunday (gluten-free) | `/` ✅ |
| FREQUENTLY ASKED: 4 questions as accordions | `/` (answers from the deck) ✅ |
| WaffleBot · AI assistant: "Is Family enough for 4 people?" → "Yes! 10 pouches make about 40 waffles a month. Shall I start Family for you?" | `/` inline chat (working input) + floating chat on other pages ✅ |
| "Answered by AI · a human is one click away" | Chat footer → `/help/#contact` ✅ |

## Slide 12 · Shop (build your box)
| Requirement | Where |
| --- | --- |
| waffleclub.de/shop · "Shop" underlined in nav | `/shop/` ✅ |
| "Build your box" · "Step 1: choose a plan. The smart iron costs €1 with every plan." | `/shop/` ✅ |
| Plan cards with Family MOST POPULAR | `/shop/` ✅ |
| STEP 2: EVERY 4 WEEKS ✓ · STEP 3: 2 FLAVOURS ✓ | Live status line ✅ |
| Your box: Family plan · €19.99 / month · Smart waffle iron · €1.00 · Delivery · free · Every 4 weeks · Classic, Berry Crush · Skip, pause or cancel in your account | Live summary (identical text by default) ✅ |
| Add to cart · €20.99 | `/shop/` ✅ |

## Slide 13 · Gifts
| Requirement | Where |
| --- | --- |
| waffleclub.de/gifts · HOME / GIFTS · "Give waffles, not socks" · "Iron and pouches, gift-wrapped, delivered on your date. You pay once." | `/gifts/` ✅ |
| 1 month €12.99 4 pouches · 3 months €29.97 12 pouches MOST GIFTED · 6 months €54.99 24 pouches | `/gifts/` ✅ |
| "Add gift to cart →" · "Add a personal message" | `/gifts/` (message field revealed by the link, 240-char counter) ✅ |
| ✓ Gift wrap + card ✓ Delivery date of your choice ✓ No subscription for you · gifts photo | `/gifts/` ✅ |

## Slide 14 · Cart & checkout
| Requirement | Where |
| --- | --- |
| waffleclub.de/cart · header pill "Cart (1)" | `/cart/`, `/checkout/` ✅ |
| "Checkout" · "Delivery to: Lisa M., Dortmund. Choose your payment method:" | `/checkout/` (updates live from the address; example-address button) ✅ |
| Klarna pay later · PayPal 1 click SELECTED · Apple Pay Face ID | `/checkout/` (tag follows the selection) ✅ |
| SECURE SSL CHECKOUT · 14-DAY RIGHT OF WITHDRAWAL | `/checkout/` ✅ |
| Order summary: Family plan + smart iron €20.99 · Delivery (Germany) free · Total today €20.99 · "Then €19.99 every 4 weeks. Skip, pause or cancel in your account. Prices incl. 7% VAT." · "Place order · €20.99" | `/checkout/` ✅ |

## Slide 15 · My WaffleClub (account)
| Requirement | Where |
| --- | --- |
| waffleclub.de/account · header pill "My account" | `/account/` ✅ |
| MY WAFFLECLUB · FAMILY PLAN · ACTIVE · "Hi Lisa!" · "Next box: Fri, 4 Dec. Classic Buttermilk, Berry Crush and Gingerbread." | `/account/` (demo account) ✅ |
| Skip next box · 1 click · moves to 1 Jan | Working, with undo ✅ |
| Pause plan · 1–3 months · no cost | Dialog, resume ✅ |
| Change plan · anytime · Single ↔ Family | Dialog ✅ |
| "Invite friends · you both get €5" | Referral link dialog with copy/share ✅ |
| "Cancel plan" (visible and easy) | Dialog with "Skip next month instead?" offer, then cancel at end of month, reactivate ✅ |
| ✓ Cancel at the end of any month ✓ You keep the iron ✓ Orders & invoices | `/account/` + orders table + invoice (VAT 7%) with print ✅ |

## Slide 16 · KPIs & analytics
| Content | Where |
| --- | --- |
| ONE KPI PER JOURNEY STAGE · TRACKED IN GA4; five KPI cards with targets; Loyalty ★; north star KPI; notes | `/pitch/#s16`, with inputs that check your own numbers against each target ✅ |

## Slide 17 · Thank you
| Content | Where |
| --- | --- |
| THANK YOU · Questions? · summary line · "Online shop: claude.ai/artifact/Q8YUzUdt3pEPmFhRo4rHCx" · waffle photo · notes | `/pitch/#s17` ✅ |

## Kept verbatim from the deck
- Slide 6 card text "Get reffered by a friend" (spelling as in the deck).
- Slide 6 presenter notes call the persona "Jonas" while the slide says "Leo".
- Slide 6 notes mention "fifty percent off the first box" for referrals; the shop uses the slide-15 wording "you both get €5".

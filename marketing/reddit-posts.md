# ClauseCheck — Reddit Launch Posts

Rules for all posts:
- Post in subreddits that allow self-promo, or ask the mods first. Read each sub's rules before posting.
- Use the builder's personal account; engage with every comment in the first hour (Reddit algorithm + trust).
- NEVER post the same text twice across subs — adapt each version.

---

## r/SaaS — "Show-off Saturday" or a genuine "I built this" post

Title:
> I built a $12 browser extension that explains any ToS / contract / lease in plain English (one-time payment, no subscription) — because I got tired of signing things I don't read

Body:
> I'm the kind of person who reads the Terms of Service. And I still get burned — the last one had a clause saying they could change everything "at any time" and I'd automatically agree by just keeping the tab open.
>
> So I built ClauseCheck. It's a Chrome/Edge extension: highlight any legal text, right-click, and it gives you:
> - a plain-English summary of what the clause actually means
> - the specific red flags to worry about
> - a risk score (Low / Medium / High / Critical)
>
> It runs on Gemini, costs me almost nothing per request, and I made it a one-time $12 payment (crypto, since I couldn't easily take recurring payments) with no subscription and no account.
>
> Most interesting build decision: I went with crypto payments (NOWPayments) so I didn't need a merchant account or card processor — the whole thing (payments, AI, email, hosting) runs on free tiers.
>
> You can try it for free right on the landing page — paste any clause, no sign-up: clausecheck-1d1.pages.dev
>
> Honest feedback welcome — especially on pricing and whether $12 one-time beats a $3/mo SaaS model.

---

## r/productivity

Title:
> App that translates legalese into plain English — I made it after finally reading a rental lease

Body:
> I spent 40 minutes with a dictionary trying to understand my last lease. "Indemnify" apparently means "you pay their lawyers." Nobody tells you that.
>
> I built a tool that does this in ~5 seconds: select any contract/ToS text, and it explains what it means, lists the red flags, and gives a risk score. Chrome + Edge extension, one-time $12, no account.
>
> Free to try on the site (paste any text, no sign-up): clausecheck-1d1.pages.dev
>
> What's the scariest clause you've ever glossed over?

---

## r/chrome_extensions (or r/ChromeExtension)

Title:
> [Free to try] ClauseCheck — explain any selected legal text with a right-click (Chrome & Edge)

Body:
> Highlight a paragraph in a contract/ToS/lease → right-click → "Explain with ClauseCheck" → plain-English summary + red flags + risk score.
>
> - No accounts, no tracking. Text is processed and discarded.
> - Works in Chrome and Edge (currently distributed via ZIP + load-unpacked; store listings coming).
> - $12 one-time. Free demo on the landing page, no sign-up.
>
> Demo: clausecheck-1d1.pages.dev
>
> Happy to answer technical questions about the build (Worker + Gemini + KV).

---

## r/personalfinance (nominate via modmail first — they're strict)

Title: (question-framed, subtle)
> PSA: the word "indemnify" in your lease/contract means you might be paying someone else's legal bills

Body:
> Most people sign things where one sentence quietly transfers a ton of risk to them. Examples: "at any time" modification clauses, indemnification, automatic renewal, binding arbitration.
>
> A little tool I use now highlights text and explains clauses in plain English with a risk score. Free to try: clausecheck-1d1.pages.dev
>
> The free demo needs no sign-up — paste a clause from your own lease and see what it actually says.

---

## r/SideProject

Title:
> Side project update: ClauseCheck is live and processing real explanations — $12 one-time for a contract translator

Body:
> Stack is fully free-tier: Cloudflare Workers + Pages, Gemini, Brevo email, NOWPayments for crypto checkout. Cost per explanation is fractions of a cent, everything else $0.
>
> Biggest surprise: the NOWPayments minimum forced me to price at $12 instead of $5 (their per-payment floor ≈ $11.94).
>
> Trying the demo on the site is free — paste any legal text: clausecheck-1d1.pages.dev
>
> Would love critiques of the landing page copy before I do a bigger launch.

---

## r/legaladvice / r/freelance (check their promo rules)

- r/freelance: frame around "red flags to look for in client contracts" — share the tool as a companion, and genuinely give 3 real tips (kill fees, IP transfer, scope creep). Don't lead with the link.
- r/legaladvice: modmail first. Likely a no — don't push it.

## Where NOT to post
- r/iama, r/startups (unless a "rate my product" thread), subreddits with zero-tolerance self-promo rules.
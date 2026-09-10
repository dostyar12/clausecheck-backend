# Edge Add-ons Store Submission — ClauseCheck

## What you have already (do this first)
- Extension ZIP (manifest at root, MV3, store-clean):
  `clausecheck\clausecheck-edge.zip` (also served at landing page)
- Screenshots: 3 PNGs already at `C:\Users\dosty\OneDrive\Pictures\Screenshots\`
- Privacy policy: https://clausecheck-1d1.pages.dev/privacy
- **Reviewer license key (put in Test Notes): `CC-A177-1EF2-4CA2`**

## Step-by-step (~20 minutes, free)

1. **Sign up to Microsoft Partner Center**
   - Go to https://partner.microsoft.com/en-us/dashboard/microsoftedge and sign in with your Microsoft account (Outlook/Hotmail/Xbox accounts work; create one free if needed).
   - Accept terms → choose **Individual/Non-corporate account** → fill in publisher display name + contact email.
   - Check the **"third-party certification" / publisher attestation** box.
   - Microsoft sends a verification email — click it.

2. **Create the submission**
   - In the Edge Add-ons dashboard → **"Add new extension"**.
   - Choose **"Extension"** → upload `clausecheck-edge.zip`.

3. **Store listing fields (paste-ready)**
   - **Name:** `ClauseCheck — Explain Any Contract`
   - **Short description (max ~75 chars):** `Highlight any contract, lease, or ToS. Get the risks explained in plain English.`
   - **Long description:** use the block below.
   - **Category:** Productivity
   - **Privacy policy URL:** `https://clausecheck-1d1.pages.dev/privacy`
   - **Screenshot 1:** user's first screenshot (shows result panel) — 1280×800 recommended.
   - **Screenshots 2-5:** remaining two + (optional) shots of popup + landing page demo.
   - **Test notes:** `Install the extension, then activate with license key CC-A177-1EF2-4CA2 in the popup. Select any legal text on any page, right-click → "Explain this with ClauseCheck". Verify the result panel shows a plain-English summary, red flags, and a risk score.`
   - **Permissions justification:** `contextMenus — the "Explain with ClauseCheck" right-click action; activeTab + scripting — injects the explainer only on the tab you right-click; storage — saves your license key locally. No host permissions, no data collection.`

4. **Submit** → review typically takes **a few business days**. Test notes make approval smooth because the reviewer can fully test.

## Long description (paste below the short one)

> ClauseCheck explains any contract, Terms of Service, lease, or legal text in plain English — in about five seconds.
>
> How it works: select any legal text on any page, right-click, and choose "Explain this with ClauseCheck." The extension returns three things:
> - A plain-English summary of what the clause actually means
> - The specific red flags you should worry about
> - A risk score: Low / Medium / High / Critical
>
> Built for freelancers signing client contracts, renters reading leases, and anyone who's one "I Agree" click away from agreeing to something they don't understand.
>
> No accounts, no tracking, no data collection. Selected text is sent to an AI service (Google Gemini) for analysis and is processed and discarded immediately; your license key is stored only in your browser.
>
> One-time purchase, no subscription — supported by the license key in your inbox after payment.

## After approval (important)
- The Edge store gives you a live install link — put it on the landing page next to the manual ZIP install.
- Edge store hosts the version that fits the ZIP you upload. **Every future extension change must be re-uploaded** (re-zip from `clausecheck\extension\`, then resubmit the change).

## If Edge rejects (top causes + fixes)
- **"Could not unpack"** → ZIP has a nested folder. Re-zip with manifest.json at the ZIP root (already the case here).
- **"Remote code" concerns** → none: code fetches only an API for explanations (allowed; not remote JS execution).
- **Permission over-reach** → we use only contextMenus/activeTab/scripting/storage — the minimum.
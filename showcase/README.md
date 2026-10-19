# ShelfBuddy — Mobile Showcase

A standalone presentation shell that embeds the **live** ShelfBuddy app
(`https://shelfbuddy-mvp.onrender.com`) inside a CSS-only smartphone frame, so
the app's real responsive mobile layout renders authentically — like opening a
Figma mobile prototype in fullscreen.

This folder is completely independent of the React app in `../src` and the
backend in `../server`. It contains only static files and recreates none of
ShelfBuddy's components, styles, or logic.

## Files

- `index.html` — presentation page: themed background, centred phone, iframe.
- `styles.css` — the CSS-only device frame and responsive behaviour.
- `showcase.js` — scales the whole phone to fit short viewports (no clipping).

## Run locally

It's plain static HTML — open `index.html` in a browser, or serve the folder:

```bash
npx serve showcase
```

## Deploy as a SECOND Render Static Site (do not touch the existing service)

The existing Web Service at `https://shelfbuddy-mvp.onrender.com` stays exactly
as it is. Create a **new** Render **Static Site** pointing at this subfolder:

- **Type:** Static Site (new service — do not edit the existing Web Service)
- **Repository:** the same GitHub repo
- **Root Directory:** `showcase`
- **Build Command:** _(leave empty — no build step)_
- **Publish Directory:** `.`
- Suggested name: `shelfbuddy-mobile` → `https://shelfbuddy-mobile.onrender.com`

No environment variables are required; the showcase only loads the already-live
public app URL in an iframe.

<p align="center">
  <img src=".github/banner.svg" alt="Best Walk Time" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-FFEEC8.svg?style=flat-square&labelColor=1E1E1C" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Next.js-16-FFEEC8.svg?style=flat-square&labelColor=1E1E1C" alt="Next.js 16">
  <img src="https://img.shields.io/badge/TypeScript-5-FFEEC8.svg?style=flat-square&labelColor=1E1E1C" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Tailwind-v4-FFEEC8.svg?style=flat-square&labelColor=1E1E1C" alt="Tailwind v4">
</p>

<p align="center">
  <strong>Real-time rocket alert analysis to help Israelis decide when it's safe to go for a walk.</strong>
  <br>
  <a href="#quick-start">Quick Start</a> · <a href="https://github.com/hummusonrails/best-walk-time/issues">Report a Bug</a>
</p>

---

During active conflict, Israelis need to quickly assess whether it's safe to take a walk — an activity where you're away from a safe room and exposed outdoors. This app analyzes live alert data from Pikud HaOref combined with public bomb shelter locations to give a clear safety recommendation based on your walk duration, location, and distance to the nearest shelter.

## What It Does

- **Scores safety in real time** using a weighted algorithm (time since last alert, average gaps, frequency trends, alert density)
- **Factors in shelter proximity** — blends alert score with your distance to the nearest public bomb shelter
- **Filters by location** with 15 predefined regions and auto-detection from geolocation
- **Adapts to your walk** — adjust the duration slider to get a recommendation tailored to your planned walk time
- **Finds nearby shelters** using OpenStreetMap shelter data and shows the closest 5 with walking distances
- **Visualizes the last 24 hours** of alert activity in an hourly timeline chart
- **Supports Hebrew and English** with full RTL layout, persisted in localStorage
- **Installable as a PWA** — add to your home screen for one-tap access
- **Auto-refreshes every 30 seconds** so the recommendation stays current

## Quick Start

```bash
git clone https://github.com/hummusonrails/best-walk-time.git
cd best-walk-time
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

| Layer          | Tool                    | Notes                                        |
| :------------- | :---------------------- | :------------------------------------------- |
| Framework      | Next.js 16 (App Router) | Server-side API routes for data caching       |
| Language       | TypeScript              | Strict types throughout                      |
| Styling        | Tailwind CSS v4         | Dark editorial theme with smooth animations  |
| Charts         | Recharts                | 24h alert timeline bar chart                 |
| Data source    | Tzeva Adom API          | `api.tzevaadom.co.il` — no geo-restriction   |
| Shelters       | OpenStreetMap           | Public bomb shelter locations                |
| Geolocation    | Browser API             | Auto-detect region from coordinates          |
| Deployment     | Vercel                  | Zero-config deployment                       |

<details>
<summary><strong>Prerequisites</strong></summary>

- [Node.js](https://nodejs.org/) 18+
- npm

</details>

## Project Structure

```
best-walk-time/
├── app/
│   ├── layout.tsx                # Root layout, fonts, metadata
│   ├── page.tsx                  # Main page — fetches alerts, manages state
│   ├── globals.css               # Tailwind theme, animations
│   └── api/
│       ├── alerts/route.ts       # Proxies Tzeva Adom API with 30s cache
│       ├── shelters/route.ts     # Nearest shelter lookup
│       └── safety-check/route.ts # Safety check endpoint
├── components/
│   ├── Header.tsx                # Title + language toggle
│   ├── SafetyVerdict.tsx         # Score gauge + verdict message
│   ├── WalkSettings.tsx          # Duration slider
│   ├── LocationDisplay.tsx       # Geolocation + detected region
│   ├── LocationSelector.tsx      # Region buttons (auto-collapsible)
│   ├── NearestShelters.tsx       # Closest shelters with walking times
│   ├── StatsGrid.tsx             # 2×2 stat cards
│   ├── AlertTimeline.tsx         # Recharts 24h bar chart
│   ├── InstallPrompt.tsx         # PWA install prompt
│   ├── HowItWorks.tsx            # Collapsible explanation
│   └── Footer.tsx                # Attribution + last updated
├── hooks/
│   ├── useGeolocation.ts         # Browser geolocation hook
│   ├── useCountUp.ts             # Animated number counter
│   ├── useDeviceType.ts          # Device detection
│   └── useScrollReveal.ts        # Scroll animation hook
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── safety.ts                 # Safety scoring algorithm
│   ├── regions.ts                # 15 region definitions + geo-detection
│   ├── i18n.ts                   # EN/HE translations
│   ├── LanguageContext.tsx        # Language state + RTL
│   ├── geo.ts                    # Geolocation utilities
│   ├── haptics.ts                # Haptic feedback
│   ├── alertsCache.ts            # Alert data caching
│   └── sheltersCache.ts          # Shelter data caching
```

## Safety Algorithm

The score (0–100) is a weighted combination of four signals:

| Signal                  | Weight | Safer when…              |
| :---------------------- | :----- | :----------------------- |
| Time since last alert   | 40%    | Longer gap               |
| Average gap (6h window) | 25%    | Larger average           |
| Frequency trend         | 20%    | Decreasing               |
| 24h alert count         | 15%    | Fewer alerts             |

The base score is then blended with shelter proximity — closer shelters boost the score, no shelter data halves it. The final result is compared against your walk duration to produce a verdict: **Safe**, **Risky**, or **Dangerous**.

## Contributing

Found a bug or have a suggestion? [Open an issue](https://github.com/hummusonrails/best-walk-time/issues) or submit a PR.

## License

[MIT](LICENSE) — Ben Greenberg

---

<p align="center">
  Made by <a href="https://www.hummusonrails.com/">Ben Greenberg</a> · <a href="https://buymeacoffee.com/bengreenberg">Buy me a coffee</a>
</p>

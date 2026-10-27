# Project-DOOM# MoodBite — Good food. Better mood.

MoodBite is a static website that combines mood-based food inspiration, live weather, recipe discovery, and an India-wide regional cookbook.

## Features

- Live weather and geocoding using Open-Meteo.
- External recipe results from TheMealDB, plus a built-in regional cookbook.
- 36 Indian regions (28 states and 8 Union Territories) with 10 curated tourism destinations each.
- 109 home-style regional recipes with ingredients, instructions, aliases, and dietary labels.
- Mood selection, food filters, dish search, recipe details, favourites saved in the current browser, and meme generation.
- Responsive layout for desktop and mobile.

**About the destination lists:** These are curated discovery suggestions, not an official ranked top 10. For some Union Territories, attractions and localities are included because there are fewer distinct towns.

## Project files

- `index.html` — page structure and metadata.
- `style.css` — layout, styling, and responsive rules.
- `script.js` — app logic, weather, API calls, search, filters, favourites, and memes.
- `india-foods.js` — regional destinations and local recipe data.

## Run locally

1. Download or clone this repository.
2. Open the folder in VS Code.
3. Start a local static server (for example, the **Live Server** extension).
4. Open `index.html` through that server.

A local server is recommended instead of opening the file directly with a `file://` URL. An internet connection is required for live weather, TheMealDB results, Google Fonts, and MemeGen. The built-in cookbook can be browsed without the external recipe API.

## Deploy with GitHub Pages

1. Create a GitHub repository, for example `moodbite`.
2. Upload the contents of this folder to the **repository root**. `index.html` must be at the root, not inside an extra nested project folder.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/(root)`, then save.
6. Wait for the Pages deployment to finish. GitHub will display the published URL in the Pages settings.

No build command or framework is required; this is a plain HTML/CSS/JavaScript site. After pushing changes to the selected branch, GitHub Pages will publish the updated static files.

## APIs and attribution

- Weather and geocoding: [Open-Meteo](https://open-meteo.com/)
- External recipes: [TheMealDB](https://www.themealdb.com/api.php), using its public development key `1`
- Meme images: [MemeGen](https://memegen.link/)
- Hero image: [Unsplash](https://unsplash.com/)

The app does not require private API keys for the public endpoints currently configured. If you later add any secret keys, do not commit them to a public repository or place them in client-side JavaScript.

## Dietary filter notes

- **Vegetarian:** no meat, fish, seafood, or egg; dairy is allowed.
- **Vegan:** no meat, fish, seafood, egg, dairy, or honey in the recipe as written.
- **Non-vegetarian:** includes meat/poultry, egg, and seafood.
- **Contains egg** and **Seafood** are narrower filters.

External recipe labels are estimated from listed ingredients. Processed ingredients and preparation methods may vary; these labels are not allergy-safety guarantees. Check ingredients and cross-contact details for strict dietary requirements.

## Notes

- Favourites are saved in the current browser using `localStorage`; they are not synced between devices.
- Local recipes are concise home-style examples, and preparations vary by household and region.
- The destination lists and local recipes are curated for discovery and learning, not official tourism rankings or canonical recipes.

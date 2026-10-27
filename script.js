// MoodBite MVP: weather (Open-Meteo) + recipes (TheMealDB) + memes (MemeGen).
// No API keys are required for these development endpoints.

const WEATHER_GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const MEAL_URL = "https://www.themealdb.com/api/json/v1/1";
const MEME_URL = "https://api.memegen.link/images";

const cityForm = document.querySelector("#city-form");
const cityInput = document.querySelector("#city-input");
const findButton = document.querySelector("#find-button");
const statusMessage = document.querySelector("#status-message");
const weatherCity = document.querySelector("#weather-city");
const temperature = document.querySelector("#temperature");
const weatherCondition = document.querySelector("#weather-condition");
const weatherSymbol = document.querySelector("#weather-symbol");
const weatherTip = document.querySelector("#weather-tip");
const weatherStatus = document.querySelector("#weather-status");
const heroWeatherLabel = document.querySelector("#hero-weather-label");
const heroWeatherSub = document.querySelector("#hero-weather-sub");
const moodButtons = [...document.querySelectorAll(".mood-card")];
const recipeGrid = document.querySelector("#recipe-grid");
const recommendationNote = document.querySelector("#recommendation-note");
const refreshButton = document.querySelector("#refresh-button");
const newMemeButton = document.querySelector("#new-meme-button");
const memePreview = document.querySelector("#meme-preview");
const memeStatus = document.querySelector("#meme-status");
const recipeDialog = document.querySelector("#recipe-dialog");
const dialogContent = document.querySelector("#dialog-content");
const dialogClose = document.querySelector("#dialog-close");
const foodTypeSelect = document.querySelector("#food-type");
const dishSearchForm = document.querySelector("#dish-search-form");
const dishSearchInput = document.querySelector("#dish-search");
const localFoodTitle = document.querySelector("#local-food-title");
const localFoodDescription = document.querySelector("#local-food-description");
const localFoodChips = document.querySelector("#local-food-chips");
const regionBrowser = document.querySelector("#region-browser");
const destinationBrowser = document.querySelector("#destination-browser");
const indiaCoverage = document.querySelector("#india-coverage");
const INDIA_DB = window.MOODBITE_INDIA_DB;

let selectedMood = "happy";
let currentWeather = null;
let currentCity = "Ahmedabad";
let currentMeals = [];
let memeCount = 0;
let currentSearch = "";
let currentFoodRegionName = "Gujarat";
let currentFoodDestination = "Ahmedabad";

const moodInfo = {
  happy: {
    label: "Happy",
    category: "Vegetarian",
    note: "Bright mood, colourful plate. Here are fresh ideas to match your sunshine.",
    memeTop: "MY MOOD",
    memeBottom: "NEEDS A SNACK"
  },
  cozy: {
    label: "Cozy",
    category: "Pasta",
    note: "Comfort mode is on. Let's find something warm and satisfying.",
    memeTop: "CLOUDY OUTSIDE",
    memeBottom: "COZY FOOD INSIDE"
  },
  tired: {
    label: "Low energy",
    category: "Chicken",
    note: "Low-effort inspiration. Pick a recipe, check its steps, and take it one bite at a time.",
    memeTop: "ENERGY LEVEL",
    memeBottom: "PLEASE SEND FOOD"
  },
  adventurous: {
    label: "Adventurous",
    category: "Seafood",
    note: "Ready to try something new? Here are recipes to shake up your usual routine.",
    memeTop: "ME TRYING",
    memeBottom: "A NEW RECIPE"
  }
};

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function weatherDescription(code) {
  if (code === 0) return { text: "Clear skies", icon: "☀️", tip: "It's looking bright. Let's keep things fresh and colourful." };
  if ([1, 2].includes(code)) return { text: "Mostly clear", icon: "🌤️", tip: "A little sunshine calls for a cheerful bite." };
  if (code === 3) return { text: "Cloudy skies", icon: "☁️", tip: "A cosy meal might be just the thing." };
  if ([45, 48].includes(code)) return { text: "Foggy", icon: "🌫️", tip: "Take it slow and find something comforting." };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: "Rainy weather", icon: "🌧️", tip: "Rain outside? A comforting recipe could make the day." };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: "Snowy weather", icon: "❄️", tip: "A warm, hearty dish sounds lovely for this weather." };
  if ([95, 96, 99].includes(code)) return { text: "Thunderstorms", icon: "⛈️", tip: "If you're staying in, browse a cosy meal idea." };
  return { text: "Today's weather", icon: "🌥️", tip: "Let's find a meal to match the day." };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status}). Please try again.`);
  return response.json();
}

async function getWeatherForCity(city) {
  const geocodeUrl = new URL(WEATHER_GEO_URL);
  geocodeUrl.search = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
  const geoData = await fetchJson(geocodeUrl);
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`I couldn't find “${city}”. Check the spelling or try a nearby city.`);
  }

  const place = geoData.results[0];
  const forecastUrl = new URL(WEATHER_URL);
  forecastUrl.search = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,precipitation,weather_code",
    timezone: "auto"
  });
  const forecast = await fetchJson(forecastUrl);
  return {
    city: place.name,
    country: place.country || "",
    admin1: place.admin1 || "",
    admin2: place.admin2 || "",
    temperature: Math.round(forecast.current.temperature_2m),
    precipitation: forecast.current.precipitation,
    code: forecast.current.weather_code,
    current: forecast.current
  };
}

function showWeather(weather) {
  currentWeather = weather;
  currentCity = weather.city;
  const description = weatherDescription(weather.code);
  weatherCity.textContent = `${weather.city}${weather.country ? ", " + weather.country : ""}`.toUpperCase();
  temperature.textContent = `${weather.temperature}°`;
  weatherCondition.textContent = description.text;
  weatherSymbol.textContent = description.icon;
  weatherTip.textContent = description.tip;
  heroWeatherLabel.textContent = description.text;
  heroWeatherSub.textContent = `${weather.temperature}° in ${weather.city}`;
  weatherStatus.textContent = "Live weather";
  weatherStatus.previousElementSibling?.classList.add("live");
  document.querySelector(".weather-bar").classList.add("weather-loaded");
}

function moodCategory() {
  // Adjust the category according to the mood and current weather.
  const info = moodInfo[selectedMood];
  if (currentWeather && currentWeather.temperature >= 31 && selectedMood === "happy") return "Vegetarian";
  if (currentWeather && currentWeather.precipitation > 0 && selectedMood === "cozy") return "Pasta";
  return info.category;
}

function renderLoading(message = "Finding recipes that fit your vibe…") {
  recipeGrid.innerHTML = `<div class="loading-card"><span class="loading-spinner" aria-hidden="true"></span><p>${message}</p></div>`;
}

function findRegionByName(value) {
  const query = INDIA_DB.normalise(value);
  if (!query) return null;
  return INDIA_DB.regions.find(region => {
    const names = [region.name, ...(region.aliases || [])].map(INDIA_DB.normalise);
    return names.includes(query) || names.some(name => name && query === name);
  }) || null;
}

function findRegionForCity(city, regionHint = "") {
  const query = INDIA_DB.normalise(city);
  if (query) {
    // Prefer an exact destination match, so Delhi the city doesn't get mistaken for another region.
    for (const region of INDIA_DB.regions) {
      for (const destination of region.destinations) {
        const destinationName = INDIA_DB.normalise(destination.replace(/\s*\([^)]*\)/g, ""));
        const alternateName = INDIA_DB.normalise(destination);
        if (query === destinationName || query === alternateName) return region;
      }
    }
    // Also accept input such as "Port Blair, Andaman" or "Gandhinagar Gujarat".
    for (const region of INDIA_DB.regions) {
      const candidates = [...region.destinations, ...(region.aliases || []), region.name].map(INDIA_DB.normalise).filter(Boolean);
      if (candidates.some(candidate => query.includes(candidate) || (candidate.length > 3 && candidate.includes(query)))) return region;
    }
  }
  return findRegionByName(regionHint) || null;
}

function populateDestinationBrowser(region, selectedDestination = "") {
  if (!region || !destinationBrowser) return;
  destinationBrowser.innerHTML = region.destinations.map(destination =>
    `<option value="${escapeAttribute(destination)}">${escapeHtml(destination)}</option>`
  ).join("");
  const wanted = region.destinations.find(destination => INDIA_DB.normalise(destination) === INDIA_DB.normalise(selectedDestination));
  currentFoodDestination = wanted || region.destinations[0];
  destinationBrowser.value = currentFoodDestination;
}

function initialiseIndiaBrowser(regionName = "Gujarat", destinationName = "Ahmedabad") {
  if (!regionBrowser || !destinationBrowser) return;
  regionBrowser.innerHTML = INDIA_DB.regions.map(region =>
    `<option value="${escapeAttribute(region.name)}">${escapeHtml(region.name)}${region.kind === "Union Territory" ? " · UT" : ""}</option>`
  ).join("");
  const region = findRegionByName(regionName) || INDIA_DB.regions[0];
  regionBrowser.value = region.name;
  populateDestinationBrowser(region, destinationName);
  if (indiaCoverage) indiaCoverage.textContent = `${INDIA_DB.regions.length} regions · ${INDIA_DB.destinationCount} curated destinations · ${INDIA_DB.recipes.length} local recipes`;
}

function updateLocalFoods(city, regionHint = "", syncBrowser = true) {
  const region = findRegionForCity(city, regionHint) || findRegionByName(currentFoodRegionName) || findRegionByName("Gujarat");
  if (!region) return;
  currentFoodRegionName = region.name;
  currentFoodDestination = city || region.destinations[0];
  if (syncBrowser && regionBrowser && destinationBrowser) {
    regionBrowser.value = region.name;
    populateDestinationBrowser(region, currentFoodDestination);
  }
  const regionalRecipes = region.recipeIds.map(id => INDIA_DB.recipes.find(recipe => recipe.id === id)).filter(Boolean);
  localFoodTitle.textContent = `${city || region.destinations[0]} · ${region.name} favourites`;
  localFoodDescription.textContent = `A curated regional taste for ${region.name}: ${regionalRecipes.length} home-style recipes linked to this destination. Choose a dish for ingredients and steps, including dishes missing from TheMealDB.`;
  localFoodChips.innerHTML = regionalRecipes.map(recipe =>
    `<button type="button" class="food-chip" data-dish="${escapeAttribute(recipe.name)}">${escapeHtml(recipe.emoji)} ${escapeHtml(recipe.name)}</button>`
  ).join("");
}

function localRecipeToMeal(recipe) {
  return {
    idMeal: recipe.id,
    strMeal: recipe.name,
    strMealThumb: "",
    strCategory: foodTypeLabel(recipe.foodType),
    strArea: recipe.region,
    foodType: recipe.foodType,
    localRecipe: recipe,
    source: "MoodBite regional cookbook"
  };
}

function findLocalRecipes(query) {
  const normalizedQuery = INDIA_DB.normalise(query);
  const tokens = normalizedQuery.split(" ").filter(token => token.length > 1);
  if (!normalizedQuery || !tokens.length) return [];
  return INDIA_DB.recipes.map(recipe => {
    const regionRecord = INDIA_DB.regions.find(item => item.name === recipe.region);
    const searchable = INDIA_DB.normalise(`${recipe.name} ${(recipe.aliases || []).join(" ")} ${recipe.region} ${(regionRecord?.aliases || []).join(" ")}`);
    const queryPhraseMatch = searchable.includes(normalizedQuery);
    const recipeName = INDIA_DB.normalise(recipe.name);
    const matchedTokens = tokens.filter(token => searchable.split(" ").includes(token));
    let score = queryPhraseMatch ? 12 : matchedTokens.length * 3;
    if (recipeName === normalizedQuery) score += 10;
    else if (recipeName.includes(normalizedQuery)) score += 5;
    if (recipe.region === currentFoodRegionName) score += 2;
    return { recipe, score, matchedTokens: matchedTokens.length };
  })
    // Multi-word searches such as "jalebi fafda" intentionally return each matching dish.
    .filter(item => item.score > 0 && item.matchedTokens > 0)
    .sort((a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name))
    .map(item => localRecipeToMeal(item.recipe))
    .filter(matchesFoodPreference);
}

function foodTypeLabel(type) {
  return ({
    vegan: "Vegan",
    vegetarian: "Vegetarian",
    egg: "Contains egg",
    seafood: "Seafood",
    nonvegetarian: "Non-vegetarian",
    unknown: "Diet type unclear"
  })[type] || "Diet type unclear";
}

function classifyMeal(meal) {
  if (meal?.localRecipe?.foodType) return meal.localRecipe.foodType;
  if (meal?.foodType) return meal.foodType;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal?.[`strIngredient${i}`]?.trim();
    if (ingredient) ingredients.push(ingredient.toLowerCase());
  }
  if (!ingredients.length) return "unknown";
  const text = `${meal.strMeal || ""} ${ingredients.join(" ")}`.toLowerCase();
  const seafood = /\b(fish|salmon|tuna|trout|cod|haddock|anchov(?:y|ies)|sardine|prawn|shrimp|crab|lobster|mussel|oyster|squid|clam|scallop|seafood|fish sauce|oyster sauce|shrimp paste|prawn paste|bonito)\b/.test(text);
  const meat = /\b(chicken|beef|pork|lamb|mutton|goat|turkey|duck|bacon|ham|sausage|salami|pepperoni|prosciutto|venison|meat|gelatin|gelatine|lard|tallow|suet|bone broth|chicken stock|beef stock|rennet)\b/.test(text);
  const egg = /\b(egg|eggs|egg white|egg yolk|albumen|meringue)\b/.test(text);
  if (seafood) return "seafood";
  if (meat) return "nonvegetarian";
  if (egg) return "egg";
  // Unknown processed foods can conceal animal-derived ingredients; avoid confidently labelling them vegan.
  if (/\b(pasta|noodles?|mayonnaise|mayo|stock|broth|worcestershire|puff pastry|pastry|marshmallow|gelatin)\b/.test(text)) return "unknown";
  // Do not mistake common plant-based substitutes (for example coconut milk or soy yogurt) for dairy.
  const dairyCheckText = text
    .replace(/\b(?:coconut|almond|oat|soy|soya|rice|cashew|hemp|pea|hazelnut|macadamia)\s+(?:milk|cream|yogurt|yoghurt|cheese)\b/g, " ")
    .replace(/\b(?:vegan|plant[- ]based|dairy[- ]free)\s+(?:butter|cheese|cream|milk|yogurt|yoghurt)\b/g, " ")
    .replace(/\bbutter beans\b/g, " ");
  const animalByproducts = /\b(milk|cream|butter|ghee|paneer|curd|yogurt|yoghurt|cheese|whey|casein|khoya|mawa|malai|dahi|lassi|honey|condensed milk|milk powder)\b/.test(dairyCheckText);
  return animalByproducts ? "vegetarian" : "vegan";
}

function matchesFoodPreference(meal) {
  const preference = foodTypeSelect.value;
  const type = classifyMeal(meal);
  if (preference === "all") return true;
  if (preference === "vegetarian") return type === "vegetarian" || type === "vegan";
  if (preference === "vegan") return type === "vegan";
  if (preference === "nonvegetarian") return type === "nonvegetarian" || type === "seafood" || type === "egg";
  if (preference === "seafood") return type === "seafood";
  if (preference === "egg") return type === "egg";
  return false;
}

function dedupeMeals(meals, limit = 3) {
  const seen = new Set();
  const result = [];
  for (const meal of meals) {
    const key = meal.idMeal || INDIA_DB.normalise(meal.strMeal);
    const nameKey = INDIA_DB.normalise(meal.strMeal);
    if (seen.has(key) || seen.has(nameKey)) continue;
    seen.add(key);
    seen.add(nameKey);
    result.push(meal);
    if (result.length >= limit) break;
  }
  return result;
}

async function loadRecipes() {
  renderLoading(currentSearch ? `Searching local recipes and TheMealDB for “${currentSearch}”…` : "Finding recipes that fit your vibe…");
  const category = moodCategory();
  const preferenceLabel = foodTypeSelect.options[foodTypeSelect.selectedIndex].text;
  recommendationNote.textContent = `✦ ${moodInfo[selectedMood].note} ${currentSearch ? `Dish search: ${currentSearch}.` : `Mood and weather inspiration: ${category}.`} Food preference: ${preferenceLabel}.`;

  let meals = [];
  try {
    if (currentSearch) {
      const localMatches = findLocalRecipes(currentSearch);
      let apiMeals = [];
      try {
        const data = await fetchJson(`${MEAL_URL}/search.php?s=${encodeURIComponent(currentSearch)}`);
        apiMeals = (data.meals || []).filter(matchesFoodPreference);
      } catch (error) {
        // Curated recipes still work when the external API is unavailable.
        console.warn("TheMealDB search unavailable; showing local recipe matches where possible.", error);
      }
      meals = dedupeMeals([...localMatches, ...apiMeals], 3);
    } else {
      const region = findRegionByName(currentFoodRegionName);
      const localMatches = (region?.recipeIds || [])
        .map(id => INDIA_DB.recipes.find(recipe => recipe.id === id))
        .filter(Boolean)
        .map(localRecipeToMeal)
        .filter(matchesFoodPreference);
      const requests = Array.from({ length: 8 }, () => fetchJson(`${MEAL_URL}/random.php`).catch(() => null));
      const results = await Promise.all(requests);
      let apiMeals = results.map(item => item?.meals?.[0]).filter(Boolean).filter(matchesFoodPreference);
      if (selectedMood === "adventurous") apiMeals.sort((a, b) => Number(classifyMeal(b) === "seafood") - Number(classifyMeal(a) === "seafood"));
      if (selectedMood === "happy" && currentWeather?.temperature >= 31) apiMeals.sort((a, b) => Number(classifyMeal(a) === "vegetarian" || classifyMeal(a) === "vegan") - Number(classifyMeal(b) === "vegetarian" || classifyMeal(b) === "vegan"));
      meals = dedupeMeals([...localMatches.slice(0, 2), ...apiMeals], 3);
    }

    if (!meals.length) {
      recipeGrid.innerHTML = `<div class="empty-card"><span>🔎</span><h3>No confidently matching recipe found just yet.</h3><p>Try another spelling, select All foods, or choose another region. Strict filters hide recipes whose ingredients are unclear instead of guessing their dietary category.</p></div>`;
      currentMeals = [];
      return;
    }
    currentMeals = meals;
    renderMeals(meals);
  } catch (error) {
    recipeGrid.innerHTML = `<div class="empty-card"><span>🍽️</span><h3>Our kitchen is taking a tiny break.</h3><p>${escapeHtml(error.message)} Please try Refresh ideas.</p></div>`;
  }
}

function renderMeals(meals) {
  recipeGrid.innerHTML = "";
  const labels = ["A feel-good pick", "Mood match", "Worth a try"];
  meals.slice(0, 3).forEach((meal, index) => {
    const card = document.createElement("article");
    card.className = "recipe-card";
    const isLocal = Boolean(meal.localRecipe);
    const foodType = classifyMeal(meal);
    const saved = getFavorites().some(item => item.idMeal === meal.idMeal);
    const visual = meal.strMealThumb
      ? `<img src="${escapeAttribute(meal.strMealThumb)}" alt="${escapeAttribute(meal.strMeal)}" loading="lazy">`
      : `<div class="recipe-illustration" aria-label="Regional recipe illustration"><span>${escapeHtml(meal.localRecipe?.emoji || "🍲")}</span><small>${isLocal ? "REGIONAL RECIPE" : "RECIPE IDEA"}</small></div>`;
    card.innerHTML = `
      <div class="recipe-photo ${isLocal ? "local-recipe-photo" : ""}">
        ${visual}
        <span class="recipe-tag">${labels[index] || "A little inspiration"}</span>
        <button class="save-button ${saved ? "saved" : ""}" type="button" aria-label="${saved ? "Unsave" : "Save"} ${escapeAttribute(meal.strMeal)}" aria-pressed="${saved}">${saved ? "♥" : "♡"}</button>
      </div>
      <div class="recipe-content">
        <div class="recipe-meta"><span>🍴 ${escapeHtml(foodTypeLabel(foodType))}</span><span>${isLocal ? "MoodBite regional" : "TheMealDB"}</span></div>
        <h3>${escapeHtml(meal.strMeal)}</h3>
        <p>${isLocal ? `${escapeHtml(meal.localRecipe.region)} home-style recipe. Ingredients and steps are included.` : `A ${escapeHtml(foodTypeLabel(foodType).toLowerCase())} idea for your ${escapeHtml(moodInfo[selectedMood].label.toLowerCase())} mood.`}</p>
        <button class="recipe-link" type="button" data-id="${escapeAttribute(meal.idMeal)}">Explore recipe <span>↗</span></button>
      </div>`;
    const image = card.querySelector("img");
    if (image) image.addEventListener("error", () => { image.style.display = "none"; });
    card.querySelector(".save-button").addEventListener("click", event => toggleFavorite(event.currentTarget, meal));
    card.querySelector(".recipe-link").addEventListener("click", () => openRecipe(meal.idMeal));
    recipeGrid.appendChild(card);
  });
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem("moodbite-favorites") || "[]"); }
  catch { return []; }
}

function toggleFavorite(button, meal) {
  const favorites = getFavorites();
  const exists = favorites.some(item => item.idMeal === meal.idMeal);
  const next = exists ? favorites.filter(item => item.idMeal !== meal.idMeal) : [...favorites, {
    idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb
  }];
  localStorage.setItem("moodbite-favorites", JSON.stringify(next));
  button.classList.toggle("saved", !exists);
  button.textContent = exists ? "♡" : "♥";
  button.setAttribute("aria-pressed", String(!exists));
  button.setAttribute("aria-label", `${exists ? "Save" : "Unsave"} ${meal.strMeal}`);
}

async function openRecipe(mealId) {
  const localRecipe = INDIA_DB.recipes.find(recipe => recipe.id === mealId);
  if (localRecipe) {
    const ingredients = localRecipe.ingredients || [];
    const steps = localRecipe.steps || [];
    dialogContent.innerHTML = `
      <div class="local-dialog-art"><span>${escapeHtml(localRecipe.emoji || "🍲")}</span><small>MOODBITE REGIONAL COOKBOOK · ${escapeHtml(localRecipe.region.toUpperCase())}</small></div>
      <div class="dialog-body">
        <p class="section-eyebrow">${escapeHtml(foodTypeLabel(localRecipe.foodType))} · HOME-STYLE RECIPE</p>
        <h2>${escapeHtml(localRecipe.name)}</h2>
        <p>${escapeHtml(localRecipe.note || `A simple home-style starting point associated with ${localRecipe.region}. Local families and restaurants may make this dish differently.`)}</p>
        <h3>Ingredients</h3>
        <ul class="ingredients-list">${ingredients.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3>Instructions</h3>
        <ol class="instructions-list">${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        <p class="recipe-disclaimer">Dietary label applies to this written version. Ingredient brands and regional variations may differ; check labels and preparation methods for strict dietary requirements or allergies.</p>
      </div>`;
    recipeDialog.showModal();
    return;
  }

  dialogContent.innerHTML = `<div class="dialog-body"><span class="loading-spinner"></span><p>Opening recipe…</p></div>`;
  recipeDialog.showModal();
  try {
    const data = await fetchJson(`${MEAL_URL}/lookup.php?i=${encodeURIComponent(mealId)}`);
    const meal = data.meals?.[0];
    if (!meal) throw new Error("Recipe details were not found.");
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]?.trim();
      const measure = meal[`strMeasure${i}`]?.trim();
      if (ingredient) ingredients.push(`${measure ? measure + " " : ""}${ingredient}`);
    }
    dialogContent.innerHTML = `
      ${meal.strMealThumb ? `<img class="dialog-recipe-image" src="${escapeAttribute(meal.strMealThumb)}" alt="${escapeAttribute(meal.strMeal)}">` : ""}
      <div class="dialog-body">
        <p class="section-eyebrow">${escapeHtml(foodTypeLabel(classifyMeal(meal)))} · ${escapeHtml(meal.strCategory || "RECIPE")} ${meal.strArea ? " · " + escapeHtml(meal.strArea) : ""}</p>
        <h2>${escapeHtml(meal.strMeal)}</h2>
        <p>Recipe details supplied by TheMealDB. Dietary type is estimated from the listed ingredients; verify the original recipe if you need strict certainty.</p>
        <h3>Ingredients</h3>
        <ul class="ingredients-list">${ingredients.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3>Instructions</h3>
        <p>${escapeHtml(meal.strInstructions || "Instructions are not available for this recipe.").replace(/\r?\n/g, "<br>")}</p>
        ${meal.strSource ? `<p><a href="${escapeAttribute(meal.strSource)}" target="_blank" rel="noopener noreferrer"><strong>Open original recipe ↗</strong></a></p>` : ""}
      </div>`;
  } catch (error) {
    dialogContent.innerHTML = `<div class="dialog-body"><h2>Couldn't open this recipe</h2><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function escapeAttribute(value = "") { return escapeHtml(value); }

function updateMood(mood) {
  selectedMood = mood;
  moodButtons.forEach(button => {
    const active = button.dataset.mood === mood;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (currentWeather) loadRecipes();
  updateMemePlaceholder();
}

function updateMemePlaceholder() {
  const info = moodInfo[selectedMood];
  memeStatus.textContent = `Ready to make a ${info.label.toLowerCase()}-mood meme.`;
}

function makeMeme() {
  const info = moodInfo[selectedMood];
  const rainy = currentWeather && [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(currentWeather.code);
  const top = rainy ? "WHEN IT STARTS RAINING" : info.memeTop;
  const bottom = rainy ? "TIME FOR COMFORT FOOD" : info.memeBottom;
  // MemeGen's URL format: /images/TEMPLATE/TOP/BOTTOM.png
  const templates = ["buzz", "doge", "drake"];
  const template = templates[memeCount % templates.length];
  memeCount++;
  const url = `${MEME_URL}/${template}/${encodeURIComponent(top.replaceAll(" ", "_"))}/${encodeURIComponent(bottom.replaceAll(" ", "_"))}.png`;
  memePreview.innerHTML = `<img class="meme-image" src="${url}" alt="A ${escapeAttribute(info.label.toLowerCase())} mood meme">`;
  const image = memePreview.querySelector("img");
  image.addEventListener("error", () => {
    memePreview.innerHTML = `<div class="meme-placeholder"><span>😅</span><strong>MemeGen couldn't load that template.</strong><small>Check your internet connection and try again.</small></div>`;
    memeStatus.textContent = "Meme image did not load. Try again in a moment.";
  });
  memeStatus.textContent = `Meme made for your ${info.label.toLowerCase()} mood.`;
}

cityForm.addEventListener("submit", async event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please enter a city name.", true);
    cityInput.focus();
    return;
  }
  findButton.disabled = true;
  findButton.innerHTML = "Checking weather…";
  setStatus(`Looking up the weather for ${city}…`);
  weatherStatus.textContent = "Loading…";
  try {
    const weather = await getWeatherForCity(city);
    showWeather(weather);
    updateLocalFoods(weather.city, weather.admin1);
    currentSearch = "";
    dishSearchInput.value = "";
    setStatus(`Found ${weather.city}. Now finding recipes for your vibe.`);
    await loadRecipes();
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", true);
    weatherStatus.textContent = "Weather unavailable";
  } finally {
    findButton.disabled = false;
    findButton.innerHTML = 'Find my vibe <span>→</span>';
  }
});

moodButtons.forEach(button => button.addEventListener("click", () => updateMood(button.dataset.mood)));
foodTypeSelect.addEventListener("change", () => loadRecipes());
regionBrowser.addEventListener("change", () => {
  const region = findRegionByName(regionBrowser.value);
  if (!region) return;
  populateDestinationBrowser(region);
  currentSearch = "";
  dishSearchInput.value = "";
  updateLocalFoods(destinationBrowser.value, region.name, false);
  loadRecipes();
});
destinationBrowser.addEventListener("change", () => {
  const region = findRegionByName(regionBrowser.value);
  currentSearch = "";
  dishSearchInput.value = "";
  updateLocalFoods(destinationBrowser.value, region?.name || "", false);
  loadRecipes();
});
dishSearchForm.addEventListener("submit", event => {
  event.preventDefault();
  currentSearch = dishSearchInput.value.trim();
  if (!currentSearch) { setStatus("Type a dish name to search.", true); dishSearchInput.focus(); return; }
  loadRecipes();
});
localFoodChips.addEventListener("click", event => {
  const button = event.target.closest("[data-dish]");
  if (!button) return;
  currentSearch = button.dataset.dish;
  dishSearchInput.value = currentSearch;
  loadRecipes();
  document.querySelector("#recipes-section").scrollIntoView({ behavior: "smooth", block: "start" });
});
refreshButton.addEventListener("click", () => {
  currentSearch = "";
  dishSearchInput.value = "";
  if (currentWeather) loadRecipes();
  else setStatus("Search a city first, then refresh your recipe ideas.");
});
newMemeButton.addEventListener("click", makeMeme);
dialogClose.addEventListener("click", () => recipeDialog.close());
recipeDialog.addEventListener("click", event => {
  if (event.target === recipeDialog) recipeDialog.close();
});

// Show live data on first load using the default city.
window.addEventListener("DOMContentLoaded", () => {
  initialiseIndiaBrowser("Gujarat", "Ahmedabad");
  updateLocalFoods(cityInput.value, "Gujarat");
  cityForm.requestSubmit();
});

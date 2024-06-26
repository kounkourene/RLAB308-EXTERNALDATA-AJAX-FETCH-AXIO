import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_PCcSHCjPAHb5MZks4avqi2CanFuybs7IWgBdaiIAIsWjuTFsJeodK9pWhdw0lyLT"; // Replace with your actual API key
const API_URL = 'https://api.thecatapi.com/v1';

// Set the headers for fetch requests
const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json'
};

// 1. Create an async function "initialLoad" that does the following:
async function initialLoad() {
  try {
    const response = await fetch(`${API_URL}/breeds`, { headers });
    const breeds = await response.json();
    
    breeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Create the initial carousel with the first breed
    if (breeds.length > 0) {
      loadBreedImages(breeds[0].id);
    }
  } catch (error) {
    console.error('Error fetching breeds:', error);
  }
}

// Function to load breed images and populate the carousel
async function loadBreedImages(breedId) {
  try {
    const response = await fetch(`${API_URL}/images/search?breed_ids=${breedId}&limit=10`, { headers });
    const images = await response.json();
    
    // Clear previous carousel items
    const carouselInner = document.getElementById('carouselInner');
    carouselInner.innerHTML = '';

    images.forEach((imageData, index) => {
      const carouselItemTemplate = document.getElementById('carouselItemTemplate');
      const carouselItem = carouselItemTemplate.content.cloneNode(true);
      const imgElement = carouselItem.querySelector('img');
      imgElement.src = imageData.url;
      carouselItem.querySelector('.favourite-button').dataset.imgId = imageData.id;
      
      if (index === 0) {
        carouselItem.querySelector('.carousel-item').classList.add('active');
      }

      carouselInner.appendChild(carouselItem);
    });

    // Populate the infoDump section with breed information
    populateBreedInfo(images[0]?.breeds[0]);
  } catch (error) {
    console.error('Error fetching breed images:', error);
  }
}

// Function to populate breed information
function populateBreedInfo(breed) {
  infoDump.innerHTML = '';
  
  if (breed) {
    const breedInfo = `
      <h2>${breed.name}</h2>
      <p>${breed.description}</p>
      <p><strong>Temperament:</strong> ${breed.temperament}</p>
      <p><strong>Life Span:</strong> ${breed.life_span} years</p>
      <p><strong>Origin:</strong> ${breed.origin}</p>
    `;
    infoDump.innerHTML = breedInfo;
  }
}

// Event handler for breed selection change
breedSelect.addEventListener('change', async (event) => {
  const breedId = event.target.value;
  await loadBreedImages(breedId);
});

// Initial load function call
initialLoad();

// Function to handle getting favourite images
getFavouritesBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_URL}/favourites`, { headers });
    const favourites = await response.json();
    const favouriteImages = favourites.map(fav => fav.image);

    const carouselInner = document.getElementById('carouselInner');
    carouselInner.innerHTML = '';

    favouriteImages.forEach((imageData, index) => {
      const carouselItemTemplate = document.getElementById('carouselItemTemplate');
      const carouselItem = carouselItemTemplate.content.cloneNode(true);
      const imgElement = carouselItem.querySelector('img');
      imgElement.src = imageData.url;
      carouselItem.querySelector('.favourite-button').dataset.imgId = imageData.id;
      
      if (index === 0) {
        carouselItem.querySelector('.carousel-item').classList.add('active');
      }

      carouselInner.appendChild(carouselItem);
    });
  } catch (error) {
    console.error('Error fetching favourites:', error);
  }
});
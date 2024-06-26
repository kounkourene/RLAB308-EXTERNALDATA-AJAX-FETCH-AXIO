import axios from 'axios';
import * as Carousel from "./Carousel.js";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

//Part II - Axios
// Storing the API key here for reference and easy access.
const API_KEY = "live_PCcSHCjPAHb5MZks4avqi2CanFuybs7IWgBdaiIAIsWjuTFsJeodK9pWhdw0lyLT";
const API_URL = 'https://api.thecatapi.com/v1';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['x-api-key'] = API_KEY;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Axios interceptors to log the time between request and response
axios.interceptors.request.use(config => {
  console.log('Request started at:', new Date().toISOString());
  document.body.style.cursor = 'progress';
  progressBar.style.width = '0%';
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  console.log('Response received at:', new Date().toISOString());
  document.body.style.cursor = 'default';
  return response;
}, error => {
  document.body.style.cursor = 'default';
  return Promise.reject(error);
});

function updateProgress(event) {
  console.log(event);
  const percentCompleted = Math.round((event.loaded * 100) / event.total);
  progressBar.style.width = `${percentCompleted}%`;
}

// 1. Creating an async function "initialLoad"
async function initialLoad() {
  try {
    const response = await axios.get('/breeds');
    const breeds = response.data;
    
    breeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Creating the initial carousel with the first breed
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
    const response = await axios.get(`/images/search`, {
      params: {
        breed_ids: breedId,
        limit: 10
      },
      onDownloadProgress: updateProgress
    });
    const images = response.data;
    
    // Clearing previous carousel items
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

    // Populating the infoDump section with breed information
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
    const response = await axios.get(`/favourites`);
    const favourites = response.data;
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

// Function to handle favouriting images
export async function favourite(imageId) {
  try {
    const response = await axios.get(`/favourites`);
    const favourites = response.data;
    const favourite = favourites.find(fav => fav.image_id === imageId);

    if (favourite) {
      await axios.delete(`/favourites/${favourite.id}`);
      console.log(`Removed favourite with id: ${favourite.id}`);
    } else {
      await axios.post(`/favourites`, {
        image_id: imageId
      });
      console.log(`Added favourite with image id: ${imageId}`);
    }
  } catch (error) {
    console.error('Error toggling favourite:', error);
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to save scraped products
const saveProducts = async (products) => {
  try {
    const jsonProducts = JSON.stringify(products);
    await AsyncStorage.setItem('scrapedProducts', jsonProducts);
    console.log('Scraped products saved successfully.');
  } catch (error) {
    console.error('Error saving scraped products:', error);
  }
};

// Function to retrieve saved products
const getSavedProducts = async () => {
  try {
    const jsonProducts = await AsyncStorage.getItem('scrapedProducts');
    if (jsonProducts !== null) {
      const products = JSON.parse(jsonProducts);
      console.log('Retrieved saved products:', products);
      return products;
    } else {
      console.log('No saved products found.');
      return [];
    }
  } catch (error) {
    console.error('Error retrieving saved products:', error);
    return [];
  }
};

const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape product names and codes from a supermarket website
async function scrapeSupermarket(url) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
  
      const products = $('.wrapper-top-product').map((index, element) => {
        const productName = $(element).find('.imgContainer').attr('aria-label').trim();
        const productCode = $(element).find('.imgContainer').data('product-code');
        const imageUrl = $(element).find('.pic').attr('src');
        const price = $(element).find('.number').text().trim();
        const currency = '₪'; 
        return { productName, productCode, imageUrl, price, currency };
      }).get();

      saveProducts(products);
  
      return products;
    } catch (error) {
      throw new Error('Error scraping data:', error);
    }
  }

module.exports = {scrapeSupermarket};

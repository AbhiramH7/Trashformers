// Central config — change BASE_URL to match your environment

const Config = {
  // Android emulator → host machine localhost
  // For physical device: replace with your machine's local IP e.g. 'http://192.168.1.10:8000/api'
  BASE_URL: 'http://10.0.2.2:8000/api',

  // Pagination
  PAGE_SIZE: 15,

  // Request timeout in ms
  TIMEOUT_MS: 10000,

  // App info
  APP_NAME: 'Trashformers',
  APP_VERSION: '1.0.0',
};

export default Config;

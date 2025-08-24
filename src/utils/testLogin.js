const axios = require('axios');

const login = async () => {
  try {
    const response = await axios.post('http://192.168.5.195:8283/api/login', {
      email: 'jean.martin@example.com',
      password: 'securePass!2025' // Mot de passe mis à jour
    });

    console.log('Login successful:', response.data);
    const token = response.data.data.token;
    const user = response.data.data.user;

    // Simuler le stockage du token pour une utilisation ultérieure
    console.log('Token:', token);
    console.log('User:', user);
    
    // Simuler le stockage du token
    if (token) {
      console.log('Token would be stored successfully in sessionStorage.');
    } else {
      console.log('Failed to store token.');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

login();

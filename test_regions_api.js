const axios = require('axios');

async function testRegions() {
    try {
        const response = await axios.get('http://localhost:3000/api/regiones');
        console.log('Status:', response.status);
        console.log('Data Type:', typeof response.data);
        console.log('Is Array:', Array.isArray(response.data));
        console.log('First Item:', response.data[0]);
        console.log('Length:', response.data.length);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testRegions();
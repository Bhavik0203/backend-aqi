const axios = require('axios');

async function checkApi() {
    try {
        const res = await axios.get('http://localhost:5000/api/kits');
        console.log('Status:', res.status);
        console.log('Success:', res.data.success);
        console.log('Data Length:', res.data.data ? res.data.data.length : 'N/A');
        if (res.data.data && res.data.data.length > 0) {
            console.log('Sample Kit:', res.data.data[0].kit_serial_number);
        }
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

checkApi();

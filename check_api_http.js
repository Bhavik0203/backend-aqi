const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/kits',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    console.log('Status Code:', res.statusCode);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Success:', json.success);
            console.log('Data Length:', json.data ? json.data.length : 'N/A');
            if (json.data && json.data.length > 0) {
                console.log('Sample Kit Serial:', json.data[0].kit_serial_number);
                console.log('Sample Kit Customer:', json.data[0].customer_name);
            } else {
                console.log('Data is empty or invalid structure');
                console.log('Full response:', data);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw Data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e.message);
});

req.end();

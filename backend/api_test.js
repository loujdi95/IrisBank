const jwt = require('jsonwebtoken');
const http = require('http');

async function testApi() {
    const token = jwt.sign({ id: 4, est_admin: 0 }, 'IrisBankSecretKey2026!', { expiresIn: '30d' });
    console.log("Token:", token);

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/accounts',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };

    const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            console.log("Status:", res.statusCode);
            console.log("Response:", data);
        });
    });

    req.on('error', error => {
        console.error("Error:", error);
    });

    req.end();
}
testApi();

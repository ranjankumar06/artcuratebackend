const http = require('http');
const urlencode = require('urlencode');

let sendSMS = () => {
    return new Promise((resolve, reject) => {
        const msg = urlencode('hello js');
        const number = '919035845781';
        const username = 'purvairai@hotmail.com';
        const hash = '1a1905e593d76735acbd13d6108462889e27e22b3712cb8a9ff5522292d02e33'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
        const sender = 'ARTCRT';
        let apiKey = "NjU2NDU2NGU0NDUxNjI3NDU2NTg0MjU4Njk0MTQyNDU="; //Text local api key
        // let data = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + number + '&message=' + msg
        let data = 'apikey=' + apiKey + '&sender=' + sender + '&numbers=' + number + '&message=' + msg
        const options = {
            host: 'api.textlocal.in',
            path: '/send?' + data
        };
        try {
            http.request(options, (response) => {
                var str = '';
                //another chunk of data has been recieved, so append it to `str`
                let counter = 1;
                response.on('data', (chunk) => {
                    console.log("Called " + counter)
                    console.log(chunk);
                    str += chunk;
                    counter = counter + 1;
                });
                //the whole response has been recieved, so we just print it out here
                response.on('end', () => {
                    console.log(str);
                    resolve(str);
                });
            }).end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = sendSMS;
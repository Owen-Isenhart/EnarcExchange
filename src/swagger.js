const swaggerAutogen = require('swagger-autogen')();


const doc = {
    info: {
        title: 'enarcExchange API',
        description: 'Prediction Market API for UTD',
    },

    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointFiles = ['./server.js']
swaggerAutogen(outputFile, endpointFiles, doc).then(() => {
    require('./server.js')
});
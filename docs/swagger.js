import swaggerAutogen from 'swagger-autogen';

// Get host dynamically
const host = process.env.WEBSITE_HOSTNAME || 'localhost';
const doc = {
    info: {
        version: "0.1.1",
        title: "Backend API",
        description: "Backend App Mobile for LOT Internacional",
        contact: {
            name: "marco.bardales@lotinternacional.com",
        }
    },
    host: host,
    basePath: "/",
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    externalDocs: {
        description: "swagger.json",
        url: `${host}/docs/swagger.json`
    },
    definitions: {
        Profile: {
            id: 1,
            status: ""
        },
        Profiles: [{
            id: 1,
            status: ""
        }],
    }
};
const outputFile = './docs/swagger.json';
swaggerAutogen(outputFile, ['./src/index.js'], doc);
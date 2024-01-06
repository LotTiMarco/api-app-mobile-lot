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
    },
    components: {
        schemas: {
        },
        securitySchemes:{
            basicAuth: {
                type: 'http',
                scheme: 'basic'
            },
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        },
        responses: {
            LoginResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "success"
                    },
                    data: {
                        type: "object",
                        description: "Data",
                        properties: {
                            userId: {
                                type: "string",
                                description: "User id",
                                example: "..."
                            },
                            userRole: {
                                type: "string",
                                description: "User role",
                                example: "..."
                            },
                            accessToken: {
                                type: "string",
                                description: "JWToken",
                                example: "..."
                            }
                        }
                    }
                }
            },
            UnauthorizedError: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "error"
                    },
                    message: {
                        type: "string",
                        description: "Unauthorized",
                        example: "Usuario o contraseña invalida."
                    },
                    code: {
                        type: "string",
                        description: "Error code",
                        example: "authentication_failed"
                    }
                }
            },
            NotFoundError: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "error"
                    },
                    message: {
                        type: "string",
                        description: "Error message",
                        example: "Recursos no encontrados."
                    },
                    code: {
                        type: "string",
                        description: "Error code",
                        example: "not_found"
                    }
                }
            },
            InternalServerError: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "error"
                    },
                    message: {
                        type: "string",
                        description: "Error message",
                        example: "${error.message}"
                    },
                    code: {
                        type: "string",
                        description: "Error code",
                        example: "internal_server_error"

                    }
                }
            }
        }
    }
};
const outputFile = './docs/swagger.json';
swaggerAutogen({openapi: '3.0.0'})(outputFile, ['./src/index.js'], doc);
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
    },
    components: {
        schemas: {
            NewCompany: {
                credentials: {
                    email: '...',
                    password: '...'
                },
                profile: {
                    companyName: '...',
                    ruc: '...',
                    address: '...',
                    legalRepresentative: '...',
                    email: '...',
                    phone: '...',
                    country: '...',
                    logo: 'base64()' // Base64
                }
            },
            NewPerson: {
                credentials: {
                    email: '...',
                    password: '...'
                },
                profile: {
                    fullName: '...',
                    dni: '...',
                    address: '...',
                    email: '...',
                    phone: '...',
                    country: '...',
                    photo: 'base64()' // Base64
                }
            }
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
        examples: {
            newCompany:{
                value:{
                    credentials: {
                        email: '...',
                        password: '...'
                    },
                    profile: {
                        companyName: '...',
                        ruc: '...',
                        address: '...',
                        legalRepresentative: '...',
                        email: '...',
                        phone: '...',
                        country: '...',
                        logo: 'base64()'
                    }
                },
                summary: "New company"
            },
            newPerson:{
                value:{
                    credentials: {
                        email: '...',
                        password: '...'
                    },
                    profile: {
                        fullName: '...',
                        dni: '...',
                        address: '...',
                        email: '...',
                        phone: '...',
                        country: '...',
                        photo: 'base64()'
                    }
                },
                summary: "New person"
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
            AllUsersResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "success"
                    },
                    data: {
                        type: "array",
                        description: "Data",
                        items: {
                            type: "object",
                            properties: {
                                userRole: {
                                    type: "string",
                                    description: "User role",
                                    example: "..."
                                },
                                userId: {
                                    type: "string",
                                    description: "User id",
                                    example: "..."
                                },
                                email: {
                                    type: "string",
                                    description: "Email",
                                    example: "..."
                                },
                                name: {
                                    type: "string",
                                    description: "Name",
                                    example: "..."
                                }
                            }
                        }
                    },
                    pageCount: {
                        type: "integer",
                        description: "Page count",
                        example: 1
                    },
                    itemCount: {
                        type: "integer",
                        description: "Item count",
                        example: 1
                    },
                    pages: {
                        type: "array",
                        description: "Pages",
                        items: {
                            type: "object",
                            properties: {
                                number: {
                                    type: "integer",
                                    description: "Number",
                                    example: 1
                                },
                                url: {
                                    type: "string",
                                    description: "Url",
                                    example: "..."
                                },
                            }
                        }
                    },
                    has_more: {
                        type: "boolean",
                        description: "Has more",
                        example: false
                    }
                }
            },
            AllUsersRoleResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "success"
                    },
                    data: {
                        type: "array",
                        description: "Data",
                        items: {
                            type: "object",
                            properties: {
                                userRole: {
                                    type: "string",
                                    description: "User role",
                                    example: "..."
                                },
                                userId: {
                                    type: "string",
                                    description: "User id",
                                    example: "..."
                                },
                                userEmail: {
                                    type: "string",
                                    description: "Email",
                                    example: "..."
                                },
                                personalEmail: {
                                    type: "string",
                                    description: "Email",
                                    example: "..."
                                },
                                name: {
                                    type: "string",
                                    description: "Name",
                                    example: "..."
                                }
                            }
                        }
                    },
                    pageCount: {
                        type: "integer",
                        description: "Page count",
                        example: 1
                    },
                    itemCount: {
                        type: "integer",
                        description: "Item count",
                        example: 1
                    },
                    pages: {
                        type: "array",
                        description: "Pages",
                        items: {
                            type: "object",
                            properties: {
                                number: {
                                    type: "integer",
                                    description: "Number",
                                    example: 1
                                },
                                url: {
                                    type: "string",
                                    description: "Url",
                                    example: "..."
                                },
                            }
                        }
                    },
                    has_more: {
                        type: "boolean",
                        description: "Has more",
                        example: false
                    }
                }
            },
            NewUserResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "success"
                    },
                    _data: {
                        type: "object",
                        description: "if userRole is company, name key: data",
                        properties: {
                            userId: {
                                type: "string",
                                description: "User id",
                                example: "..."
                            },
                            companyName: {
                                type: "string",
                                description: "Company name",
                                example: "..."
                            },
                            ruc: {
                                type: "string",
                                description: "RUC",
                                example: "..."
                            },
                            address: {
                                type: "string",
                                description: "Address",
                                example: "..."
                            },
                            legalRepresentative: {
                                type: "string",
                                description: "Legal representative",
                                example: "..."
                            },
                            email: {
                                type: "string",
                                description: "Email",
                                example: "..."
                            },
                            phone: {
                                type: "string",
                                description: "Phone",
                                example: "..."
                            },
                            country: {
                                type: "string",
                                description: "Country",
                                example: "..."
                            },
                            logo: {
                                type: "string",
                                description: "Logo URL",
                                example: "..."
                            }
                        }
                    },
                    __data: {
                        type: "object",
                        description: "if userRole is auditor or commercial, name key: data",
                        properties: {
                            userId: {
                                type: "string",
                                description: "User id",
                                example: "..."
                            },
                            fullName: {
                                type: "string",
                                description: "Full name",
                                example: "..."
                            },
                            dni: {
                                type: "string",
                                description: "DNI",
                                example: "..."
                            },
                            address: {
                                type: "string",
                                description: "Address",
                                example: "..."
                            },
                            email: {
                                type: "string",
                                description: "Email",
                                example: "..."
                            },
                            phone: {
                                type: "string",
                                description: "Phone",
                                example: "..."
                            },
                            country: {
                                type: "string",
                                description: "Country",
                                example: "..."
                            },
                            photo: {
                                type: "string",
                                description: "Photo URL",
                                example: "..."
                            }
                        }
                    }
                }
            },
            BadRequestError: {
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
                        example: "bad_request"
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
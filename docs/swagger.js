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
    // host: host,
    servers: [
        {
            url: "http://localhost/",
            description: "TEST SERVER"
        },
        {
            url: "https://backend-app-lot.onrender.com/",
            description: "PRODUCTION SERVER (free)"
        }
    ],
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
            },
            UpdateCompany: {
                update: {
                    address: '...'
                }
            },
            UpdatePerson: {
                update: {
                    address: '...',
                    phone: '...'
                }
            },
            UpdateCompanyImage: {
                update: {
                    logo: 'base64()' // Base64
                }
            },
            UpdatePersonImage: {
                update: {
                    photo: 'base64()' // Base64
                }
            },
            NewYear: {
                year: '...'
            },
            NewFile: {
                fileIndex: '...'
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
                        email: 'auditor@lotinternacional.com',
                        password: 'auditor'
                    },
                    profile: {
                        fullName: 'Nombre de Auditor',
                        dni: '87654991',
                        address: '...',
                        email: 'auditor2@lotinternacional.com',
                        phone: '...',
                        country: '...',
                        photo: 'data:image/jpeg;base64,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'
                    }
                },
                summary: "New person"
            },
            updateCompany:{
                value:{
                    update: {
                        address: '...'
                    }
                },
                summary: "Update company"
            },
            updatePerson:{
                value:{
                    update: {
                        address: '...',
                        phone: '...'
                    }
                },
                summary: "Update person"
            },
            updateCompanyImage:{
                value:{
                    update: {
                        logo: 'base64()' // Base64
                    }
                },
                summary: "Update company image"
            },
            updatePersonImage:{
                value:{
                    update: {
                        photo: 'base64()' // Base64
                    }
                },
                summary: "Update person image"
            },
            newYear:{
                value:{
                    year: '2024'
                },
                summary: "New year"
            },
            newFile:{
                value:{
                    fileIndex: '...'
                },
                summary: "New file"
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
                                name: {
                                    type: "string",
                                    description: "Name",
                                    example: "..."
                                },
                                identifier: {
                                    type: "string",
                                    description: "Identifier (DNI or RUC)",
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
                                name: {
                                    type: "string",
                                    description: "Name",
                                    example: "..."
                                },
                                identifier: {
                                    type: "string",
                                    description: "Identifier (DNI or RUC)",
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
                    data: {
                        type: "object",
                        description: "Data",
                        properties: {
                            userId: {
                                type: "string",
                                description: "User id",
                                example: "..."
                            },
                            name: {
                                type: "string",
                                description: "Company name",
                                example: "..."
                            },
                            identifier: {
                                type: "string",
                                description: "RUC or DNI",
                                example: "..."
                            }
                        }
                    }
                }
            },
            SearchUserResponse: {
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
                                name: {
                                    type: "string",
                                    description: "Name",
                                    example: "..."
                                },
                                identifier: {
                                    type: "string",
                                    description: "Identifier (DNI or RUC)",
                                    example: "..."
                                }
                            }
                        }
                    }
                }
            },
            AllYearsResponse: {
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
                            description: "Years info",
                            properties: {
                                userId: {
                                    type: "string",
                                    description: "User id",
                                    example: "..."
                                },
                                year: {
                                    type: "string",
                                    description: "Year",
                                    example: "2021"
                                }
                            }
                        }
                    }
                }
            },
            AllFilesResponse: {
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
                            description: "Files info",
                            properties: {
                                fileId: {
                                    type: "string",
                                    description: "File Id",
                                    example: "..."
                                },
                                fileIndex: {
                                    type: "string",
                                    description: "File index",
                                    example: "..."
                                }
                            }
                        }
                    }
                }
            },
            AllSubscriptionsResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "success",
                    },
                    data: {
                        type: "array",
                        description: "Data",
                        items: {
                            type: "object",
                            description: "Subscriptions info",
                            properties: {
                                tokenDevice: {
                                    type: "string",
                                    description: "Token device",
                                    example: "..."
                                },
                                userEmail: {
                                    type: "string",
                                    description: "Email personal o de la empresa",
                                    example: "..."
                                },
                                userRole: {
                                    type: "string",
                                    description: "User role",
                                    example: "..."
                                }
                            }
                        }
                    }
                }
            },
            CreatedResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status",
                        example: "success"
                    },
                    data: {
                        type: "object",
                        description: "Data (opcional)"
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
            ConflictError: {
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
                        example: "El ... ya existe."
                    },
                    code: {
                        type: "string",
                        description: "Error code",
                        example: "conflict"
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
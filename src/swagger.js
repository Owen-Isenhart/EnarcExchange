const swaggerAutogen = require('swagger-autogen')();


const doc = {
    info: {
        title: 'enarcExchange API',
        description: 'Prediction Market API for UTD',
        version: '1.0.0',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            in: 'header',
            description: 'JWT authorization header'
        }
    },
    definitions: {
        // User definitions
        User: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                username: { type: 'string', example: 'johndoe' },
                email: { type: 'string', example: 'john@example.com' },
                balance: { type: 'number', example: 1000.00 },
                created_at: { type: 'string', format: 'date-time' }
            }
        },
        // Market definitions
        Market: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                title: { type: 'string', example: 'Will it rain tomorrow?' },
                description: { type: 'string', example: 'Prediction market for tomorrow weather' },
                status: { type: 'string', enum: ['open', 'closed', 'resolved'] },
                created_at: { type: 'string', format: 'date-time' },
                resolved_at: { type: 'string', format: 'date-time' }
            }
        },
        MarketCreate: {
            type: 'object',
            required: ['title', 'description'],
            properties: {
                title: { type: 'string', example: 'Will it rain tomorrow?' },
                description: { type: 'string', example: 'Prediction market for tomorrow weather' }
            }
        },
        MarketUpdate: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Will it rain tomorrow?' },
                description: { type: 'string', example: 'Updated description' },
                status: { type: 'string', enum: ['open', 'closed', 'resolved'] }
            }
        },
        // Outcome definitions
        Outcome: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                market_id: { type: 'integer', example: 1 },
                description: { type: 'string', example: 'Yes, it will rain' },
                created_at: { type: 'string', format: 'date-time' }
            }
        },
        OutcomeCreate: {
            type: 'object',
            required: ['market_id', 'description'],
            properties: {
                market_id: { type: 'integer', example: 1 },
                description: { type: 'string', example: 'Yes, it will rain' }
            }
        },
        OutcomeUpdate: {
            type: 'object',
            properties: {
                description: { type: 'string', example: 'Yes, it will rain' }
            }
        },
        // Price definitions
        Price: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                outcome_id: { type: 'integer', example: 1 },
                price: { type: 'number', minimum: 0, maximum: 1, example: 0.45 },
                created_at: { type: 'string', format: 'date-time' }
            }
        },
        PriceCreate: {
            type: 'object',
            required: ['outcome_id', 'price'],
            properties: {
                outcome_id: { type: 'integer', example: 1 },
                price: { type: 'number', minimum: 0, maximum: 1, example: 0.45 }
            }
        },
        PriceUpdate: {
            type: 'object',
            required: ['price'],
            properties: {
                price: { type: 'number', minimum: 0, maximum: 1, example: 0.52 }
            }
        },
        // Bet definitions
        Bet: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                user_id: { type: 'integer', example: 1 },
                outcome_id: { type: 'integer', example: 1 },
                amount: { type: 'number', example: 100.00 },
                status: { type: 'string', enum: ['open', 'won', 'lost', 'cancelled'] },
                created_at: { type: 'string', format: 'date-time' }
            }
        },
        BetCreate: {
            type: 'object',
            required: ['outcome_id', 'amount'],
            properties: {
                outcome_id: { type: 'integer', example: 1 },
                amount: { type: 'number', example: 100.00 }
            }
        },
        // Transaction definitions
        Transaction: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                user_id: { type: 'integer', example: 1 },
                type: { type: 'string', enum: ['deposit', 'withdrawal', 'bet', 'win', 'transfer'] },
                amount: { type: 'number', example: 50.00 },
                description: { type: 'string', example: 'Bet placed on outcome 5' },
                created_at: { type: 'string', format: 'date-time' }
            }
        },
        TransactionCreate: {
            type: 'object',
            required: ['type', 'amount'],
            properties: {
                type: { type: 'string', enum: ['deposit', 'withdrawal', 'bet', 'win', 'transfer'] },
                amount: { type: 'number', example: 50.00 },
                description: { type: 'string', example: 'Deposit via credit card' }
            }
        },
        // Error response
        Error: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Error message' }
            }
        },
        PaginatedResponse: {
            type: 'object',
            properties: {
                data: { type: 'array' },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', example: 100 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        canPaginate: { type: 'boolean', example: true }
                    }
                }
            }
        }
    }
};

const outputFile = './swagger-output.json';
const endpointFiles = ['./server.js']
swaggerAutogen(outputFile, endpointFiles, doc).then(() => {
    require('./server.js')
});
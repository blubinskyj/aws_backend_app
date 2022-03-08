const schema = {
    properties: {
        queryStringParameters: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['OPEN', 'CLOSED'],
                    default: 'OPEN'
                },
            },
        },
    },
    type: 'object',
    required: [
        'queryStringParameters',
    ],
};

module.exports = schema;
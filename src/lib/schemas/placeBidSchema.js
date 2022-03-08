const Schema = {
    properties: {
        body: {
            type: 'object',
            properties: {
                amount: {
                    type: 'number',
                },
            },
            required: ['amount'],
        },
    },
    type: 'object',
    required: ['body'],
};
module.exports = Schema
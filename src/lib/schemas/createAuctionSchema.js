const Schema = {
    properties: {
        body: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                },
            },
            required: ['title'],
        },
    },
    type: 'object',
    required: ['body'],
};
module.exports = Schema
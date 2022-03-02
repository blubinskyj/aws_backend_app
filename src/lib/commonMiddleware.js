const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');

const middlewares = [httpJsonBodyParser(), httEventNormalizer(),httpErrorHandler()];

module.exports = middlewares;

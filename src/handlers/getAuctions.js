'use strict';

const AWS = require('aws-sdk');
const middy = require('@middy/core');
const commonMiddleware = require('../lib/commonMiddleware');
const validator = require('@middy/validator');
const createError = require('http-errors');
const getAuctionsSchema = require('../lib/schemas/getAuctiionsSchema')

const dynamodb = new AWS.DynamoDB.DocumentClient();



const getAuctions = async (event) => {
    const { status } = event.queryStringParameters;
    let auctions;

    const params = {
        TableName: 'AuctionsTable',
        IndexName: 'statusAndEndData',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
            ':status': status,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    try {
        const result = await dynamodb.query(params).promise();
        auctions = result.Items;

    } catch (error) {
        console.log(error);
        throw new createError(500);
    }

    return {
        statusCode: 200, headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        }, body: JSON.stringify(auctions),
    };

};

const handler = middy(getAuctions)
    .use(commonMiddleware)
    .use(validator({
        inputSchema: getAuctionsSchema,
        useDefault: true,
    }));

module.exports = {handler}
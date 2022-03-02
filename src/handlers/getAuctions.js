'use strict';

const AWS = require('aws-sdk');
const middy = require("@middy/core");
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')


const dynamodb = new AWS.DynamoDB.DocumentClient();

const getAuctions = async () => {
    let auctions;

    try {
        const result = await dynamodb.scan({TableName: 'AuctionsTable'}).promise();
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

const handler = middy(getAuctions).use(commonMiddleware)

module.exports = {handler}
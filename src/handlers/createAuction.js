'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const middy = require("@middy/core");
const validator = require('@middy/validator');
const createAuctionSchema = require('../lib/schemas/createAuctionSchema')
const commonMiddleware = require('../lib/commonMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event, context) => {

    const {title} = event.body;
    const {email} = event.requestContext.authorizer;
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1)

    const auction = {
        id: uuid.v4(),
        title,
        status: 'OPEN',
        createdAt: now.toISOString(),
        endingAt: endDate.toISOString(),
        highestBid: {
            amount: 0,
        },
        seller: email,
    };

    await dynamodb.put({
        TableName: 'AuctionsTable',
        Item: auction,
    }).promise();

    return {
        statusCode: 201, headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        }, body: JSON.stringify(auction),
    };

};

const handler = middy(createAuction)
    .use(commonMiddleware)
    .use(validator({inputSchema: createAuctionSchema}));
module.exports = {handler}
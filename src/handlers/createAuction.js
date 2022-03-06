'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const middy = require("@middy/core");
const commonMiddleware = require('../lib/commonMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {

    const {title} = event.body;
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
        }
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

const handler = middy(createAuction).use(commonMiddleware)
module.exports = {handler}
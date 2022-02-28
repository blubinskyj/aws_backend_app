'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.createAuction = async (event, context, callback) => {

    const {title} = JSON.parse(event.body);
    const now = new Date();

    const auction = {
        id: uuid.v4(),
        title,
        status: 'OPEN',
        createdAt: now.toISOString(),
    };

    await dynamodb.put({
        TableName: 'AuctionsTable',
        Item: auction,
    }).promise();

    const response = {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        },
        body: JSON.stringify(auction),
    };

    callback(null, response);
};

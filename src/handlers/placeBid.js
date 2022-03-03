'use strict';

const AWS = require('aws-sdk');
const middy = require("@middy/core");
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

const placeBid = async (event) => {
    const {id} = event.pathParameters;
    const {amount} = event.body;

    const params = {
        TableName: 'AuctionsTable',
        Key: {id},
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: 'ALL_NEW',
    };

    let updatedAuction;

    try {
        const result = await dynamodb.update(params).promise();
        updatedAuction = result.Attributes;
    }catch (error){
        console.log(error);
        throw new createError(500);
    }

    return {
        statusCode: 200, headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        }, body: JSON.stringify(updatedAuction),
    };

};

const handler = middy(placeBid).use(commonMiddleware)
module.exports = {handler}
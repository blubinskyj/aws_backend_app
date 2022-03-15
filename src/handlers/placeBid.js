'use strict';

const AWS = require('aws-sdk');
const middy = require("@middy/core");
const validator = require('@middy/validator');
const placeBidSchema = require('../lib/schemas/placeBidSchema')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

const placeBid = async (event) => {
    const {id} = event.pathParameters;
    const {amount} = event.body;
    const {email} = event.requestContext.authorizer;

    //TODO: It must be a function
    let auction;

    try {
        const result = await dynamodb.get({
            TableName: 'AuctionsTable',
            Key: {id},
        }).promise();

        auction = result.Item
    } catch (error) {
        console.log(error);
        throw new createError(500);
    }

    if (!auction) {
        throw new createError(404)
    }

    //Bid identity validation
    if (email === auction.seller){
        throw new createError(403, 'You can not dib on your own auctions!')
    }

    //Avoid double bidding
    if(email === auction.highestBid.bidder){
        throw new createError(403 , 'You are already the highest bidder')
    }

    //Auction status validation
    if (auction.status !== 'OPEN'){
        throw new createError(403, 'You cannot bid on closed auction')
    }

    //Dib amount validation
    if (amount <= auction.highestBid.amount){
        throw new createError(403, `Your bid must be higher than ${auction.highestBid.amount}`)
    }
    //


    const params = {
        TableName: 'AuctionsTable',
        Key: {id},
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email,
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

const handler = middy(placeBid)
    .use(commonMiddleware)
    .use(validator({inputSchema: placeBidSchema}));
module.exports = {handler}
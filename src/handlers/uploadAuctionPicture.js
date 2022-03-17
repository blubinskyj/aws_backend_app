'use strict';

const {uploadPictureToS3} = require('../lib/uploadPictureToS3');
const AWS = require("aws-sdk");
const middy = require('@middy/core');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors');
const {setAuctionPictureUrl} = require('../lib/setAuctionPictureUrl')
const dynamodb = new AWS.DynamoDB.DocumentClient();

const uploadAuctionPicture = async (event) => {
    const {id} = event.pathParameters;
    const {email} = event.requestContext.authorizer;
    let auction;

    //TODO: It must be a function
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
    ///

    if (auction.seller !== email){
        throw new createError(403, 'You are not thr seller of this auction!');
    }

    const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    let updatedAuction;

    try {
        const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
        updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
    } catch (error) {
        console.error(error);
        throw new createError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
}

const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler());
module.exports = {handler};
'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function closeAuction(auction) {
    const params = {
        TableName: 'AuctionsTable',
        Key: {id: auction.id},
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED',
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    return await dynamodb.update(params).promise();
}

module.exports = {closeAuction};
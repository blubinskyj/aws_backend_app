'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

async function closeAuction(auction) {
    const params = {
        TableName: 'AuctionsTable',
        Key: { id: auction.id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED',
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    await dynamodb.update(params).promise();

    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Your item has been sold!',
            recipient: seller,
            body: `Congratulation! Your itme "${title}" has been sold for $${amount}.`,
        }),
    }).promise();

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'You won an auction!',
            recipient: bidder,
            body: `Congratulation! You got yourself a "${title}" for $${amount}.`,
        }),
    }).promise();

    return Promise.all([notifySeller, notifyBidder]);
}

module.exports = {closeAuction};
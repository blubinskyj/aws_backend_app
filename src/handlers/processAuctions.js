const {getEndedAuctions} = require('../lib/getEndedAuctions');
const {closeAuction} = require('../lib/closeAuction');
const createError = require('http-errors');


const processAuctions = async () => {
    try {
        const auctionsToClose = await getEndedAuctions();
        console.log(auctionsToClose)
        const closePromises = auctionsToClose.map(auction => closeAuction(auction));
        await Promise.all(closePromises);

        return {closed: closePromises.length}
    } catch (error) {
        console.error(error);
        throw new createError(500);
    }

}

const handler = processAuctions;
module.exports = {handler}
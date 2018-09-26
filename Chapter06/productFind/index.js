const lex = require('./LexResponses');
const Lex = new lex();
const AWS = require('aws-sdk');
const s3 = new AWS.S3();


exports.handler = async (event) => {
    if (event.currentIntent && event.currentIntent.confirmationStatus) {
        let confirmationStatus = event.currentIntent.confirmationStatus;
        if (confirmationStatus == "Denied") {
            console.log('got denied status');
            let message = `Thank you for shopping with us today. Have a nice day`
            return Lex.close({ message })
        }
        if (confirmationStatus == 'Confirmed') {
            console.log('got confirmed status');
        }
    }
    return handleProductFind(event);
}

const handleProductFind = event => {
    let { slots } = event.currentIntent;
    let { itemNumber, type, size, colour, length } = slots;

    if (itemNumber) return getItem(slots);
    // No item number so using normal product find
    if (!type) {
        let message = 'Are you looking for a shirt, jacket or trousers?';
        let intentName = 'productFind';
        let slotToElicit = 'type';
        return Lex.elicitSlot({ message, intentName, slotToElicit, slots })
    }
    if (!size) {
        let message = `What size of ${type} are you looking for?`;
        let intentName = 'productFind';
        let slotToElicit = 'size';
        return Lex.elicitSlot({ message, intentName, slotToElicit, slots })
    }
    if (!colour) {
        let message = 'What colour would you like?';
        let intentName = 'productFind';
        let slotToElicit = 'colour';
        return Lex.elicitSlot({ message, intentName, slotToElicit, slots })
    }
    if (!length && type === 'trousers') {
        let message = 'Are you looking for short, standard or long trousers?';
        let intentName = 'productFind';
        let slotToElicit = 'length';
        return Lex.elicitSlot({ message, intentName, slotToElicit, slots })
    }

    return getItem(slots);
}

const getItem = async slots => {
    console.log('slots', slots);
    let { itemNumber, type, size, colour, length } = slots;
    let stock = await getStock();
    let matching = stock.find(item =>
        itemNumber === item.itemNumber ||
        type == item.type &&
        size == item.size &&
        colour == item.colour &&
        (item.length == length || item.type != 'trousers'));
    if (!matching) {
        let message = `Unfortunately we couldn't find the item you were looking for`;
        return Lex.close({ message })
    }
    if (matching.stock < 1) {
        let message = `Unfortunately we don't have anything matching your request in stock. Would you like to search again?`;
        let intentName = 'productFind';
        slots = { type: null, size: null, colour: null, length: null, itemNumber: null };
        return Lex.confirmIntent({ intentName, slots, message })
    }
    let message = `There are ${matching.stock} ${matching.colour} ${units(matching.type, matching.stock)} in stock. Would you like to add one to your basket?`;
    let intentName = 'addToCart';
    slots = { itemNumber: matching.itemNumber };
    return Lex.confirmIntent({ intentName, slots, message });
}

const units = (type, stock) => {
    if (type === 'trousers') {
        return `pair${stock === 1 ? 's': ''} of trousers`
    }
    return `${type}${stock === 1 ? 's': ''}`;
}

const getStock = () => {
    var params = {
        Bucket: 'shopping-stock',
        Key: `stock.json`
    };

    return new Promise((resolve, reject) => {
        s3.getObject(params, function(err, data) {
            if (err) { // an error occurred
                reject(err)
            } else { // successful response
                resolve(JSON.parse(data.Body).stock)
            }
        });
    })
}
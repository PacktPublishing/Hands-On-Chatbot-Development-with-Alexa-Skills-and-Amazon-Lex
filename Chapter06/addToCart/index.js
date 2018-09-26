const lex = require('./LexResponses');
const Lex = new lex();
const db = require('./DB');
const DB = new db();
const uuidv4 = require('uuid/v4');

exports.handler = async (event) => {
    if (event.currentIntent && event.currentIntent.confirmationStatus === "Denied") {
        let message = `Would you like to find another product?`;
        let intentName = 'productFind';
        let slots = { type: null, size: null, colour: null, length: null, itemNumber: null };
        return Lex.confirmIntent({ intentName, slots, message })
    }
    return handleAddToCart(event);
}

const handleAddToCart = async event => {
    let { slots } = event.currentIntent;
    let { itemNumber } = slots;

    if (!itemNumber) {
        let message = `You need to select a product before adding it to a cart. Would you like to find another product?`;
        let intentName = 'productFind';
        slots = { type: null, size: null, colour: null, length: null, itemNumber: null };
        return Lex.confirmIntent({ intentName, slots, message });
    }


    let [err, cartUser] = await to(DB.get("ID", event.userId, 'shopping-cart'));
    if (!cartUser) {
        cartUser = { ID: event.userId, Items: [], name: uuidv4(), TTL: 0 };
    }
    let updatedCart = { ...cartUser, ID: Math.random().toString(), userID: event.userId, Items: [...cartUser.Items, itemNumber], TTL: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    let [writeErr, res] = await to(DB.write(event.userId, updatedCart, 'shopping-cart'));
    if (writeErr) {
        let message = `Unfortunately we've had an error on our system and we can't add this to your cart.`;
        return Lex.close({ message });
    }
    let message = `Would you like to checkout, add another item to your cart or save your cart for later?`;
    return Lex.elicitIntent({ message });

}


const to = prom => prom.then(data => [null, data]).catch(err => [err, null]);
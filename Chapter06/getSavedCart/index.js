const lex = require('./LexResponses');
const Lex = new lex();
const db = require('./DB');
const DB = new db();

exports.handler = async (event) => {
    return handleGetSavedCart(event);
}

const handleGetSavedCart = async event => {
    let { userId, currentIntent: { slots } } = event;
    let { cartName } = slots;

    if (!cartName) {
        let message = `What name did you save your cart as?`;
        let intentName = 'getSavedCart';
        let slotToElicit = 'cartName';
        let slots = { cartName: null };
        return Lex.elicitSlot({ intentName, slots, slotToElicit, message });
    }

    let [err, carts] = await to(DB.getDifferent('cartName', cartName, 'shopping-cart'));
    if (err || !carts || !carts[0]) {
        let message = `We couldn't find a cart with that name. Would you like to try another name or start a new cart?`;
        return Lex.elicitIntent({ message });
    }
    let cart = carts[0];

    let oldCartID = cart.ID;
    let newCart = { ...cart, ID: userId, TTL: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    try {
        await DB.write(userId, newCart, 'shopping-cart');
        await DB.delete(oldCartID, 'shopping-cart');
    } catch (createErr) {
        let message = `Unfortunately we couldn't recover your cart. Would you like to create a new cart?`;
        let intentName = 'productFind';
        let slots = { type: null, size: null, colour: null, length: null, itemNumber: null };
        return Lex.confirmIntent({ intentName, slots, message });
    }

    let message = `We have got your cart for you. Would you like to checkout or add another product?`;
    return Lex.elicitIntent({ message });
}

const to = prom => prom.then(res => [null, res]).catch(err => [err, null]);
const lex = require('./LexResponses');
const Lex = new lex();
const db = require('./DB');
const DB = new db();

exports.handler = async (event) => {
    return handleSaveCart(event);
}

const handleSaveCart = async event => {
    let { slots } = event.currentIntent;
    let { cartName } = slots;

    if (!cartName) {
        let message = `You need to save your cart with a name. What do you want to call it?`;
        let intentName = 'saveCart';
        slots = { cartName: null };
        let slotToElicit = 'cartName';
        return Lex.elicitSlot({ intentName, slotToElicit, slots, message });
    }

    let [err, cart] = await to(DB.get('ID', event.userId, 'shopping-cart'));
    if (err || !cart || !cart.Items) {
        let message = `You don't have a cart. Would you like to find a product?`;
        let intentName = 'productFind';
        slots = { type: null, size: null, colour: null, length: null, itemNumber: null };
        return Lex.confirmIntent({ intentName, slots, message });
    }

    let [getCartErr, getCart] = await to(DB.get('name', cartName, 'shopping-cart'));
    if (!getCart) {
        // No cart with that name so we can save the current cart to this name
        return addNameToCart(cart, cartName);
    }
    let message = `Unfortunately you can't use that name. Please choose another name.`;
    let intentName = 'saveCart';
    let slotToElicit = 'cartName';
    slots = { cartName: null };
    return Lex.elicitSlot({ intentName, slots, slotToElicit, message });
}

const addNameToCart = async (cart, cartName) => {
    cart.name = cartName;
    let [err, res] = await to(DB.write(cart.ID, cart, 'shopping-cart'));
    if (err) {
        console.log('err writing cart with name', err);
        let message = `Unfortunately we cant save your cart`;
        return Lex.close({ message });
    }
    let message = `Your cart has been saved. Type "find my cart" next time and enter "${cartName}" to get this cart.`;
    return Lex.close({ message });
}

const to = prom => prom.then(res => [null, res]).catch(err => [err, null]);
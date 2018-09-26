const lex = require('./LexResponses');
const Lex = new lex();
const db = require('./DB');
const DB = new db();
const uuidv4 = require('uuid/v4');

exports.handler = async (event) => {
    if (event.currentIntent && event.currentIntent.confirmationStatus === "Denied") {
        let message = `Would you like to find another product?`;
        let intentName = 'productFind';
        slots = { type: null, size: null, colour: null, length: null, itemNumber: null };
        return Lex.confirmIntent({ intentName, slots, message });
    }
    return handleCheckout(event);
}

const handleCheckout = async event => {
    let { slots } = event.currentIntent;
    let { deliveryAddress } = slots;

    if (!deliveryAddress) {
        let message = `What address would you like this order delivered to?`;
        let intentName = 'checkout';
        slots = { deliveryAddress: null };
        let slotToElicit = 'deliveryAddress'
        return Lex.elicitSlot({ message, intentName, slots, slotToElicit });
    }

    let [cartErr, cart] = await to(DB.get("ID", event.userId, 'shopping-cart'));
    if (!cart) {
        console.log('no cart');
        let message = `We couldn't find your cart. Is there anything else I can help you with`;
        return Lex.elicitIntent({ message });
    }

    let order = { Items: cart.Items, address: deliveryAddress, date: Date.now() };
    let ID = uuidv4();
    try {
        await to(DB.write(ID, order, 'shopping-orders'));
        await to(DB.delete(event.userId, 'shopping-cart'));
    } catch (err) {
        console.log('error deleting the cart or writing the order.', cartErr);
        let message = `I'm sorry, there was a system error so your order hasn't been placed.`;
        return Lex.close({ message });
    }
    let message = `Thank you. Your order has been placed and will be delivered in 3-5 working days`;
    return Lex.close({ message });
}

const to = prom => prom.then(res => [null, res]).catch(e => [e, null]);
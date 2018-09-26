const lex = require('./LexResponses');
const Lex = new lex();
const db = require('./DB');
const DB = new db();
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    return handleWhatsInMyCart(event);
}

const handleWhatsInMyCart = async event => {
    let [err, cart] = await to(DB.get('ID', event.userId, 'shopping-cart'));
    if (err || !cart || cart.Items.length == 0) {
        let message = `You don't appear to have a cart. If you have saved a cart then you can recover it by typing "Get my cart", or you can say "I want to buy something"`;
        return Lex.elicitIntent({ message });
    }

    let items = {};
    cart.Items.forEach(item => {
        items[item] = (items[item] && items[item].quantity) ? { quantity: items[item].quantity + 1 } : { quantity: 1 };
    });

    const [s3Err, products] = await to(getStock());
    if (s3Err || !products) {
        let message = `Unfortunately our system has had an error.`;
        Lex.close({ message });
    }

    products.forEach(product => {
        if (items[product.itemNumber]) {
            items[product.itemNumber] = { ...product, ...items[product.itemNumber] };
        }
    });

    let itemStrings = Object.values(items).map(item => {
        let { type, size, colour, length, quantity } = item;
        return `${quantity} ${size}, ${length ? `${length}, ` : ''}${colour} ${units(type, quantity)}`;
    });

    let message = `You have ${itemStrings.slice(0,-1).join(', ')}${itemStrings.length > 1 ? ` and `: ""}${itemStrings.pop()} in your cart. Would you like to checkout, save your cart or add another item?`;
    return Lex.elicitIntent({ message });
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

const to = prom => prom.then(res => [null, res]).catch(err => [err, null]);
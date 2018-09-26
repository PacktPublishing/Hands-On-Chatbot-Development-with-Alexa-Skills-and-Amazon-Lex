const AWS = require('aws-sdk');
const lexruntime = new AWS.LexRuntime();


exports.handler = async (event) => {

    if (event.httpMethod === "POST") {
        let reply = await sendToLex(event);
        return done(reply);
    }
};

const sendToLex = async event => {
    console.log('event', event);
    let messageForLex = mapMessageToLex(JSON.parse(event.body));

    let lexPromise = new Promise((resolve, reject) => {
        lexruntime.postText(messageForLex, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    });

    let [err, res] = await to(lexPromise);
    if (err) {
        return { err }
    }
    console.log('lex response', res);
    return { res: { message: res.message } }
}

const mapMessageToLex = message => {
    return {
        botAlias: 'prod',
        botName: 'shoppingBot',
        inputText: message.text,
        userId: message.sessionID,
        sessionAttributes: {}
    };
}

const to = prom => prom.then(res => [null, res]).catch(err => [err, null]);

const done = ({ err, res }) => {
    console.log('res', res);
    console.log('error', err);
    return {
        statusCode: err ? '404' : '200',
        body: err ? JSON.stringify({ error: err }) : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Origin': '*'
        },
    };
}
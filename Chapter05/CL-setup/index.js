const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async event => {

    console.log(event);
    let intentName = event.currentIntent.name;

    var params = {
        Bucket: 'cl-faq',
        Key: `faq-setup.json`
    };

    return new Promise((resolve, reject) => {
        s3.getObject(params, function(err, data) {
            if (err) { // an error occurred
                reject(handleS3Error(err));
            } else { // successful response
                console.log(data);
                resolve(handleS3Data(data, intentName));
            }
        });
    })
};

const handleS3Error = err => {
    console.log('error of: ', err);
    let errResponse = `Unfortunately I don't know how to answer that. Is there anything else I can help you with?`;
    return lexElicitIntent({ message: errResponse });
}

const handleS3Data = (data, intentName) => {
    let body = JSON.parse(data.Body);
    if (!body[intentName]) {
        return handleS3Error(`Intent name ${intentName} was not present in faq-setup.json`);
    }
    return lexClose({ message: body[intentName] });
}

const lexClose = ({ message, sessionAttributes = {}, fulfillmentState = "Fulfilled" }) => {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message: { contentType: 'PlainText', content: message }
        }
    }
}

const lexElicitIntent = ({ message, sessionAttributes = {} }) => {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitIntent',
            message: { contentType: 'PlainText', content: message }
        },
    };
}
module.exports = class Lex {

    elicitSlot({ sessionAttributes = {}, message, intentName, slotToElicit, slots }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                intentName,
                slots,
                slotToElicit,
                message: { contentType: 'PlainText', content: message }
            },
        };
    }

    close({ message, sessionAttributes = {}, fulfillmentState = "Fulfilled" }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'Close',
                fulfillmentState,
                message: { contentType: 'PlainText', content: message }
            }
        }
    }

    elicitIntent({ message, sessionAttributes = {} }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitIntent',
                message: { contentType: 'PlainText', content: message }
            },
        };
    }

    confirmIntent({ sessionAttributes = {}, intentName, slots, message }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ConfirmIntent',
                intentName,
                slots,
                message: { contentType: 'PlainText', content: message }
            },
        };
    }

    delegate({ sessionAttributes = {}, slots }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'Delegate',
                slots,
            },
        };
    }
}
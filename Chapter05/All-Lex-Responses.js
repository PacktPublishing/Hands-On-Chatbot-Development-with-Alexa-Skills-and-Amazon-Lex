const lexElicitSlot = ({ sessionAttributes = {}, message, intentName, slotToElicit, slots }) => {
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

const lexElicitIntent = ({ message, sessionAttributes = {} }) => {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitIntent',
            message: { contentType: 'PlainText', content: message }
        },
    };
}

const lexConfirmIntent = ({ sessionAttributes = {}, intentName, slots, message }) => {
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

const lexClose = ({ sessionAttributes = {}, fulfillmentState = 'Fulfilled', message }) => {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message: { contentType: 'PlainText', content: message }
        },
    };
}

const lexDelegate = ({ sessionAttributes = {}, slots }) => {
    return {
        sessionAttributes,
        dialogAction: { type: 'Delegate', slots, }
    };
}
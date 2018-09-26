module.exports = class Lex {

    elicitSlot({ sessionAttributes = {}, message, intentName, slotToElicit, slots, responseCard = null }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                intentName,
                slots,
                slotToElicit,
                message: { contentType: 'PlainText', content: message },
                responseCard
            },
        };
    }

    close({ message, sessionAttributes = {}, fulfillmentState = "Fulfilled", responseCard = null }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'Close',
                fulfillmentState,
                message: { contentType: 'PlainText', content: message },
                responseCard
            }
        }
    }

    elicitIntent({ message, sessionAttributes = {}, responseCard = null }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitIntent',
                message: { contentType: 'PlainText', content: message },
                responseCard
            },
        };
    }

    confirmIntent({ sessionAttributes = {}, intentName, slots, message, responseCard = null }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ConfirmIntent',
                intentName,
                slots,
                message: { contentType: 'PlainText', content: message },
                responseCard
            },
        };
    }

    delegate({ sessionAttributes = {}, slots }) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'Delegate',
                slots
            },
        };
    }

    createCardFormat(cards) {
        return {
            version: 1,
            contentType: "application/vnd.amazonaws.card.generic",
            genericAttachments: cards.map(({ title, subTitle, imageUrl, linkUrl, buttons }) => {
                return {
                    title,
                    subTitle,
                    imageUrl,
                    attachmentLinkUrl: linkUrl,
                    buttons: buttons.map(({ text, value }) => {
                        return {
                            text,
                            value,
                        }
                    })
                }
            })
        }
    }
}
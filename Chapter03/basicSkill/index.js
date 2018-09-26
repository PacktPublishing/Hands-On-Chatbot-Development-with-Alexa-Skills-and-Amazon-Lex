const Alexa = require('ask-sdk-core');

const helloHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'hello';
    },
    handle(handlerInput) {
        const speechText = `Hello from Sam's new intent 3!`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        helloHandler)
    .lambda();
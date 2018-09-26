const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const cars = [
    { name: 'fiat500', size: 'small', cost: 'luxury', doors: 3, gears: '' },
    { name: 'fordFiesta', size: 'small', cost: 'luxury', doors: 5, gears: '' },
    { name: 'hyundaiI20', size: 'small', cost: 'value', doors: 3, gears: '' },
    { name: 'peugeot208', size: 'small', cost: 'value', doors: 5, gears: '' },

    { name: 'vauxhallAstra', size: 'medium', cost: 'value', doors: 5, gears: '' },
    { name: 'vwGolf', size: 'medium', cost: 'luxury', doors: 5, gears: '' },

    { name: 'scodaOctaviaAuto', size: 'large', cost: 'value', doors: 5, gears: 'automatic' },
    { name: 'fordCmax', size: 'large', cost: 'value', doors: 5, gears: 'manual' },
    { name: 'mercedesEClass', size: 'large', cost: 'luxury', doors: 5, gears: 'automatic' },
    { name: 'Vauxhall Insignia', size: 'large', cost: 'luxury', doors: 5, gears: 'manual' }
];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = `Hi there, I'm Car Helper. You can ask me to suggest a car for you.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const WhichCarHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'whichCar';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const { size, cost, gears, doors } = slots;

        if (!size || !(size.value === 'large' || size.value === 'medium' || size.value == 'small')) {
            const slotToElicit = 'size';
            const speechOutput = 'What size car do you want? Please say either small, medium or large.';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .addElicitSlotDirective(slotToElicit)
                .getResponse();
        }

        if (!cost || !(cost.value === 'luxury' || cost.value === 'value')) {
            const slotToElicit = 'cost';
            const speechOutput = 'Are you looking for a luxury or value car?';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .addElicitSlotDirective(slotToElicit)
                .getResponse();
        }

        if (size.value === 'large' && (!gears || !(gears.value === 'automatic' || gears.value === 'manual'))) {
            // missing or incorrect gears
            const slotToElicit = 'gears';
            const speechOutput = 'Do you want an automatic or a manual transmission?';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .addElicitSlotDirective(slotToElicit)
                .getResponse();
        }

        if (size.value === 'small' && (!doors || !(doors.value == 3 || doors.value == 5))) {
            // missing or incorrect doors
            const slotToElicit = 'doors';
            const speechOutput = 'Do you want 3 or 5 doors?';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .addElicitSlotDirective(slotToElicit)
                .getResponse();
        }

        // find the ideal car

        let chosenCar = cars.filter(car => {
            return (car.size === size.value && car.cost === cost.value &&
                ((gears && gears.value) ? car.gears === gears.value : true) &&
                ((doors && doors.value) ? car.doors == doors.value : true));
        });
        console.log('chosenCar', chosenCar);

        if (chosenCar.length !== 1) {
            const speechOutput = `Unfortunately I couldn't find the best car for you. You can say "suggest a car" if you want to try again.`;
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();
        }

        var params = {
            Bucket: 'car-data-sam',
            Key: `${chosenCar[0].name}.json`
        };

        return new Promise((resolve, reject) => {
            s3.getObject(params, function(err, data) {
                if (err) { // an error occurred
                    console.log(err, err.stack);
                    reject(handleS3Error(handlerInput));
                } else { // successful response
                    console.log(data);
                    resolve(handleS3Data(handlerInput, data));
                }
            });
        })
    }
};

const handleS3Error = handlerInput => {
    const speechOutput = `I've had a problem finding the perfect car for you.`
    return handlerInput.responseBuilder
        .speak(speechOutput)
        .getResponse();
};


function handleS3Data(handlerInput, data) {
    console.log('body= ', JSON.parse(data.Body.toString()));
    let { make, model, rrp, fuelEcon, dimensions, NCAPSafetyRating, cargo } = JSON.parse(data.Body.toString());
    let speechOutput = `I think that a ${make} ${model} would be a good car for you. 
    They're available from ${rrp} pounds, get ${fuelEcon} and have a ${cargo} litre boot.`;
    console.log(speechOutput);
    return handlerInput.responseBuilder
        .speak(speechOutput)
        .getResponse();
}

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        WhichCarHandler
    )
    .lambda();
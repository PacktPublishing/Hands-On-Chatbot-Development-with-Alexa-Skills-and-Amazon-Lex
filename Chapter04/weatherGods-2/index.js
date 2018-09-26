const axios = require('axios');
const moment = require('moment');
const Alexa = require('ask-sdk');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'You may ask the weather gods about the weather in your city or for a weather forecast';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak(`Sorry, I can't understand the command. Please say again.`)
            .getResponse();
    },
};

let jokes = [
    `Where do snowmen keep their money? <break time="2s" /> In a <emphasis> snow bank </emphasis>`,
    `As we waited for a bus in the frosty weather, the woman next to me mentioned that she makes a lot of mistakes when texting in the cold. I nodded knowingly. <break time="1s" /> It’s the early signs of <emphasis> typothermia </emphasis>`,
    `Don’t knock the weather. <break time="1s" /> If it didn’t change once in a while, nine tenths of the people <emphasis> couldn’t start a conversation</emphasis>`
];

const JokeHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'tellAJoke';
    },
    async handle(handlerInput) {
        let random = Math.floor(Math.random() * 3);
        let joke = jokes[random];
        return handlerInput.responseBuilder
            .speak(joke)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const GetWeatherHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'getWeather';
    },
    async handle(handlerInput) {
        console.log('start get weather');
        const { slots } = handlerInput.requestEnvelope.request.intent;
        let { location, date } = slots;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        console.log('sessionAttributes', sessionAttributes);
        location = location.value || sessionAttributes.location || null;
        date = date.value || sessionAttributes.date || null;
        sessionAttributes = { location, date };

        if (!location) {
            console.log('get location');
            let slotToElicit = 'location';
            let speechOutput = 'Where do you want to know the weather for?';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .addElicitSlotDirective(slotToElicit)
                .getResponse();
        }
        if (!date) {
            date = Date.now()
        }

        let isToday = moment(date).isSame(Date.now(), 'day');

        try {
            if (isToday) {
                console.log('isToday');
                let [error, response] = await to(axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location},us&appid=${process.env.API_KEY}`));
                let { data: weatherResponse } = response;
                if (error) {
                    console.log('error getting weather', error.response);
                    let errorSpeech = `We couldn't get the weather for ${location} but you can try again later`;
                    return handlerInput.responseBuilder
                        .speak(errorSpeech)
                        .getResponse();
                }
                let { weather, main: { temp, humidity } } = weatherResponse;
                console.log('got weather response', weatherResponse);
                let weatherString = formatWeatherString(weather);
                let formattedTemp = tempC(temp);
                // let formattedTemp = tempF(temp);
                let speechText = `The weather in ${location} has ${weatherString} with a temperature of ${formattedTemp} and a humidity of ${humidity} percent`;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .withShouldEndSession(false)
                    .getResponse();
            } else {
                let { data: forecastResponse } = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${location},us&appid=${process.env.API_KEY}`);
                let { list } = forecastResponse;
                // reduce the data we keep
                let usefulForecast = list.map(weatherPeriod => {
                    let { dt_txt, weather, main: { temp, humidity } } = weatherPeriod;
                    return { dt_txt, weather, temp, humidity }
                });
                // reduce to 9am and 6pm forecasts only
                let reducedForecast = usefulForecast.filter(weatherPeriod => {
                    let time = weatherPeriod.dt_txt.slice(-8);
                    return time === '09:00:00' || time === '18:00:00';
                });
                console.log('got forecaset and reduced it ', reducedForecast);
                // reduce to the day the user asked about 
                let dayForecast = reducedForecast.filter(forecast => {
                    return moment(date).isSame(forecast.dt_txt, 'day');
                });

                let weatherString = dayForecast.map(forecast => formatWeatherString(forecast.weather));
                let formattedTemp = dayForecast.map(forecast => tempC(forecast.temp));
                let humidity = dayForecast.map(forecast => forecast.humidity);
                let speechText = `The weather in ${location} ${date} will have ${weatherString[0]} with a temperature of ${formattedTemp[0]} and a humidity of ${humidity[0]} percent, whilst in the afternoon it will have ${weatherString[1]} with a temperature of ${formattedTemp[1]} and a humidity of ${humidity[1]} percent`;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .withShouldEndSession(false)
                    .getResponse();
            }
        } catch (err) {
            console.log('err', err)
            return handlerInput.responseBuilder
                .speak(`My powers are weak and I couldn't get the weather right now.`)
                .getResponse();
        }
    }
}

const to = promise => promise.then(res => [null, res]).catch(err => [err, null]);

const tempC = temp => Math.floor(temp - 273.15) + ' degrees Celsius ';

const tempF = temp => Math.floor(9 / 5 * (temp - 273) + 32) + ' Fahrenheit';

const formatWeatherString = weather => {
    if (weather.length === 1) return weather[0].description;
    return weather.slice(0, -1).map(item => item.description).join(', ') + ' and ' + weather.slice(-1)[0].description;
};


exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetWeatherHandler,
        JokeHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
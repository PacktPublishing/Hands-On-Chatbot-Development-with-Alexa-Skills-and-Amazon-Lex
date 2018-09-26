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

const GetWeatherHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'getWeather';
    },
    async handle(handlerInput) {
        console.log('start get weather');
        const { slots } = handlerInput.requestEnvelope.request.intent;
        let { location, date } = slots;
        location = location.value || null;
        date = date.value || null;

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

        if (isToday) {
            console.log('isToday');
            let { data: weatherResponse } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location},us&appid=${process.env.API_KEY}`);
            let { weather, main: { temp, humidity } } = weatherResponse;
            console.log('got weather response', weatherResponse);
            let weatherString = formatWeatherString(weather);
            let formattedTemp = tempC(temp);
            // let formattedTemp = tempF(temp);
            let speechText = `The weather in ${location} has ${weatherString} with a temperature of ${formattedTemp} and a humidity of ${humidity} percent`;
            return handlerInput.responseBuilder
                .speak(speechText)
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
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }
    }
}

const tempC = temp => Math.floor(temp - 273.15) + ' degrees Celsius ';

const tempF = temp => Math.floor(9 / 5 * (temp - 273) + 32) + ' Fahrenheit';

const formatWeatherString = weather => {
    if (weather.length === 1) return weather[0].description;
    return weather.slice(0, -1).map(item => item.description).join(', ') + ' and ' + weather.slice(-1)[0].description;
};


exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetWeatherHandler
    )
    .lambda();
const HR = require('./hr');

exports.handler = async (event) => {
    // TODO implement
    console.log(event);
    let {
        name,
        age
    } = event;
    // same as => let name = event.name; let age = event.age

    return createString(name, age);
};


const createString = (name, age) => {
    return `Hi ${name}, you are ${age} years old and have a maximum heart rate of ${HR.calculateHR(age)}.`;
};
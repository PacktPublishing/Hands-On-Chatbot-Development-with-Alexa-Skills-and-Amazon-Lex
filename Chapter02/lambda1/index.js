exports.handler = async (event) => {
    // TODO implement
    console.log(event);
    let {
        name,
        age
    } = event;
    // same as => let name = event.name; let age = event.age

    return 'Hello from Lambda!'
};
if (document.readyState === 'complete') {
    start();
} else {
    document.addEventListener("DOMContentLoaded", start())
}

function to(prom) {
    return prom.then(res => [null, res]).catch(err => [err, null])
}

function start() {

    const URL = 'https://8hzzu5mwnk.execute-api.eu-west-1.amazonaws.com/production/shopping-bot';
    // unique code for this session
    const sessionID = Math.random().toString().slice(-16);

    let messageArea = document.querySelector('#messageArea');
    let textArea = document.querySelector('#textInput');
    let sendButton = document.querySelector('#sendButton');


    sendButton.addEventListener('click', async e => {
        let text = textArea.value;
        console.log(text);
        if (!text) return;
        // Add to sent messages
        let sendElement = document.createElement('div');
        sendElement.classList.add('sendMessage');
        sendElement.classList.add('message');
        sendElement.appendChild(document.createTextNode(text));
        messageArea.appendChild(sendElement);

        // send to the API
        let [err, response] = await to(axios.post(URL, { text, sessionID }));

        let responseMessage;
        if (err) {
            responseMessage = 'Sorry I appear to have had an error';
        } else {
            responseMessage = response.data.message;
        }

        // adding the response to received messages
        let receiveElement = document.createElement('div');
        receiveElement.classList.add('receivedMessage');
        receiveElement.classList.add('message');
        receiveElement.appendChild(document.createTextNode(responseMessage));
        messageArea.appendChild(receiveElement);

    });
};
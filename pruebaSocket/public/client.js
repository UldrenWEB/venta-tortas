'use strict'

// console.log(client);
import Client from "./clientSocket.js"


const getDataUsername = async () => {
    const username = localStorage.getItem('username')
    if (username) {
        console.log('User exists');
    }
    const res = await fetch('https://random-data-api.con/api/users/random_user')
    const { username: randomUsername } = await res.json()
    localStorage.setItem('username', randomUsername);
    return randomUsername;
}
function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateName() {
    let name1 = ["uldren", "julio", "erika", 'ramon', 'william', 'finol', 'garcia', 'gabi', 'sol']


    var name = capFirst(name1[getRandomInt(0, name1.length + 1)]);
    return name;

}

const btn = document.querySelector('.btnEnviar')
const input = document.querySelector('.input')
const client = new Client({
    io: io,
    url: 'https://wsq5tmzj-1234.use.devtunnels.ms/',
    rooms: {
        chat: true,
        hola: true
    }
});
const person = {
    user: generateName()
}
const socket = client.createSocketClient(person)

client.joinNamespace(socket);

btn.addEventListener('click', () => {
    const message = input.value;
    client.sendMessageBroadcast({
        socket: socket,
        message: message
    })
    input.value = ''
})
client.listenEvents(socket);







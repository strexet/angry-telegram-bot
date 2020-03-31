const http = require('http');
const port = process.env.PORT;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('<body>StrexetBot\n\n<a href="magicsolitairecollection://callback/">magicsolitairecollection</a>\n</body>');
});

server.listen(port);


const TelegramBot = require('node-telegram-bot-api');
const RiveScript = require("rivescript");
const fs = require("fs");

const WRU = require("./Tools/WRU.js");
const PrivateData = require("./Private/PrivateData.js");

const token = PrivateData.token;

// Create a telegram that uses 'polling' to fetch new updates
const telegram = new TelegramBot(token, { polling: true });

const riveBot = new RiveScript({ utf8: true });
const punctuation = new RegExp(/[.,!;:]/g);

const PleaseNoWRU = "PleaseNoWRU:";

function loading_done(msg) {
    // Now the replies must be sorted!
    riveBot.sortReplies();

    sendResponse(msg);
}

function sendResponse(msg) {
    const chatId = getChatId(msg);
    const user = 'user_' + chatId;

    let inputText = getMessageString(msg);

    let inputWRU = WRU.strToWru(inputText);

    console.log(addTimeStampTo('You(' + user + ')> ') + inputText);

    setTimeout(function() {
        // Wait on the promise:
        riveBot.reply(user, inputWRU).then(function(outputWRU) {
            let outpuText = WRU.WruToStr(outputWRU);

            console.log('Bot> ' + outpuText);

            sendMessageToTelegram(msg, outpuText, 10);
        });
    }, 500);
}

function loading_error(err, filename, lineno) {
    console.log("Error when loading files: " + err + ". Filename: " + filename + ". Line number: " + lineno);
}


function addTimeStampTo(str) {
    var currDate = new Date();

    var timeNow = [];
    timeNow[0] = currDate.getFullYear();
    timeNow[1] = currDate.getMonth() + 1;
    timeNow[2] = currDate.getDate();
    timeNow[3] = currDate.getHours();
    timeNow[4] = currDate.getMinutes();
    timeNow[5] = currDate.getSeconds();

    for (var i = 1; i < timeNow.length; i++) {
        if (timeNow[i].toString().length == 1) {
            timeNow[i] = '0' + timeNow[i];
        }
    }

    var dateTimeString = timeNow[2] + '.' + timeNow[1] + '.' + timeNow[0] +
        ' ' + timeNow[3] + ':' + timeNow[4] + ':' + timeNow[5];
    return dateTimeString + '$ ' + str;
}


// Commands
var waitingForWord = false;
var waitingForMeaning = false;

var waitingForQuestion = false;
var waitingForAnswer = false;

var recordingDialogInput = false;
var recordingDialogOutput = false;

var wordForMeaning;
var questionToAnswer;
var dialogInput;
var dialogOutput;
var dialogIndex;

var text_add = 'Добавить боту в мозг...';
var text_dialog = 'dialog';
var text_response = 'reply';
var text_meaning = 'meaning';
var text_start = 'start'

var command_add = new RegExp(text_add);
var command_addDialog = new RegExp('\/' + text_dialog);
var command_addResponse = new RegExp('\/' + text_response);
var command_addMeaning = new RegExp('\/' + text_meaning);
var command_start = new RegExp('\/' + text_start);

telegram.on('polling_error', (error) => {
    console.log(error); // => 'EFATAL'
});

telegram.on('callback_query', (msg) => {
    switch (msg.data) {
        case text_dialog:
            onAddDialog(msg);
            break;

        case text_response:
            onAddResponse(msg);
            break;

        case text_meaning:
            onAddMeaning(msg);
            break;
    }
});

function getChatId(msg) {
    if ('chat' in msg) {
        return msg.chat.id;
    } else if ('from' in msg) {
        return msg.from.id;
    } else {
        console.log("ERROR!!! Can't get chat id!");
    }
}

function onAddDialog(msg) {
    let chatId = getChatId(msg)
    const resp = 'Напиши свои реплики в этом диалоге. В конце напиши команду "/ответить"';

    recordingDialogInput = true;
    dialogInput = [];

    sendMessageToTelegram(msg, resp);
}

function onAddResponse(msg) {
    const chatId = getChatId(msg)
    const resp = 'Отклик на какую реплику?';

    waitingForQuestion = true;

    sendMessageToTelegram(msg, resp);
}

function onAddMeaning(msg) {
    const chatId = getChatId(msg)
    const resp = 'Какое новое значение (для известного боту слова)?';

    waitingForWord = true;

    sendMessageToTelegram(msg, resp);
}


telegram.onText(command_start, msg => {
    let startMessage = "Добавляй ответы на реплики для бота, объясняй значения неизвестных боту слов.\nИ просто общайся с ботом";

    let replyKeyboard = {
        "reply_markup": {
            keyboard: [
                [text_add]
            ],
            resize_keyboard: true
        }
    };

    sendDataToTelegram(msg, startMessage, replyKeyboard);
});

telegram.onText(command_add, msg => {

    const chatId = msg.chat.id;
    const respText = 'Что добавить?';
    const respButtons = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                // [{ text: 'Диалог', callback_data: text_dialog }],
                [{ text: 'Отклик бота на твою реплику', callback_data: text_response }],
                [{ text: 'Новое для бота значение слова', callback_data: text_meaning }]
            ]
        })
    };

    sendDataToTelegram(msg, respText, respButtons);
});

telegram.onText(command_addDialog, (msg) => {
    onAddDialog(msg);
});

telegram.onText(/\/ответить/, (msg) => {
    if (!recordingDialogInput) return;

    recordingDialogInput = false;

    if (dialogInput.length == 0) {
        const resp = 'Диалог пуст. Добавлять здесь нечего...';
        sendMessageToTelegram(msg, resp);
        return;
    }

    recordingDialogOutput = true;
    dialogOutput = [];

    const resp = 'Напиши, что бот должен отвечать в этом дилоге';
    dialogIndex = 1;

    sendMessageToTelegram(msg, resp);
    sendMessageToTelegram(msg, dialogInput[0]);

});


telegram.onText(command_addResponse, (msg) => {
    onAddResponse(msg);
});


telegram.onText(command_addMeaning, (msg) => {
    onAddMeaning(msg);
});


function processWord(msg) {
    wordForMeaning = getMessageString(msg);

    const resp = 'Для какого известного боту слова?';

    sendMessageToTelegram(msg, resp);
}

function processMeaning(msg) {
    const meaning = getMessageString(msg);

    let newSub = '\n// ' + wordForMeaning + ' = ' + meaning + '\n' +
        '! sub ' + WRU.strToWru(wordForMeaning) + ' = ' + WRU.strToWru(meaning) + '\n';

    fs.appendFileSync("brain/newSubs.rive", newSub, "UTF-8", { 'flags': 'a' });

    const resp = 'Значение добавлено!';

    sendMessageToTelegram(msg, resp);
}

function processQuestion(msg) {
    questionToAnswer = getMessageString(msg);

    const resp = 'Напиши отклик бота на эту реплику';

    sendMessageToTelegram(msg, resp);
}

function processAnswer(msg) {
    const answer = getOriginalMessageString(msg);

    const resp = 'Отклик добавлен!';

    let newResp = '\n// ' + questionToAnswer + '\n' +
        '+ ' + replaceSpacesWithOptionalStars(WRU.strToWru(questionToAnswer)) + '\n' +
        '- ' + answer + '\n';

    fs.appendFileSync("brain/newResps.rive", newResp, "UTF-8", { 'flags': 'a' });

    sendMessageToTelegram(msg, resp);
}

function processDialog(msg) {
    let newDialog = '\n\n\n// + ' + dialogInput[0] + '\n' +
        '// - ' + dialogOutput[0] + '\n' +
        '+ ' + WRU.strToWru(dialogInput[0]) + '\n' +
        '- ' + WRU.strToWru(dialogOutput[0]) + '\n';

    // for (let i = 1; i < dialogInput.length; i++) {
    //   newDialog = newDialog + '\n// + ' + dialogInput[i] + '\n'
    //                           + '// % ' + dialogOutput[i-1] + '\n'
    //                           + '// - ' + dialogOutput[i] + '\n'
    //                           + '+ ' + WRU.strToWru(dialogInput[i]) + '\n'
    //                           + '% ' + WRU.strToWru(dialogOutput[i-1]) + '\n'
    //                           + '- ' + WRU.strToWru(dialogOutput[i]) + '\n';
    // }

    console.log(newDialog);

    fs.appendFileSync("brain/newDialogs.rive", newDialog, "UTF-8", { 'flags': 'a' });

    const resp = 'Диалог добавлен!';

    sendMessageToTelegram(msg, resp);
}

function addDialogInput(msg) {
    const input = getMessageString(msg);

    dialogInput.push(input);
}

function addDialogOutput(msg) {
    if (dialogIndex < dialogInput.length) {
        const output = getMessageString(msg);

        dialogOutput.push(output);

        const resp = dialogInput[dialogIndex];

        dialogIndex++;

        sendMessageToTelegram(msg, resp);
    } else {
        recordingDialogOutput = false;
        processDialog(msg);
    }
}


function sendMessageToTelegram(originalMessage, resp, timeout = 350) {
    const chatId = getChatId(originalMessage);
    setTimeout(() => {
        telegram.sendMessage(chatId, resp);
    }, timeout);
}

function sendDataToTelegram(originalMessage, respText, data, timeout = 350) {
    const chatId = getChatId(originalMessage);
    setTimeout(() => {
        telegram.sendMessage(chatId, respText, data);
    }, timeout);
}


// recieving messages from telegram

function getOriginalMessageString(msg) {
    let msgString = msg.text.trim();

    return msgString;
}

function getCaseSensitiveMessageString(msg) {
    let msgString = getOriginalMessageString(msg);

    for (let i = msgString.search(punctuation); i >= 0; i = msgString.search(punctuation)) {

        msgString = msgString.slice(0, i) + msgString.slice(i + 1);
    }

    return msgString;
}

function getMessageString(msg) {
    return getCaseSensitiveMessageString(msg).toLowerCase();
}


// regular chat with riveBot

function replaceSpacesWithOptionalStars(string) {
    let result = '[*]' + string.replace(/\s/g, '[*]') + '[*]';

    return result;
}


// Listen for any kind of message. There are different kinds of messages.
telegram.on('message', recieveMessage);

function recieveMessage(msg) {

    if (msg.text[0] == '\/') return;

    if (msg.text == text_add) return;

    if (waitingForWord) {
        waitingForWord = false;
        waitingForMeaning = true;
        processWord(msg);
        return;
    }

    if (waitingForMeaning) {
        waitingForMeaning = false;
        processMeaning(msg);
        return;
    }

    if (waitingForQuestion) {
        waitingForQuestion = false;
        waitingForAnswer = true;
        processQuestion(msg);
        return;
    }

    if (waitingForAnswer) {
        waitingForAnswer = false;
        processAnswer(msg);
        return;
    }

    if (recordingDialogInput) {
        addDialogInput(msg);
        return;
    }

    if (recordingDialogOutput) {
        addDialogOutput(msg);
        return;
    }

    riveBot.loadDirectory("brain")
        .then(function() { loading_done(msg); })
        .catch(loading_error);
}
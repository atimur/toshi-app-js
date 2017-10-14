const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

var rp = require('request-promise');


let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {
  welcome(session)
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'ping':
      pong(session)
      break
    case 'count':
      count(session)
      break
    case 'token1':
      token1Bal(session)
      break
    case 'donate':
      donate(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessage(session, `Heyyyy!!`)
}

function pong(session) {
  sendMessage(session, `Pong`)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(1))
  })
}


function token1Bal(session) {

  var options = {
    uri: 'https://api.tokenbalance.com/token/0x8f8221afbb33998d8584a2b05749ba73c37a938a/0xfdae0a43d0a26befb74ad531b83f285e40b3abab',
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

rp(options)
    .then(function (repos) {

        console.log('User has %d repos', repos.balance);
        sendMessage(session, repos.balance)
    })
    .catch(function (err) {
        // API call failed...
        console.log("failed")
    });

  

  
}

// HELPERS

function sendMessage(session, message) {
  // let controls = [
  //   {type: 'button', label: 'Ping', value: 'ping'},
  //   {type: 'button', label: 'Count', value: 'count'},
  //   {type: 'button', label: 'Donate', value: 'donate'}
  // ]
  // session.reply(SOFA.Message({
  //   body: message,
  //   controls: controls,
  //   showKeyboard: false,
  // }))


  session.reply(SOFA.Message({
    body: "What would you like to do next?",
    controls: [
      {
        type: "group",
        label: "Trip",
        controls: [
          {type: "button", label: "Directions", action: "Webview::http://faucet.ropsten.be:3001"},
          {type: "button", label: "Timetable", value: "timetable"},
          {type: "button", label: "Exit Info", value: "exit"},
          {type: "button", label: "Service Conditions", action: "Webview::https://0xproject.com/portal"}
        ]
      },
      {
        type: "group",
        label: "see balance",
        controls: [
          {type: "button", label: "token1", value: "token1"}
        ]
      },
      {
        type: "group",
        label: "Services",
        "controls": [
          {type: "button", label: "Buy Ticket", action: "Webview::http://06890ec1.ngrok.io/"},
          {type: "button", label: "Support", value: "support"}
        ]
      }
    ]
  }))
}

const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

var rp = require('request');


// EWA token:
// `0x6FC773BA50dc1dc6A4A3698251BAF3Cee1B6eb26`
// EWB token:
// `0x92112771f33BE187CaF2226a041bE6F2bC2319f5`

let bot = new Bot()

let tokens = {
  "EWA": "0x6FC773BA50dc1dc6A4A3698251BAF3Cee1B6eb26",
  "EWB": "0x92112771f33BE187CaF2226a041bE6F2bC2319f5"
}

let tokenNames = ["EWA", "EWB"]

// let tokenPairs = 


let transferURL = 'https://b54e5c11.ngrok.io'
let swapURL = ''
let allowanceURL = ''

function transferURLConstruct(tokenName){
  return transferURL + '/?tokenAddress='+tokens[tokenName]
}

function swapURLConstruct(t1, t2){
  return swapURL+"/?makerTokenAddress="+tokens[t1]+'?takerTokenAddress='+tokens[t2]
}

function allowSpendingURLConstruct(tokenName){
  return allowanceURL + '/?tokenAddress='+tokens[tokenName]
}

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
    case tokenNames[0] || tokenNames[1]:
      tokenBalance(session, command.content.value)
      break
    case 'Transfer Token':
      transferToken(session)
      break
    case 'Swap Token':
      swapToken(session)
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


function allowSpending(session) {
  session.reply(SOFA.Message({
    body: "Which one?",
    controls: [
      {type: "button", label: tokenNames[0], action: "Webview::" +transferURLConstruct(tokenNames[0])},
      {type: "button", label: tokenNames[1], action: "Webview::" +transferURLConstruct(tokenNames[1])}
    ]
  }))
}


function swapToken(session) {
  session.reply(SOFA.Message({
    body: "Which pair?",
    controls: [
      {type: "button", label: tokenNames[0]+'->'+tokenNames[1], action: "Webview::" +swapURLConstruct(tokenNames[0], tokenNames[0])},
      {type: "button", label: tokenNames[1]+'->'+tokenNames[0], action: "Webview::" +swapURLConstruct(tokenNames[1], tokenNames[0])}
    ]
  }))

}


function transferToken(session) {


session.reply(SOFA.Message({
  body: "Which one?",
  controls: [
    {type: "button", label: tokenNames[0], action: "Webview::" +transferURLConstruct(tokenNames[0])},
    {type: "button", label: tokenNames[1], action: "Webview::" +transferURLConstruct(tokenNames[1])}
  ]
}))


  // sendMessage(session)

}



function tokenBalance(session, tokenName) {

//   var options = {
//     uri: 'https://api.tokenbalance.com/token/0x8f8221afbb33998d8584a2b05749ba73c37a938a/0xfdae0a43d0a26befb74ad531b83f285e40b3abab',
//     headers: {
//         'User-Agent': 'Request-Promise'
//     },
//     json: true // Automatically parses the JSON string in the response
// };

// rp(options)
//     .then(function (repos) {

//         console.log('User has %d repos', repos.balance);
//         sendMessage(session, repos.balance)
//     })
//     .catch(function (err) {
//         // API call failed...
//         console.log("failed")
//     });


    rp('https://api.tokenbalance.com/token/'+tokens[tokenName]+'/'+ session.get('paymentAddress'), 
    function (error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.

        if (!error && response.statusCode == 200) {
          var info = JSON.parse(body);
          console.log(info.balance + " Stars");
          // console.log(info.forks_count + " Forks");
          sendTokenBalance(session, "Your balance is: "+info.balance)
          
        }
        else{
          console.log(body + error)
          sendTokenBalance(session, "error")
          
        }
      
  })
  

  
}


function sendTokenBalance(session, bal) {
    
  session.reply(SOFA.Message({
    body: bal,
    showKeyboard: false
  }))

  sendMessage(session)
}

// HELPERS

function sendMessage(session) {



  session.reply(SOFA.Message({
    body: "What would you like to do next?",
    controls: [
      {
        type: "group",
        label: "See Token Balance",
        controls: [
          {type: "button", label: tokenNames[0], value: tokenNames[0]},
          {type: "button", label: tokenNames[1], value: tokenNames[1]}
          
        ]
      },
      {
        type: "group",
        label: "Token Actions",
        controls: [
          {type: "button", label: "Swap", value: "Swap Token"},
          {type: "button", label: "Transfer Token", value: "Transfer Token"}          
        ]
      },
    ]
  }))

}

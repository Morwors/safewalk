var testPoruke=async (phonenu,token)=>{
  var TeleSignSDK = require('telesignsdk');

    const customerId = "00EF77BA-F2DB-481A-A4EE-8F2898820ED4";
    const apiKey = "sAOpbqqiR/YVQmWYOLLCPHxeosAeqYNe+HaXM65ghzD80MvL6IsYFY7OOdrf6h4dTgN5Hsuwh8McbEKnov9QSg==";
    const rest_endpoint = "https://rest-api.telesign.com";
    const timeout = 10*1000; // 10 secs

    const client = new TeleSignSDK( customerId,
        apiKey,
        rest_endpoint,
        timeout // optional
        // userAgent
    );

    const phoneNumber = phonenu;
    const message = "Osoba je zapocelja kretanje ,pratite je ovde: http://localhost:3000/location/"+token;
    const messageType = "ARN";

    console.log("## MessagingClient.message ##");

    function messageCallback(error, responseBody) {
        if (error === null) {
            console.log(`Messaging response for messaging phone number: ${phoneNumber}` +
                ` => code: ${responseBody['status']['code']}` +
                `, description: ${responseBody['status']['description']}`);
        } else {
            console.error("Unable to send message. " + error);
        }
    }
    client.sms.message(messageCallback, phoneNumber, message, messageType);

}
module.exports={
  testPoruke
}
  
  
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({
    region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient()

exports.handler = function (event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 4));
    var message = event.Records[0].Sns.Message.split(",");
    var ddb = new AWS.DynamoDB({
        apiVersion: '2012-08-10'
    });
    var data2;
    var params = {
        TableName: 'csye6225',
        Key: {
            'username': {
                S: message[0]
            }
        }
    };

    ddb.getItem(params, function (err, data) {
        console.log(data)
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Item);
            data2 = data;
            console.log(data2.Item.username);
            if (data2.Item.username) {

                var params = {
                    Destination: {
                        /* required */
                        ToAddresses: [
                            message[0]
                            /* more items */
                        ]
                    },
                    Message: {
                        /* required */
                        Body: {
                            /* required */
                            Html: {
                                Charset: "UTF-8",
                                Data: "Hello, thank you for signing up. <br>Please use the following link to verify account:<br> " + "http://prod.xinyapp.me/v1/user/verifyUserEmail?email=" + message[0].replace(/\+/, "%2B") + "&token=" + message[1]
                            },
                            Text: {
                                Charset: "UTF-8",
                                Data: "Hello, thank you for signing up. <br>Please use the following link to verify account:<br> " + "http://prod.xinyapp.me/v1/user/verifyUserEmail?email=" + message[0].replace(/\+/, "%2B") + "&token=" + message[1]
                            }
                        },
                        Subject: {
                            Charset: 'UTF-8',
                            Data: 'Webapp verification email'
                        }
                    },
                    Source: "no-reply@prod.xinyapp.me" /* required */
                };


                // Create the promise and SES service object
                var sendPromise = new AWS.SES({
                    apiVersion: '2010-12-01'
                }).sendEmail(params).promise();


                sendPromise.then(
                    function(data) {
                      console.log(data)
                  }).catch(
                    function(err) {
                      console.error(err, err.stack);
                    })

            }
        }
    });
};

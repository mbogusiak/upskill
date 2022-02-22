var AWS = require('aws-sdk');
const { marshall } = require("@aws-sdk/util-dynamodb");
const snsTopic = process.env.SNS_TOPIC;
const awsRegion = process.env.AWS_REGION;
const { unmarshall } = require("@aws-sdk/util-dynamodb");

exports.processStreamHandler = (event) => {
   event.Records.map(record =>{
        if(record.eventName === 'INSERT'){
             const product = unmarshall(record.dynamodb.NewImage);
             return sendMessage(product).then((data,err)=>{
                if (err) {
                    console.log('Error sending a message', err);
                }
            });
        }
    });
}
function sendMessage(message){
    const snsSubject = 'SNS Subject';
    var params = {
      Message: JSON.stringify(message),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: message.eventType
        }},
      Subject: snsSubject,
      TopicArn: snsTopic
    };
    var sns = new AWS.SNS({ region: awsRegion });
    return sns.publish(params).promise();
}
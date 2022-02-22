const categoryDB = process.env.CATEGORY_DB;
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

exports.saveCategoryInDynamoDBHandler = async (event) => {

    const body = JSON.parse(event.Records[0].body);
    await addCategory(body.Message);
    const response = {
        statusCode: 200,
    };
    return response;
}
 async function addCategory(message){
    let category = JSON.parse(message);
    var params = {
        TableName : categoryDB,
        Item: category.body
    };

    return await docClient.put(params).promise();
}

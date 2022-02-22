// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const aggregateTable = process.env.AGGREGATE_STORE_TABLE;
const eventStoreTable = process.env.EVENT_STORE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.createCategoryHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

   const category = JSON.parse(event.body)

   await addCategoryToAggregateStore(category);
   await addCategoryToEventStore(category);

    return {
        statusCode: 200,
        body: JSON.stringify(category)
     };

    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}

 async function addCategoryToEventStore(category){
     console.log(category);
    const metaAggregate = {'id':category.id, 'eventType': 'ADD_CATEGORY', 'eventTime': Date.now()};

    var params = {
        TableName : eventStoreTable,
        Item: {... metaAggregate, 'body':category }
    };

    return await docClient.put(params).promise();
}

 async function addCategoryToAggregateStore(category){
    const metaAggregate = { 'discriminator': 'CATEGORY'};

    var params = {
        TableName : aggregateTable,
        Item: {... metaAggregate, ... category }
    };

    return await docClient.put(params).promise();
}

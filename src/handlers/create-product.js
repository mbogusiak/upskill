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
exports.createProductHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    const product = JSON.parse(event.body)
    const categoryExist = await	getCategory(product.categoryUUID);

   if(categoryExist.Items.length == 0){
       return {
        statusCode: 400,
        body: JSON.stringify('Category doesnt exist')
       };

   }
   await addProductToAggregateStore(product);
   await addProductToEventStore(product);

    return {
        statusCode: 200,
        body: JSON.stringify(product)
     };
}


 async function getCategory(categoryID){
    console.log("Validate category " + categoryID );

  var params = {
    TableName : aggregateTable,
    KeyConditionExpression: "#i = :cat",
    ExpressionAttributeNames:{
        "#i": "id"
    },
    ExpressionAttributeValues: {
        ":cat": categoryID
    }
};

 return  await docClient.query(params).promise();
}

 async function addProductToAggregateStore(product){
    const metaAggregate = { 'discriminator': 'PRODUCT'};

    var params = {
        TableName : aggregateTable,
        Item: {... metaAggregate, ... product }
    };

    return await docClient.put(params).promise();
}


 async function addProductToEventStore(product){
     console.log(product);
    const metaAggregate = {'id':product.id, 'eventType': 'ADD_PRODUCT', 'eventTime': Date.now()};

    var params = {
        TableName : eventStoreTable,
        Item: {... metaAggregate, 'body':product }
    };

    return await docClient.put(params).promise();
}
  function isProductValid(product){
     const metaAggregate = { 'discriminator': 'PRODUCT'};

    var params = {
        TableName : aggregateTable,
        Item: {... metaAggregate, ... product }
    };

}
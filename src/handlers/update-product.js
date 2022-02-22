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
exports.updateProductHandler = async (event) => {
    if (event.httpMethod !== 'PATCH') {
        throw new Error(`update product only accepts PATCH method, you tried: ${event.httpMethod} method.`);
    }
    const product = JSON.parse(event.body);
    let productToUpdate = await getProduct(product.id);
    productToUpdate = productToUpdate.Items[0];
    if(parseInt(product.version) <= parseInt(productToUpdate.version)){
       return {
        statusCode: 400,
      body: JSON.stringify('Product cannot be updated')
       };

   }
   const updatedProduct = await updateProductInAggregateStore(product);
   await saveUpdateInEventStore(updatedProduct);

    return {
        statusCode: 200,
        body: JSON.stringify(updatedProduct)
     };
}


 async function getProduct(productUUID){

  var params = {
    TableName : aggregateTable,
    KeyConditionExpression: "#i = :product",
    ExpressionAttributeNames:{
        "#i": "id"
    },
    ExpressionAttributeValues: {
        ":product": productUUID
    }
};

 return  await docClient.query(params).promise();
}

 async function updateProductInAggregateStore(product){

     var params = {
    TableName:aggregateTable,
    Key:{
        "id": product.id
        },
    UpdateExpression: "set active = :a, version = :v",
    ExpressionAttributeValues:{
        ":a":product.active,
        ":v":product.version
    },
    ReturnValues:"ALL_NEW"
};
    return await docClient.update(params).promise();
}


 async function saveUpdateInEventStore(product){
     let id ='' + Math.floor(Math.random() * (10000000 - 1)) + 1;
    const metaAggregate = {'id':id, 'eventType': 'UPDATE_PRODUCT', 'eventTime': Date.now()};
    var params = {
        TableName : eventStoreTable,
        Item: {... metaAggregate, 'body':product }
    };
    console.log(params);
    return await docClient.put(params).promise();
}

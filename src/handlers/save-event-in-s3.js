// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.saveEventInS3Handler = async (event) => {

    // All log statements are written to CloudWatch
    console.info('save event in s3:', event);


    const response = {
        statusCode: 200,
    };

    return response;
}

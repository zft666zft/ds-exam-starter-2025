import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    const movieId = Number(event.pathParameters?.movieId);
    const role = event.queryStringParameters?.role;

    if (!movieId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Missing movieId" }),
      };
    }

    if (role) {
      const command = new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          movieId,
          role,
        },
      });

      const result = await client.send(command);

      if (!result.Item) {
        return {
          statusCode: 404,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: "Crew member not found" }),
        };
      }

      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(result.Item),
      };
    } else {
      const query = new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "movieId = :id",
        ExpressionAttributeValues: {
          ":id": movieId,
        },
      });

      const result = await client.send(query);

      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(result.Items || []),
      };
    }
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = { wrapNumbers: false };
  return DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions,
    unmarshallOptions,
  });
}

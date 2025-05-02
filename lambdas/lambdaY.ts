import { Handler, SQSRecord } from "aws-lambda";

export const handler: Handler = async (event) => {
  try {
    console.log("Lambda Y triggered with SQS event");

    for (const record of event.Records as SQSRecord[]) {
      const body = JSON.parse(record.body);
      const message = JSON.parse(body.Message); 
      console.log("Received message from SNS via SQS:", message);
    }
  } catch (error: any) {
    console.error("LambdaY error:", error);
    throw error;
  }
};

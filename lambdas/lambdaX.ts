import { Handler } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: process.env.REGION });

export const handler: Handler = async (event) => {
  try {
    console.log("S3 Event:", JSON.stringify(event));

    const record = event.Records?.[0];
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    const message = {
      bucket,
      key,
      timestamp: new Date().toISOString(),
    };

    await sns.send(
      new PublishCommand({
        TopicArn: process.env.TOPIC_ARN,
        Message: JSON.stringify(message),
      })
    );

    console.log("SNS message published:", message);
  } catch (error: any) {
    console.error("LambdaX error:", error);
    throw error;
  }
};

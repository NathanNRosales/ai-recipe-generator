

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    // event.arguments is how AppSync passes GraphQL args into Lambda
    const { ingredient } = event.arguments;

    const input = {
      prompt: `Generate a recipe using ${ingredient}.`,
      maxTokens: 200,
    };

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2", // or another Bedrock model you enabled
      body: JSON.stringify(input),
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));

    return {
      recipe: result.completion, // or however the model responds
    };
  } catch (err) {
    console.error("Error:", err);
    throw new Error("Failed to generate recipe");
  }
};

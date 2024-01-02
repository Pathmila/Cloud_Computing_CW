import * as AWS from "aws-sdk";
export const getParameterValues = async (
  parameterName: string,
): Promise<string> => {
  const ssm = new AWS.SSM();

  const params = {
    Name: parameterName,
  };

  try {
    const response = await ssm.getParameter(params).promise();
    if (response && response.Parameter && response.Parameter.Value) {
      console.log("response.Parameter.Value", response.Parameter.Value);
      return response.Parameter.Value;
    } else {
      throw new Error(
        `Parameter ${parameterName} not found or does not have a value.`,
      );
    }
  } catch (error) {
    console.error(`Error getting parameter ${parameterName}:`, error);
    throw error;
  }
};

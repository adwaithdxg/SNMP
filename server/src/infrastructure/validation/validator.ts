import { BadRequestError } from "@infrastructure/errors";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import addKeywords from "ajv-keywords";

const ajv = new Ajv({ allErrors: true });
ajv.addFormat('objectId', /^[a-fA-F0-9]{24}$/);
addKeywords(ajv, ["uniqueItemProperties"]);
addFormats(ajv); 

export async function validateWithSchema<T>(schema: object, data: T): Promise<T> {
  const validate = ajv.compile<T>(schema);
  const valid = validate(data);
  if (!valid) {
    const errorMessages = (validate.errors || [])
      .map(error => `${error.instancePath} ${error.message}`)
      .join(', ');
    throw new BadRequestError(`Validation error: ${errorMessages}`);
  }
  return data;
}
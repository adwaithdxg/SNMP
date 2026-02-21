import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";
import { validateEnv } from "./validate";
import { parseEnvArray } from "./arrayParser";


// Load base .env
dotenv.config();

// Load environment-specific .env
const ENV = process.env.NODE_ENV || "development";
const envFile = path.resolve(__dirname, `../../../../.env.${ENV}`);
if (existsSync(envFile)) dotenv.config({ path: envFile });

// Construct final config
const config = {
  NODE_ENV:ENV,
  PORT: Number(process.env.PORT)
};

// Validate
validateEnv(config);

export default config;
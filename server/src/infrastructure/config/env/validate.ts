export function validateEnv(config: Record<string, any>): void {
    const required = [
      "PORT"
    ];
  
    for (const key of required) {
      if (!config[key]) throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  
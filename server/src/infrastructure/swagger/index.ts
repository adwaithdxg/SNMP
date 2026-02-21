import swaggerJsDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'D2D CRM Service API',
      version: '1.0.0',
      description: 'API documentation for D2D CRM Service',
    },
    servers: [
        {
          url: "/api/", 
        },
      ],
  },
  apis: [
    'src/presentation/routes/**/*.ts',
    'src/presentation/controllers/**/*.ts'
  ],
};

export const swaggerSpec = swaggerJsDoc(options);
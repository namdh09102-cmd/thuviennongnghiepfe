import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerDoc = {
    openapi: '3.0.0',
    info: {
      title: 'AgriLib API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API definitions for the AgriLib content platform',
    },
    paths: {
      '/api/posts': {
        get: {
          summary: 'List recent posts',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'sort', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } }
          ],
          responses: { '200': { description: 'Feed retrieved successfully' } }
        }
      },
      '/api/categories': {
        get: {
          summary: 'Retrieve available topics',
          responses: { '200': { description: 'Topics retrieved' } }
        }
      }
    }
  };

  return NextResponse.json(swaggerDoc);
}

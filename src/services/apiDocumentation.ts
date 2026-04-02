/**
 * OpenAPI 3.0 Documentation for Ajo Savings API
 * 
 * View at: https://editor.swagger.io/
 */

export const ajoApiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'PeraVest Ajo Savings API',
    version: '1.0.0',
    description: 'Industry-standard Ajo (ROSCA) savings platform with atomic transactions and default prevention',
    contact: {
      name: 'PeraVest Support',
      email: 'support@peravest.com'
    }
  },
  servers: [
    {
      url: 'https://api.peravest.com/v1',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    }
  ],
  paths: {
    '/ajo/groups': {
      post: {
        summary: 'Create new Ajo group',
        tags: ['Group Ajo'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'max_members', 'contribution_amount', 'frequency', 'cycle_duration'],
                properties: {
                  name: { type: 'string', example: 'Monthly Savers' },
                  description: { type: 'string', example: 'Save together monthly' },
                  max_members: { type: 'integer', minimum: 2, maximum: 50, example: 5 },
                  contribution_amount: { type: 'number', minimum: 1000, example: 10000 },
                  frequency: { type: 'string', enum: ['weekly', 'monthly'], example: 'monthly' },
                  cycle_duration: { type: 'integer', minimum: 1, example: 30 }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Group created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/AjoGroup' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '429': { description: 'Rate limit exceeded' }
        }
      }
    },
    '/ajo/groups/{groupId}/join': {
      post: {
        summary: 'Join existing Ajo group',
        tags: ['Group Ajo'],
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': { description: 'Joined successfully' },
          '400': { description: 'Group full or invalid' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/ajo/contributions': {
      post: {
        summary: 'Make contribution to cycle',
        tags: ['Contributions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['group_id', 'cycle_id', 'amount', 'payment_reference'],
                properties: {
                  group_id: { type: 'integer' },
                  cycle_id: { type: 'integer' },
                  amount: { type: 'number' },
                  payment_reference: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Contribution processed' },
          '400': { description: 'Invalid contribution' },
          '429': { description: 'Rate limit exceeded' }
        }
      }
    },
    '/ajo/withdrawals/check': {
      get: {
        summary: 'Check withdrawal eligibility',
        tags: ['Withdrawals'],
        parameters: [
          {
            name: 'groupId',
            in: 'query',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Eligibility status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    state: { type: 'string', enum: ['locked', 'eligible', 'pending', 'completed'] },
                    reason: { type: 'string' },
                    next_date: { type: 'string', format: 'date-time' },
                    amount: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/ajo/withdrawals': {
      post: {
        summary: 'Process withdrawal',
        tags: ['Withdrawals'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['group_id'],
                properties: {
                  group_id: { type: 'integer' },
                  ajo_id: { type: 'integer' },
                  amount: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Withdrawal successful' },
          '400': { description: 'Not eligible' },
          '429': { description: 'Rate limit exceeded' }
        }
      }
    },
    '/ajo/personal': {
      post: {
        summary: 'Create personal Ajo savings',
        tags: ['Personal Ajo'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['contribution_amount', 'frequency', 'duration', 'start_date'],
                properties: {
                  ajo_type: { type: 'string', enum: ['personal'] },
                  contribution_amount: { type: 'number', minimum: 1000 },
                  frequency: { type: 'string', enum: ['weekly', 'monthly'] },
                  duration: { type: 'integer', minimum: 1 },
                  start_date: { type: 'string', format: 'date' },
                  payment_reference: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Personal Ajo created' },
          '400': { description: 'Invalid parameters' }
        }
      }
    }
  },
  components: {
    schemas: {
      AjoGroup: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          max_members: { type: 'integer' },
          current_members: { type: 'integer' },
          contribution_amount: { type: 'number' },
          frequency: { type: 'string' },
          status: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

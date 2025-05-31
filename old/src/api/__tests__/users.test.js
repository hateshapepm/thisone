const request = require('supertest');
const app = require('../../server/app'); // Adjust path to your Express app

describe('GET /api/users', () => {
  it('should return 200 and a list of users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Add more assertions based on your API response structure
  });
}); 
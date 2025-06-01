const { getUserById } = require('../dbUtils'); // Adjust path to your DB utility

describe('getUserById', () => {
  it('returns user data for a valid ID', async () => {
    // Mock DB call or use a test DB
    const user = await getUserById(1);
    expect(user).toHaveProperty('id', 1);
    // Add more assertions based on your user object
  });

  it('returns null for an invalid ID', async () => {
    const user = await getUserById(-1);
    expect(user).toBeNull();
  });
}); 
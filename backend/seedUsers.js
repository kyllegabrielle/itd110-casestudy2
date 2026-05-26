const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername } = require('./utils/userQueries');
const { driver, checkConnection } = require('./config/db');

const seedUsers = async () => {
  try {
    // Check DB Connection
    await checkConnection();

    const users = [
      {
        username: 'admin',
        password: 'adminpassword123',
        role: 'Admin',
        name: 'System Admin',
        email: 'admin@cims.com'
      },
      {
        username: 'officer',
        password: 'officerpassword123',
        role: 'Officer',
        name: 'Officer Ramos',
        email: 'ramos@cims.com'
      },
      {
        username: 'viewer',
        password: 'viewerpassword123',
        role: 'Viewer',
        name: 'Strategic Analyst',
        email: 'analyst@cims.com'
      }
    ];

    console.log('--- Starting User Seeding ---');

    for (const u of users) {
      const existingUser = await findUserByUsername(u.username);
      if (existingUser) {
        console.log(`User "${u.username}" already exists. Skipping.`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(u.password, salt);

      await createUser({
        username: u.username,
        passwordHash,
        role: u.role,
        name: u.name,
        email: u.email
      });

      console.log(`User "${u.username}" created successfully with role "${u.role}".`);
    }

    console.log('--- Seeding Complete ---');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    await driver.close();
    process.exit(0);
  }
};

seedUsers();

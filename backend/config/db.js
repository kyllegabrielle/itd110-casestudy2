const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

const session = (database) => driver.session({ database: database || 'neo4j' });

const checkConnection = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('Successfully connected to Neo4j');
  } catch (error) {
    console.error('Neo4j connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  driver,
  session,
  checkConnection
};

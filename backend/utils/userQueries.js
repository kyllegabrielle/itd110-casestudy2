const { session } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createUser = async (userData) => {
  const s = session();
  try {
    const { username, passwordHash, role, name, email } = userData;
    const result = await s.run(
      `CREATE (u:User {
        id: $id,
        username: $username,
        passwordHash: $passwordHash,
        role: $role,
        name: $name,
        email: $email,
        createdAt: datetime()
      }) RETURN u`,
      {
        id: uuidv4(),
        username,
        passwordHash,
        role,
        name,
        email: email || null
      }
    );
    return result.records[0].get('u').properties;
  } finally {
    await s.close();
  }
};

const findUserByUsername = async (username) => {
  const s = session();
  try {
    const result = await s.run(
      'MATCH (u:User {username: $username}) RETURN u',
      { username }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('u').properties;
  } finally {
    await s.close();
  }
};

const findUserById = async (id) => {
  const s = session();
  try {
    const result = await s.run(
      'MATCH (u:User {id: $id}) RETURN u',
      { id }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('u').properties;
  } finally {
    await s.close();
  }
};

const getAllUsers = async () => {
  const s = session();
  try {
    const result = await s.run(
      'MATCH (u:User) RETURN u ORDER BY u.role, u.username'
    );
    return result.records.map(record => {
      const props = record.get('u').properties;
      delete props.passwordHash; // Never return password hash
      return props;
    });
  } finally {
    await s.close();
  }
};

const updateUser = async (id, userData) => {
  const s = session();
  try {
    const { username, name, email, role, passwordHash } = userData;
    
    let query = 'MATCH (u:User {id: $id}) SET u.username = $username, u.name = $name, u.email = $email, u.role = $role';
    const params = { id, username, name, email, role };

    if (passwordHash) {
      query += ', u.passwordHash = $passwordHash';
      params.passwordHash = passwordHash;
    }

    query += ' RETURN u';

    const result = await s.run(query, params);
    if (result.records.length === 0) return null;
    return result.records[0].get('u').properties;
  } finally {
    await s.close();
  }
};

const deleteUser = async (id) => {
  const s = session();
  try {
    const result = await s.run(
      'MATCH (u:User {id: $id}) DETACH DELETE u RETURN count(u) as deletedCount',
      { id }
    );
    return result.records[0].get('deletedCount').toInt() > 0;
  } finally {
    await s.close();
  }
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser
};

const { Client } = require('pg')

const client = new Client('postgres://localhost:5432/juicebox-dev');

const createUser = async ({
 username, 
  password,
  name,
  location
}) => {
  try {
    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, password, name, location]);

    return user;
  } catch (error) {
    throw error;
  }
}

const updateUser = async (id, fields = {}) => {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [user] } = await client.query(`
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `, Object.values(fields));

        return user;
    } catch (error) {
        throw error;
    }
}

const getAllUsers = async () => {
    const { rows } = await client.query(`
  SELECT id, username, name, location
  FROM users;
  ;`);

    return rows;
}

const posts = async ({
    authorId,
    title,
    content
}) => {
    try {
        const { rows: [post] } = await client.query(`
        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true,
        );
        `);
    } catch (error) {
        console.error('Error building post tables!')
        throw error;
    }

}




module.exports = {
    client,
    createUser,
    getAllUsers,
    updateUser,
    posts
}
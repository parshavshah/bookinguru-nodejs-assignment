module.exports = {
  development: {
    database: process.env.DB_NAME || 'database.sqlite',
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  },
  test: {
    database: process.env.DB_NAME || 'test.sqlite',
    dialect: 'sqlite',
    storage: './test.sqlite',
    logging: false
  },
  production: {
    database: process.env.DB_NAME || 'production.sqlite',
    dialect: 'sqlite',
    storage: './production.sqlite',
    logging: false
  }
};

require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');
require('dotenv').config({ path: envPath });
require('dotenv').config({ path: envLocalPath });

if (!process.env.DATABASE) {
  console.error('🔥 DATABASE URL not found in .env (backend/.env required).');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
});

const rootDir = path.resolve(__dirname);
const modelsFiles = globSync(path.join(rootDir, 'models/**/*.js').replace(/\\/g, '/'));

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
const authController = require("./controllers/authController");

mongoose.connection.once("open", async () => {
  await authController.ensureDefaultAdmin();
  await authController.ensureDefaultWorker();
});

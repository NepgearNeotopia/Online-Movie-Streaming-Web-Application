const readline = require('readline');
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const questionPassword = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      // Clear the visible input line
      process.stdout.write('\x1B[2K\x1B[1G');
      resolve(answer);
    });
  });
};

const hideInput = () => {
  const stdin = process.stdin;
  const rawMode = stdin.isTTY;
  if (rawMode) {
    stdin.setRawMode(true);
  }
  return () => {
    if (rawMode) {
      stdin.setRawMode(false);
    }
  };
};

const createAdmin = async () => {
  console.log('=== Admin Account Creation ===\n');

  let email, password, name;

  while (true) {
    email = await question('Admin Email: ');
    email = email.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      break;
    }
    console.log('Please enter a valid email address.\n');
  }

  while (true) {
    name = await question('Admin Name: ');
    name = name.trim();
    if (name && name.length >= 2) {
      break;
    }
    console.log('Name must be at least 2 characters.\n');
  }

  while (true) {
    const restore = hideInput();
    password = await questionPassword('Admin Password (min 6 chars): ');
    restore();
    console.log('');
    if (password && password.length >= 6) {
      break;
    }
    console.log('Password must be at least 6 characters.\n');
  }

  console.log('\nChecking for existing account...');
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    console.log('An account with this email already exists. Aborting.');
    rl.close();
    await pool.end();
    process.exit(1);
  }

  console.log('No existing account found. Hashing password...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log('Creating admin account...');
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, 'admin']
  );

  console.log(`\nAdmin account created successfully!`);
  console.log(`  Admin ID: ${result.insertId}`);
  console.log(`  Email: ${email}`);
  console.log(`  Role: admin`);

  rl.close();
  await pool.end();
  process.exit(0);
};

createAdmin().catch((error) => {
  console.error('\nError creating admin account:', error.message);
  rl.close();
  pool.end().then(() => process.exit(1));
});
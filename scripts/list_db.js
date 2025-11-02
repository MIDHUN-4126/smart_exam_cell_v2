const pool = require('../smart-exam-backend/db');

async function list() {
  try {
    const [dbs] = await pool.query("SELECT DATABASE() as db");
    console.log('Connected DB:', dbs[0].db);
    const [tables] = await pool.query("SHOW TABLES");
    console.log('Tables:');
    if (tables.length === 0) return;
    for (const t of tables) {
      console.log(Object.values(t)[0]);
    }

    // Print a few rows from common tables if they exist
    const common = ['course','student','faculty','timetable','attendance','score'];
    for (const name of common) {
      try {
        const [rows] = await pool.query(`SELECT * FROM \`${name}\` LIMIT 5`);
        console.log('\nSample rows from', name, rows.length ? rows : '(empty)');
      } catch (e) {
        // ignore if table missing
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error listing DB:', err.message);
    process.exit(1);
  }
}

list();

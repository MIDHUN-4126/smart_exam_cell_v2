// server.js - Main backend application file

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing
const pool = require('./db'); // Import the database connection pool

const app = express();
// Allow URL-encoded form bodies (for form submissions).
// Place this immediately after `const app = express()` and before routes.
app.use(express.urlencoded({ extended: true }));

// Default port - allow override from environment (e.g. process.env.PORT)
const desiredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend communication
app.use(express.json()); // Allow parsing of JSON request bodies

// --- API Routes ---

// Timetable: ensure table exists helper
async function ensureTimetableTable(conn) {
    // Check if timetable table exists; if not, create a minimal version
    const [rows] = await conn.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'timetable'`
    );
    if (rows.length > 0) return true;
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS timetable (
                id INT AUTO_INCREMENT PRIMARY KEY,
                faculty_id INT NOT NULL,
                course_id INT NOT NULL,
                day_of_week TINYINT NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                room VARCHAR(64) NULL,
                section VARCHAR(64) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_faculty_day (faculty_id, day_of_week, start_time)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        // Try to add FKs if referenced tables exist; ignore if they fail
        try { await conn.query(`ALTER TABLE timetable ADD CONSTRAINT fk_tt_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE`); } catch (_e) {}
        try { await conn.query(`ALTER TABLE timetable ADD CONSTRAINT fk_tt_course FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE`); } catch (_e) {}
        return true;
    } catch (e) {
        console.warn('Could not create timetable table automatically:', e.message);
        return false;
    }
}

// 1. Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required.' });
  }

  try {
    // --- IMPORTANT SECURITY NOTE ---
    // This is a placeholder for actual authentication.
    // In a real application:
    // 1. You MUST hash passwords using bcrypt before storing them in the database.
    // 2. You MUST compare the provided password with the stored hash using bcrypt.compare().
    // 3. You should ideally join with role tables or check linked_person_id type.

    // Find the user by username (assuming email is used as username)
    const [rows] = await pool.query('SELECT user_id, username, password_hash, person_type, linked_person_id FROM useraccount WHERE username = ? AND is_active = 1', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const userAccount = rows[0];

    // --- Placeholder Password Check (MUST BE REPLACED WITH bcrypt.compare) ---
    // const passwordMatch = await bcrypt.compare(password, userAccount.password_hash);
    const passwordMatch = (password === 'password'); // !! INSECURE - Replace with bcrypt !!
    // You'll need actual password hashes in your DB for bcrypt to work.
    // For now, let's assume a generic password 'password' works IF the user exists.

    if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    // Check if the role provided matches the user's role (person_type)
    // Basic check - might need refinement based on your exact role setup
    if (userAccount.person_type !== role) {
       console.warn(`Role mismatch: Expected ${userAccount.person_type}, Got ${role} for user ${email}`);
       return res.status(401).json({ message: 'Role mismatch.' });
    }

    // Fetch user details based on role (person_type) and linked_person_id
    let userDetails = {};
    let query = '';
    let params = [userAccount.linked_person_id];

        switch (userAccount.person_type) {
      case 'student':
                query = 'SELECT student_id as id, first_name, last_name, email FROM student WHERE student_id = ?';
        break;
      case 'faculty':
                query = 'SELECT faculty_id as id, first_name, last_name, email FROM faculty WHERE faculty_id = ?';
        break;
      case 'admin':
        // Assuming admins don't have a separate table or linked ID needs different handling
        // For now, just create a basic admin object
         userDetails = {
           id: userAccount.user_id, // Use user_id as admin id for now
           username: 'Admin User', // Or fetch from a dedicated admin table if it exists
           email: userAccount.username,
         };
         query = ''; // Skip database query for admin in this basic example
         break;
      default:
        console.error('Unknown person_type:', userAccount.person_type);
        return res.status(500).json({ message: 'Invalid user type configuration.' });
    }
    
        if (query) {
            let details = null;
            let [detailRows] = await pool.query(query, params);
            if (detailRows.length > 0) {
                details = detailRows[0];
            } else {
                // Fallbacks to handle mismatched key types like 'F001' vs INT faculty_id
                if (userAccount.person_type === 'faculty') {
                    // 1) If linked_person_id includes digits, try numeric faculty_id match
                    const digits = String(userAccount.linked_person_id || '').replace(/\D+/g, '');
                    if (digits) {
                        try {
                            const n = Number(digits);
                            if (Number.isFinite(n)) {
                                // try numeric faculty_id
                                const [rows2] = await pool.query('SELECT faculty_id as id, first_name, last_name, email FROM faculty WHERE faculty_id = ? LIMIT 1', [n]);
                                if (rows2.length > 0) details = rows2[0];
                            }
                        } catch (_) {}
                    }
                    // 2) Try matching by email == username as a last resort
                    if (!details) {
                        try {
                            const [rows3] = await pool.query('SELECT faculty_id as id, first_name, last_name, email FROM faculty WHERE email = ? LIMIT 1', [userAccount.username]);
                            if (rows3.length > 0) details = rows3[0];
                        } catch (_) {}
                    }
                } else if (userAccount.person_type === 'student') {
                    // Student fallback: try email match
                    try {
                        const [rowsS] = await pool.query('SELECT student_id as id, first_name, last_name, email FROM student WHERE email = ? LIMIT 1', [userAccount.username]);
                        if (rowsS.length > 0) details = rowsS[0];
                    } catch (_) {}
                }

                if (!details) {
                    console.error(`Could not find linked details for ${userAccount.person_type} ID: ${userAccount.linked_person_id}`);
                    // Fallback if linked record not found
                    userDetails = {
                        id: userAccount.linked_person_id || userAccount.user_id,
                        username: userAccount.username, // Fallback to username
                        email: userAccount.username,
                    };
                }
            }

            if (details) {
                userDetails = {
                    id: details.id,
                    username: `${details.first_name} ${details.last_name}`,
                    email: details.email,
                };
            }
        }


    // Login successful - return user data (excluding password hash)
    res.json({
      ...userDetails, // Spread fetched details (id, username, email)
      role: userAccount.person_type,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

// 2. Add Faculty Endpoint (Admin only - ideally add auth middleware)
app.post('/api/faculty', async (req, res) => {
    // TODO: Add authentication middleware to ensure only admins can access
    const { id, name, email, department, designation, courses } = req.body; // Assuming courses is an array of course IDs

    if (!name || !email || !department || !designation) {
        return res.status(400).json({ message: 'Missing required faculty details.' });
    }

    try {
        // Basic name splitting (adjust if needed)
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName; // Handle single names

        // Find department ID
        const [deptRows] = await pool.query('SELECT dept_id FROM department WHERE name = ?', [department]);
        if (deptRows.length === 0) {
            return res.status(400).json({ message: 'Invalid department name.' });
        }
        const deptId = deptRows[0].dept_id;

        // Insert into faculty table
        // Note: The `faculty` table expects `dept_id` (INT), not department name.
        const [result] = await pool.query(
            'INSERT INTO faculty (first_name, last_name, email, designation, dept_id) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, designation, deptId]
        );

        const newFacultyId = result.insertId;

        // TODO: Handle course assignments - This might require a separate junction table (e.g., faculty_courses)
        // If your schema involves linking faculty to courses, you'd add INSERT statements here.
        // For now, we just log the intended courses.
        console.log(`Faculty ${newFacultyId} added. Intended courses: ${courses.join(', ')}`);

        // Respond with the newly created faculty data (fetch it back for confirmation)
         const [newFacultyRows] = await pool.query('SELECT faculty_id as id, first_name, last_name, email, designation, ? as department FROM faculty WHERE faculty_id = ?', [department, newFacultyId]);


        res.status(201).json({ ...newFacultyRows[0], courses: courses }); // Include courses in response for frontend state

    } catch (error) {
        console.error("Error adding faculty:", error);
        // Check for duplicate email error (ER_DUP_ENTRY often has code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'Faculty email already exists.' });
        }
        res.status(500).json({ message: "Failed to add faculty." });
    }
});


// 3. Add Course Endpoint (Admin only - ideally add auth middleware)
app.post('/api/courses', async (req, res) => {
    // TODO: Add authentication middleware
    const { id, title, credits, deptId } = req.body;

     if (!title || !credits || !deptId) {
        return res.status(400).json({ message: 'Title, credits, and department ID are required.' });
    }
    
    // Use provided course ID (like CS101) or null if empty to let auto-increment handle it
    const courseIdToInsert = id ? id : null; 
    // WARNING: Directly inserting a user-provided ID like 'CS101' might fail if `course_id` is purely numeric AUTO_INCREMENT.
    // Your schema image shows `course_id` as INT. If you need alphanumeric IDs like 'CS101', 
    // the `course_id` column type should be VARCHAR and NOT auto-incrementing.
    // This code assumes `course_id` is INT AUTO_INCREMENT and ignores the user's `id` field for insertion. Adapt if needed.

    try {
        const [result] = await pool.query(
            'INSERT INTO course (title, credits, dept_id) VALUES (?, ?, ?)',
            [title, credits, deptId]
        );
        const newCourseId = result.insertId;

        // Fetch the newly added course to send back
        const [newCourseRows] = await pool.query('SELECT c.course_id as id, c.title, c.credits, c.dept_id, d.name as department_name FROM course c JOIN department d ON c.dept_id = d.dept_id WHERE c.course_id = ?', [newCourseId]);


        res.status(201).json({ ...newCourseRows[0], faculty: 'Unassigned', grade: null }); // Match frontend structure

    } catch (error) {
        console.error("Error adding course:", error);
         // Add specific error handling if needed (e.g., foreign key constraint for deptId)
        res.status(500).json({ message: "Failed to add course." });
    }
});

// --- Basic GET Endpoints (for testing/initial data) ---
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.student_id as id,
                s.student_id as student_id,
                CONCAT(s.first_name, ' ', s.last_name) as name, 
                s.email, 
                d.name as department, 
                p.name as program, 
                s.status 
            FROM student s
            LEFT JOIN program p ON s.program_id = p.program_id
            LEFT JOIN department d ON p.dept_id = d.dept_id 
            ORDER BY s.student_id ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Failed to fetch students." });
    }
});

app.get('/api/faculty', async (req, res) => {
     try {
        // Fetch faculty and join with department
        const [rows] = await pool.query(`
            SELECT 
                f.faculty_id as id, 
                CONCAT(f.first_name, ' ', f.last_name) as name, 
                f.email, 
                d.name as department, 
                f.designation
            FROM faculty f
            LEFT JOIN department d ON f.dept_id = d.dept_id
            ORDER BY f.faculty_id ASC
        `);
        // Add dummy courses for now, replace with actual query later
        const facultyWithCourses = rows.map(f => ({ ...f, courses: [] })); // Empty array for now
        res.json(facultyWithCourses);
    } catch (error) {
        console.error("Error fetching faculty:", error);
        res.status(500).json({ message: "Failed to fetch faculty." });
    }
});

// Delete Faculty endpoint (Admin) with FK safety
// DELETE /api/faculty/:id
app.delete('/api/faculty/:id', async (req, res) => {
    const raw = req.params.id;
    if (!raw) return res.status(400).json({ message: 'Faculty id is required.' });
    const id = Number(raw);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Faculty id must be a number.' });
    try {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const doCascade = String(req.query.cascade || '').toLowerCase() === 'true';

            if (doCascade) {
                // Cascade mode: remove dependent rows first, then delete faculty
                const [fkRows] = await conn.query(
                    `SELECT TABLE_NAME, COLUMN_NAME
                     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                     WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                       AND REFERENCED_TABLE_NAME = 'faculty'
                       AND REFERENCED_COLUMN_NAME = 'faculty_id'`
                );

                for (const row of fkRows) {
                    const tbl = row.TABLE_NAME;
                    const col = row.COLUMN_NAME;
                    try {
                        await conn.query(`DELETE FROM \`${tbl}\` WHERE \`${col}\` = ?`, [id]);
                    } catch (e) {
                        if (!(e && (e.code === 'ER_NO_SUCH_TABLE' || e.code === 'ER_BAD_FIELD_ERROR'))) {
                            throw e;
                        }
                    }
                }

                const [result] = await conn.query('DELETE FROM faculty WHERE faculty_id = ? LIMIT 1', [id]);
                await conn.commit();
                if ((result.affectedRows || 0) > 0) return res.sendStatus(204);
                return res.status(404).json({ message: 'Faculty not found' });
            } else {
                // Non-cascade: try a simple delete; if FK blocks, report conflict
                try {
                    const [result] = await conn.query('DELETE FROM faculty WHERE faculty_id = ? LIMIT 1', [id]);
                    await conn.commit();
                    if ((result.affectedRows || 0) > 0) return res.sendStatus(204);
                    return res.status(404).json({ message: 'Faculty not found' });
                } catch (simpleErr) {
                    try { await conn.rollback(); } catch {}
                    if (simpleErr && (simpleErr.errno === 1451 || simpleErr.code === 'ER_ROW_IS_REFERENCED_2')) {
                        return res.status(409).json({ message: 'Cannot delete faculty due to related records (scores/sections). Append ?cascade=true to delete related records too.' });
                    }
                    throw simpleErr;
                }
            }
        } catch (txErr) {
            try { await conn.rollback(); } catch {}
            // Translate FK constraint to a friendly message
            if (txErr && (txErr.errno === 1451 || txErr.code === 'ER_ROW_IS_REFERENCED_2')) {
                return res.status(409).json({ message: 'Cannot delete faculty due to related records (scores/sections). Append ?cascade=true to delete related records too.' });
            }
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Error deleting faculty:', error);
        return res.status(500).json({ message: 'Failed to delete faculty.' });
    }
});

app.get('/api/courses', async (req, res) => {
    const { student_id } = req.query;
    
    try {
        let sql = `
            SELECT 
                c.course_id as id, 
                c.title, 
                c.credits, 
                c.dept_id 
            FROM course c
        `;
        
        const params = [];
        
        // If student_id is provided, filter courses by student's department
        if (student_id) {
            sql = `
                SELECT 
                    c.course_id as id, 
                    c.title, 
                    c.credits, 
                    c.dept_id,
                    d.name as dept_name
                FROM course c
                LEFT JOIN department d ON c.dept_id = d.dept_id
                WHERE c.dept_id = (
                    SELECT p.dept_id 
                    FROM student s
                    JOIN program p ON s.program_id = p.program_id
                    WHERE s.student_id = ?
                )
            `;
            params.push(student_id);
        }
        
        sql += ' ORDER BY c.course_id ASC';
        
        const [rows] = await pool.query(sql, params);
        
        // Add dummy faculty/grade for now
        const coursesWithExtras = rows.map(c => ({ ...c, faculty: 'Unassigned', grade: null })); 
        res.json(coursesWithExtras);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch courses." });
    }
});

// GET /api/enrollments?student_id=
// Returns enrolled courses for a student by joining enrollment -> section -> course when necessary.
app.get('/api/enrollments', async (req, res) => {
    const { student_id } = req.query;
    if (!student_id) return res.status(400).json({ message: 'student_id is required' });
    let conn;
    try {
        conn = await pool.getConnection();
        // Detect enrollment table and its columns
        const [tbl] = await conn.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enrollment'`);
        if (tbl.length === 0) return res.json([]);
        const [enCols] = await conn.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enrollment'`);
        const enNames = new Set(enCols.map(r => r.COLUMN_NAME));

        // If enrollment has course_id directly, use it. Otherwise join section -> course.
        if (enNames.has('course_id')) {
            const sql = `SELECT e.*, c.course_id AS course_id, c.title AS course_title FROM enrollment e LEFT JOIN course c ON c.course_id = e.course_id WHERE e.student_id = ?`;
            const [rows] = await conn.query(sql, [student_id]);
            const normalized = rows.map(r => ({ enrollment_id: r.enrollment_id, student_id: r.student_id, course_id: r.course_id, course_title: r.course_title }));
            return res.json(normalized);
        }

        // Fallback: expect enrollment has section_id which maps to section.section_id -> course.course_id
        const [secCols] = await conn.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'section'`);
        const secNames = new Set(secCols.map(r => r.COLUMN_NAME));
        if (!enNames.has('section_id') || !secNames.has('section_id')) {
            // unknown enrollment shape
            return res.json([]);
        }

        const sql = `
            SELECT e.enrollment_id, e.student_id, s.section_id, s.course_id, c.title AS course_title
            FROM enrollment e
            LEFT JOIN section s ON s.section_id = e.section_id
            LEFT JOIN course c ON c.course_id = s.course_id
            WHERE e.student_id = ?`;
        const [rows] = await conn.query(sql, [student_id]);
        const normalized = rows.map(r => ({ enrollment_id: r.enrollment_id, student_id: r.student_id, course_id: r.course_id, course_title: r.course_title }));
        return res.json(normalized);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return res.json([]);
    } finally {
        if (conn) conn.release();
    }
});

// Delete Course endpoint (Admin) with FK safety and optional cascade
// DELETE /api/courses/:id[?cascade=true]
app.delete('/api/courses/:id', async (req, res) => {
    const raw = req.params.id;
    if (!raw) return res.status(400).json({ message: 'Course id is required.' });
    const id = Number(raw);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Course id must be a number.' });
    try {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const doCascade = String(req.query.cascade || '').toLowerCase() === 'true';

            if (doCascade) {
                // Remove dependent rows that reference course(course_id)
                const [fkRows] = await conn.query(
                    `SELECT TABLE_NAME, COLUMN_NAME
                     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                     WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                       AND REFERENCED_TABLE_NAME = 'course'
                       AND REFERENCED_COLUMN_NAME = 'course_id'`
                );
                for (const row of fkRows) {
                    const tbl = row.TABLE_NAME;
                    const col = row.COLUMN_NAME;
                    try {
                        await conn.query(`DELETE FROM \`${tbl}\` WHERE \`${col}\` = ?`, [id]);
                    } catch (e) {
                        if (!(e && (e.code === 'ER_NO_SUCH_TABLE' || e.code === 'ER_BAD_FIELD_ERROR'))) {
                            throw e;
                        }
                    }
                }

                const [result] = await conn.query('DELETE FROM course WHERE course_id = ? LIMIT 1', [id]);
                await conn.commit();
                if ((result.affectedRows || 0) > 0) return res.sendStatus(204);
                return res.status(404).json({ message: 'Course not found' });
            } else {
                // Try simple delete; if FK blocks, report conflict and advise cascade
                try {
                    const [result] = await conn.query('DELETE FROM course WHERE course_id = ? LIMIT 1', [id]);
                    await conn.commit();
                    if ((result.affectedRows || 0) > 0) return res.sendStatus(204);
                    return res.status(404).json({ message: 'Course not found' });
                } catch (simpleErr) {
                    try { await conn.rollback(); } catch {}
                    if (simpleErr && (simpleErr.errno === 1451 || simpleErr.code === 'ER_ROW_IS_REFERENCED_2')) {
                        return res.status(409).json({ message: 'Cannot delete course due to related records (scores/attendance/timetable/enrollments). Append ?cascade=true to delete related records too.' });
                    }
                    throw simpleErr;
                }
            }
        } catch (txErr) {
            try { await conn.rollback(); } catch {}
            if (txErr && (txErr.errno === 1451 || txErr.code === 'ER_ROW_IS_REFERENCED_2')) {
                return res.status(409).json({ message: 'Cannot delete course due to related records (scores/attendance/timetable/enrollments). Append ?cascade=true to delete related records too.' });
            }
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ message: 'Failed to delete course.' });
    }
});

// 3b. Timetable Endpoints
// GET /api/timetable?faculty_id=&course_id=&day=
// day_of_week: 1=Mon ... 7=Sun
app.get('/api/timetable', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await ensureTimetableTable(conn);
        // If table still missing, return empty
        const [exists] = await conn.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'timetable'`);
        if (exists.length === 0) return res.json([]);

        const { faculty_id, course_id, day } = req.query;
        const where = [];
        const params = [];
        if (faculty_id) { where.push('t.faculty_id = ?'); params.push(faculty_id); }
        if (course_id) { where.push('t.course_id = ?'); params.push(course_id); }
        if (day) { where.push('t.day_of_week = ?'); params.push(Number(day)); }

        const sql = `
          SELECT t.*, c.title AS course_title
          FROM timetable t
          LEFT JOIN course c ON c.course_id = t.course_id
          ${where.length ? ('WHERE ' + where.join(' AND ')) : ''}
          ORDER BY t.day_of_week ASC, t.start_time ASC`;
        const [rows] = await conn.query(sql, params);
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        return res.json([]);
    } finally {
        if (conn) conn.release();
    }
});

// POST /api/timetable (create or bulk create)
// Body: { faculty_id, course_id, day_of_week, start_time, end_time, room?, section? } | { slots: [...] }
app.post('/api/timetable', async (req, res) => {
    const payload = req.body || {};
    const slots = Array.isArray(payload.slots) ? payload.slots : [payload];
    let conn;
    try {
        conn = await pool.getConnection();
        await ensureTimetableTable(conn);
        const [exists] = await conn.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'timetable'`);
        if (exists.length === 0) return res.status(500).json({ message: 'Timetable table missing and could not be created.' });

        const ok = [];
        for (const s of slots) {
            const { faculty_id, course_id, day_of_week, start_time, end_time, room, section } = s || {};
            if (!faculty_id || !course_id || !day_of_week || !start_time || !end_time) {
                continue; // skip invalid slot
            }
            await conn.query(
                `INSERT INTO timetable (faculty_id, course_id, day_of_week, start_time, end_time, room, section)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [faculty_id, course_id, Number(day_of_week), start_time, end_time, room || null, section || null]
            );
            ok.push(true);
        }
        return res.status(201).json({ message: 'Timetable saved', count: ok.length });
    } catch (error) {
        console.error('Error saving timetable:', error);
        if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'Invalid foreign key (faculty_id or course_id)', detail: error.sqlMessage });
        }
        return res.status(500).json({ message: 'Failed to save timetable.' });
    } finally {
        if (conn) conn.release();
    }
});

// DELETE /api/timetable/:id
app.delete('/api/timetable/:id', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await ensureTimetableTable(conn);
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
        const [result] = await conn.query('DELETE FROM timetable WHERE id = ? LIMIT 1', [id]);
        if ((result.affectedRows || 0) > 0) return res.sendStatus(204);
        return res.status(404).json({ message: 'Not found' });
    } catch (error) {
        console.error('Error deleting timetable slot:', error);
        return res.status(500).json({ message: 'Failed to delete timetable slot.' });
    } finally {
        if (conn) conn.release();
    }
});

// 4. Add Student Endpoint
app.post('/api/students', async (req, res) => {
    // Accept either numeric program_id or program/department names from the frontend.
    // Also accept `student_id` (some frontends provide a roll/student id). If not provided,
    // generate a stable-but-simple student id so INSERT won't fail when DB requires it.
    const { student_id, first_name, last_name, email, program_id, program, department, status } = req.body;

    if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: 'first_name, last_name and email are required.' });
    }

    // Helper to generate a simple unique-ish student id when frontend doesn't provide one.
    // Format: STU + <timestamp> + 3 random digits (e.g., STU1632445123456-123)
    function generateStudentId() {
        const ts = Date.now();
        const rand = Math.floor(Math.random() * 900) + 100; // 100-999
        return `STU${ts}${rand}`;
    }

    try {
        // Resolve program_id if frontend passed a program name or department
        let resolvedProgramId = program_id || null;

        if (!resolvedProgramId && program) {
            const [progRows] = await pool.query('SELECT program_id FROM program WHERE name = ? LIMIT 1', [program]);
            if (progRows.length > 0) resolvedProgramId = progRows[0].program_id;
        }

        if (!resolvedProgramId && department) {
            const [deptRows] = await pool.query('SELECT dept_id FROM department WHERE name = ? LIMIT 1', [department]);
            if (deptRows.length > 0) {
                const deptId = deptRows[0].dept_id;
                const [progRows] = await pool.query('SELECT program_id FROM program WHERE dept_id = ? LIMIT 1', [deptId]);
                if (progRows.length > 0) resolvedProgramId = progRows[0].program_id;
            }
        }

        // Ensure we have a student id to insert (DB requires it according to your error)
        const finalStudentId = student_id && String(student_id).trim() !== '' ? String(student_id).trim() : generateStudentId();

        // Insert includes student_id column (use resolvedProgramId or NULL)
        const [result] = await pool.query(
            'INSERT INTO student (student_id, first_name, last_name, email, program_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [finalStudentId, first_name, last_name, email, resolvedProgramId, status || 'active']
        );

        // Fetch and return the inserted student in the same shape as the GET /api/students endpoint
        const [rows] = await pool.query(`
            SELECT 
                s.student_id as id,
                s.student_id as student_id,
                CONCAT(s.first_name, ' ', s.last_name) as name, 
                s.email, 
                d.name as department, 
                p.name as program, 
                s.status 
            FROM student s
            LEFT JOIN program p ON s.program_id = p.program_id
            LEFT JOIN department d ON p.dept_id = d.dept_id 
            WHERE s.student_id = ?
        `, [finalStudentId]);

        res.status(201).json(rows[0] || { student_id: finalStudentId });
    } catch (error) {
        console.error('Error adding student:', error);
        // Duplicate entry handling - give a clearer message about which field caused the conflict
        if (error && error.code === 'ER_DUP_ENTRY') {
            const sqlMsg = error.sqlMessage || '';
            // Example sqlMessage: "Duplicate entry 'abc' for key 'student.student_id'"
            const match = sqlMsg.match(/for key '\s*([^']+)'/i) || sqlMsg.match(/for key `([^`]+)`/i);
            let keyName = match ? match[1] : null;
            if (keyName && keyName.includes('.')) {
                keyName = keyName.split('.').pop();
            }
            const prettyField = keyName || 'unique field';
            return res.status(409).json({ message: `Duplicate ${prettyField} already exists.`, detail: sqlMsg });
        }
        if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'Invalid foreign key reference (program_id or department).', error: error.sqlMessage });
        }
        res.status(500).json({ message: 'Failed to add student.', error: error.message });
    }
});

// 5. Health check endpoint (useful for frontend connectivity indicator)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 6. Delete Student Endpoint
// Supports DELETE /api/students/:id
// Optionally supports query param ?id= for flexibility
// DELETE by backend id OR by student_id (case-insensitive key)
app.delete('/api/students/:key?', async (req, res) => {
    try {
        // Support many shapes:
        // - /api/students/:key
        // - /api/students?id=KEY
        // - body { ids: [...] } or { id: '...' } or { student_id: '...' }
        let keys = [];
        const b = req.body || {};
        if (Array.isArray(b.ids)) keys.push(...b.ids);
        if (b.id) keys.push(b.id);
        if (b.student_id) keys.push(b.student_id);
        const single = req.params.key || req.query.id || req.query.student_id;
        if (single) keys.push(single);
        keys = keys.filter(Boolean).map(v => String(v).trim()).filter(v => v.length > 0);

        if (keys.length === 0) {
            return res.status(400).json({ message: 'Student id is required.' });
        }

        // Case-insensitive match on student_id; MySQL collations are often CI, but enforce with UPPER
        const placeholders = keys.map(() => '?').join(',');
        const upperKeys = keys.map(k => k.toUpperCase());

        // Perform a transactional delete:
        // 1) Discover all FK tables referencing student(student_id)
        // 2) Delete dependent rows from each table
        // 3) Delete from student
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Find all referencing tables/columns
            const [fkRows] = await conn.query(
                `SELECT TABLE_NAME, COLUMN_NAME
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                   AND REFERENCED_TABLE_NAME = 'student'
                   AND REFERENCED_COLUMN_NAME = 'student_id'`
            );

            for (const row of fkRows) {
                const tbl = row.TABLE_NAME;
                const col = row.COLUMN_NAME;
                try {
                    await conn.query(`DELETE FROM \`${tbl}\` WHERE UPPER(\`${col}\`) IN (${placeholders})`, upperKeys);
                } catch (e) {
                    // If table/columns don't exist or other non-critical delete error, bubble only critical ones
                    if (!(e && (e.code === 'ER_NO_SUCH_TABLE' || e.code === 'ER_BAD_FIELD_ERROR'))) {
                        throw e;
                    }
                }
            }

            const [result] = await conn.query(`DELETE FROM student WHERE UPPER(student_id) IN (${placeholders})`, upperKeys);
            await conn.commit();

            if ((result.affectedRows || 0) > 0) {
                return res.sendStatus(204);
            }
            return res.status(404).json({ message: 'Student not found', tried: keys });
        } catch (txErr) {
            try { await conn.rollback(); } catch {}
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        // Foreign key constraint fallback
        if (error && (error.errno === 1451 || error.code === 'ER_ROW_IS_REFERENCED_2')) {
            return res.status(409).json({ message: 'Cannot delete student due to related records (grades/enrollments). Remove related records first.' });
        }
        return res.status(500).json({ message: 'Failed to delete student.' });
    }
});

// 7. Scores endpoints (upsert a score per student/course/exam_type)
// Assumes a table like `score` with unique key on (student_id, course_id, exam_type)
// CREATE TABLE score (
//   student_id VARCHAR(32) NOT NULL,
//   course_id INT NOT NULL,
//   faculty_id INT NULL,
//   exam_type VARCHAR(32) DEFAULT 'internal',
//   score DECIMAL(5,2) NOT NULL,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   UNIQUE KEY uq_score (student_id, course_id, exam_type)
// );

// Create or update a score
app.post('/api/scores', async (req, res) => {
    const { student_id, course_id, faculty_id, score, exam_type } = req.body;
    if (!student_id || !course_id || score === undefined) {
        return res.status(400).json({ message: 'student_id, course_id and score are required.' });
    }
    const examType = exam_type || 'internal';
    try {
        const sql = `INSERT INTO score (student_id, course_id, faculty_id, score, exam_type)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE score = VALUES(score), faculty_id = VALUES(faculty_id), exam_type = VALUES(exam_type)`;
        await pool.query(sql, [student_id, course_id, faculty_id || null, score, examType]);
        res.status(201).json({ message: 'Score saved.', student_id, course_id, score, exam_type: examType });
    } catch (error) {
        console.error('Error saving score:', error);
        if (error && error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ message: 'Missing table `score`. Please create the table or adjust backend to your schema.' });
        }
        if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'Invalid foreign key (student_id or course_id or faculty_id)', detail: error.sqlMessage });
        }
        res.status(500).json({ message: 'Failed to save score.' });
    }
});

// Update a score explicitly (alias to POST behavior)
app.put('/api/scores', async (req, res) => {
    const { student_id, course_id, faculty_id, score, exam_type } = req.body;
    if (!student_id || !course_id || score === undefined) {
        return res.status(400).json({ message: 'student_id, course_id and score are required.' });
    }
    const examType = exam_type || 'internal';
    try {
        const sql = `INSERT INTO score (student_id, course_id, faculty_id, score, exam_type)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE score = VALUES(score), faculty_id = VALUES(faculty_id), exam_type = VALUES(exam_type)`;
        await pool.query(sql, [student_id, course_id, faculty_id || null, score, examType]);
        res.json({ message: 'Score updated.', student_id, course_id, score, exam_type: examType });
    } catch (error) {
        console.error('Error updating score:', error);
        res.status(500).json({ message: 'Failed to update score.' });
    }
});

// Get scores by filters
// Examples:
//   GET /api/scores?student_id=24BIT119
//   GET /api/scores?course_id=101
//   GET /api/scores?student_id=24BIT119&course_id=101&exam_type=midterm
app.get('/api/scores', async (req, res) => {
    try {
        const { student_id, course_id, exam_type } = req.query;
        // Check table and columns dynamically to avoid crashing on unknown columns
        const [cols] = await pool.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'score'`
        );
        const available = new Set(cols.map(r => r.COLUMN_NAME));
        if (cols.length === 0) {
            // No score table
            return res.json([]);
        }

        const where = [];
        const params = [];
        if (student_id && available.has('student_id')) { where.push('student_id = ?'); params.push(student_id); }
        if (course_id && available.has('course_id')) { where.push('course_id = ?'); params.push(course_id); }
        if (exam_type && available.has('exam_type')) { where.push('exam_type = ?'); params.push(exam_type); }

        const orderCol = available.has('updated_at') ? 'updated_at' : available.has('score') ? 'score' : 'student_id';
        const sql = `SELECT * FROM score ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderCol} DESC`;
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching scores:', error);
        // Fallback: try a very simple select to avoid breaking the app
        try {
            const [rows] = await pool.query('SELECT * FROM score');
            return res.json(rows);
        } catch (e2) {
            return res.json([]);
        }
    }
});


// 8. Attendance endpoints
// Link attendance to student (student_id) and course (course_id)
// Expected minimal columns in `attendance`: student_id (FK), course_id (FK), date (DATE), status (VARCHAR), remarks (TEXT nullable)
// We dynamically detect the date column among: 'date', 'att_date', 'attendance_date'

// Helper to detect attendance columns and build accessors
async function getAttendanceColumns(conn) {
    const [cols] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendance'`
    );
    const names = new Set(cols.map(c => c.COLUMN_NAME));
    // Detect date column variants
    const dateCol = names.has('class_date') ? 'class_date' : (names.has('date') ? 'date' : (names.has('att_date') ? 'att_date' : (names.has('attendance_date') ? 'attendance_date' : null)));
    const statusCol = names.has('status') ? 'status' : null;
    const remarksCol = names.has('remarks') ? 'remarks' : (names.has('note') ? 'note' : null);
    const studentCol = names.has('student_id') ? 'student_id' : null;
    // Check for course_id or section_id
    const courseCol = names.has('course_id') ? 'course_id' : null;
    const sectionCol = names.has('section_id') ? 'section_id' : null;
    return { dateCol, statusCol, remarksCol, studentCol, courseCol, sectionCol, hasTable: cols.length > 0 };
}

// GET /api/attendance?student_id=&course_id=&date=
app.get('/api/attendance', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { dateCol, statusCol, remarksCol, studentCol, courseCol, sectionCol, hasTable } = await getAttendanceColumns(conn);
        if (!hasTable || !dateCol || !statusCol || !studentCol) {
            return res.json([]); // Graceful empty if table or required cols missing
        }

        const { student_id, course_id, date } = req.query;
        const where = [];
        const params = [];
        
        if (student_id) { where.push(`a.\`${studentCol}\` = ?`); params.push(student_id); }
        if (date) { where.push(`a.\`${dateCol}\` = ?`); params.push(date); }
        
        // Build SQL based on whether attendance has course_id or section_id
        let sql;
        if (courseCol) {
            // Direct course_id in attendance table
            if (course_id) { where.push(`a.\`${courseCol}\` = ?`); params.push(course_id); }
            sql = `
                SELECT 
                    a.\`${studentCol}\` AS student_id,
                    a.\`${courseCol}\` AS course_id,
                    a.\`${dateCol}\` AS date,
                    a.\`${statusCol}\` AS status,
                    ${remarksCol ? `a.\`${remarksCol}\` AS remarks,` : `NULL AS remarks,`}
                    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                    s.email AS student_email,
                    c.title AS course_title
                FROM attendance a
                LEFT JOIN student s ON s.student_id = a.\`${studentCol}\`
                LEFT JOIN course c ON c.course_id = a.\`${courseCol}\`
                ${where.length ? ('WHERE ' + where.join(' AND ')) : ''}
                ORDER BY a.\`${dateCol}\` DESC, a.\`${studentCol}\` ASC`;
        } else if (sectionCol) {
            // Attendance has section_id; join through section to get course
            if (course_id) { where.push(`sec.course_id = ?`); params.push(course_id); }
            sql = `
                SELECT 
                    a.\`${studentCol}\` AS student_id,
                    sec.course_id AS course_id,
                    a.\`${dateCol}\` AS date,
                    a.\`${statusCol}\` AS status,
                    ${remarksCol ? `a.\`${remarksCol}\` AS remarks,` : `NULL AS remarks,`}
                    CONCAT(st.first_name, ' ', st.last_name) AS student_name,
                    st.email AS student_email,
                    c.title AS course_title
                FROM attendance a
                LEFT JOIN student st ON st.student_id = a.\`${studentCol}\`
                LEFT JOIN section sec ON sec.section_id = a.\`${sectionCol}\`
                LEFT JOIN course c ON c.course_id = sec.course_id
                ${where.length ? ('WHERE ' + where.join(' AND ')) : ''}
                ORDER BY a.\`${dateCol}\` DESC, a.\`${studentCol}\` ASC`;
        } else {
            // No course or section reference
            return res.json([]);
        }
        
        const [rows] = await conn.query(sql, params);
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return res.json([]);
    } finally {
        if (conn) conn.release();
    }
});

// POST /api/attendance
// Body: { student_id, course_id, date: 'YYYY-MM-DD', status: 'Present'|'Absent', remarks? }
// Upsert behavior: if unique key on (student_id, course_id, date) exists, use ON DUPLICATE KEY UPDATE; else fallback to select+update or insert
app.post('/api/attendance', async (req, res) => {
    const { student_id, course_id, date, status, remarks } = req.body || {};
    if (!student_id || !course_id || !date || !status) {
        return res.status(400).json({ message: 'student_id, course_id, date, and status are required.' });
    }
    let conn;
    try {
        conn = await pool.getConnection();
        const { dateCol, statusCol, remarksCol, studentCol, courseCol, hasTable } = await getAttendanceColumns(conn);
        if (!hasTable || !dateCol || !statusCol || !studentCol || !courseCol) {
            return res.status(500).json({ message: 'Missing attendance table/columns in database.' });
        }

        // Try ON DUPLICATE KEY first
        const tryUpsert = async () => {
            const sql = `INSERT INTO attendance (\`${studentCol}\`, \`${courseCol}\`, \`${dateCol}\`, \`${statusCol}\`${remarksCol ? `, \`${remarksCol}\`` : ''})
                         VALUES (?, ?, ?, ?${remarksCol ? ', ?' : ''})
                         ON DUPLICATE KEY UPDATE \`${statusCol}\` = VALUES(\`${statusCol}\`)${remarksCol ? `, \`${remarksCol}\` = VALUES(\`${remarksCol}\`)` : ''}`;
            const params = [student_id, course_id, date, status];
            if (remarksCol) params.push(remarks || null);
            await conn.query(sql, params);
        };

        try {
            await tryUpsert();
        } catch (err) {
            // If table has no unique key, fallback to select+update or insert
            if (err && err.code === 'ER_DUP_ENTRY') {
                // still a dup, but handled; rethrow to outer
                throw err;
            }
            // Fallback flow
            const [existing] = await conn.query(
                `SELECT 1 FROM attendance WHERE \`${studentCol}\` = ? AND \`${courseCol}\` = ? AND \`${dateCol}\` = ? LIMIT 1`,
                [student_id, course_id, date]
            );
            if (existing.length > 0) {
                const upSql = `UPDATE attendance SET \`${statusCol}\` = ?, ${remarksCol ? `\`${remarksCol}\` = ?, ` : ''}\`${dateCol}\` = \`${dateCol}\` WHERE \`${studentCol}\` = ? AND \`${courseCol}\` = ? AND \`${dateCol}\` = ?`;
                const upParams = remarksCol ? [status, (remarks || null), student_id, course_id, date] : [status, student_id, course_id, date];
                await conn.query(upSql, upParams);
            } else {
                const insSql = `INSERT INTO attendance (\`${studentCol}\`, \`${courseCol}\`, \`${dateCol}\`, \`${statusCol}\`${remarksCol ? `, \`${remarksCol}\`` : ''}) VALUES (?, ?, ?, ?${remarksCol ? ', ?' : ''})`;
                const insParams = [student_id, course_id, date, status];
                if (remarksCol) insParams.push(remarks || null);
                await conn.query(insSql, insParams);
            }
        }

        return res.status(201).json({ message: 'Attendance saved.' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        if (error && error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ message: 'Missing table `attendance`. Please create the table or adjust backend to your schema.' });
        }
        if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'Invalid foreign key (student_id or course_id)', detail: error.sqlMessage });
        }
        return res.status(500).json({ message: 'Failed to save attendance.' });
    } finally {
        if (conn) conn.release();
    }
});

// 9. Exams endpoints
// Exposes exam schedule information. Table name (optional) expected: `exam_schedule`
// Expected columns (detected dynamically):
//  - exam_id (PK), title, exam_date/date, start_time, end_time, course_id, hall/exam_hall, faculty_id, paper/code
// GET /api/exams?student_id=&faculty_id=&course_id=&date=
app.get('/api/exams', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        // Check if exam_schedule table exists
        const [tbl] = await conn.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_schedule'`);
        if (tbl.length === 0) return res.json([]);

        // Inspect columns
        const [cols] = await conn.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_schedule'`);
        const names = new Set(cols.map(c => c.COLUMN_NAME));

        const idCol = names.has('exam_id') ? 'exam_id' : (names.has('id') ? 'id' : null);
        const titleCol = names.has('title') ? 'title' : (names.has('exam_name') ? 'exam_name' : null);
        const dateCol = names.has('exam_date') ? 'exam_date' : (names.has('date') ? 'date' : null);
        const startCol = names.has('start_time') ? 'start_time' : null;
        const endCol = names.has('end_time') ? 'end_time' : null;
        const courseCol = names.has('course_id') ? 'course_id' : null;
        const hallCol = names.has('hall') ? 'hall' : (names.has('exam_hall') ? 'exam_hall' : null);
        const facultyCol = names.has('faculty_id') ? 'faculty_id' : null;
        const paperCol = names.has('paper') ? 'paper' : (names.has('paper_code') ? 'paper_code' : null);

        // Server-side enforcement: prefer explicit auth headers when present.
        // Frontend should pass X-User-Id and X-User-Role when available.
        const headerUserId = String(req.get('x-user-id') || '').trim() || null;
        const headerUserRole = String(req.get('x-user-role') || '').trim() || null;

        // Start from query, but may be overridden below
        const q = req.query || {};
        let { student_id, faculty_id, course_id, date } = q;
        // If the client provided auth headers, enforce scope server-side
        if (headerUserId && headerUserRole) {
            if (headerUserRole === 'student') {
                // Force student scope
                student_id = headerUserId;
            } else if (headerUserRole === 'faculty') {
                // Force faculty scope
                faculty_id = headerUserId;
            }
        }
        const where = [];
        const params = [];
        let extraJoin = '';

        // If exam_schedule has an explicit student_id column, filter directly.
        // Otherwise, try to limit exams to the student's enrolled courses using the enrollment table.
    if (student_id) {
            if (names.has('student_id')) {
                where.push(`\`student_id\` = ?`); params.push(student_id);
            } else {
                // Try to detect enrollment table and course relationship
                if (courseCol) {
                    const [enTbl] = await conn.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enrollment'`);
                    if (enTbl.length > 0) {
                        // Ensure enrollment has course_id and student_id
                        const [enCols] = await conn.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enrollment'`);
                        const enNames = new Set(enCols.map(c => c.COLUMN_NAME));
                        if (enNames.has('course_id') && enNames.has('student_id')) {
                            extraJoin += ` JOIN enrollment e ON e.course_id = s.\`${courseCol}\``;
                            where.push('e.student_id = ?'); params.push(student_id);
                        }
                    }
                }
            }
        }
        if (faculty_id && facultyCol) { where.push(`\`${facultyCol}\` = ?`); params.push(faculty_id); }
        if (course_id && courseCol) { where.push(`\`${courseCol}\` = ?`); params.push(course_id); }
        if (date && dateCol) { where.push(`\`${dateCol}\` = ?`); params.push(date); }

        // Build select list with safe aliases
        const selectCols = [];
        if (idCol) selectCols.push(`s.\`${idCol}\` AS exam_id`);
        if (titleCol) selectCols.push(`s.\`${titleCol}\` AS title`);
        if (dateCol) selectCols.push(`s.\`${dateCol}\` AS date`);
        if (startCol) selectCols.push(`s.\`${startCol}\` AS start_time`);
        if (endCol) selectCols.push(`s.\`${endCol}\` AS end_time`);
        if (hallCol) selectCols.push(`s.\`${hallCol}\` AS hall`);
        if (paperCol) selectCols.push(`s.\`${paperCol}\` AS paper`);
        if (courseCol) selectCols.push(`s.\`${courseCol}\` AS course_id`);
        if (facultyCol) selectCols.push(`s.\`${facultyCol}\` AS faculty_id`);

        // Join with course and faculty for readable fields when available
        let joins = '';
        if (courseCol) joins += ' LEFT JOIN course c ON c.course_id = s.`' + courseCol + '`';
        if (facultyCol) joins += ' LEFT JOIN faculty f ON f.faculty_id = s.`' + facultyCol + '`';
        if (selectCols.length === 0) selectCols.push('s.*');

    const sql = `SELECT ${selectCols.join(', ')}, ${courseCol ? 'c.title AS course_title,' : ''} ${facultyCol ? "CONCAT(f.first_name,' ',f.last_name) AS faculty_name" : 'NULL AS faculty_name'} FROM exam_schedule s ${joins} ${extraJoin} ${where.length ? ('WHERE ' + where.join(' AND ')) : ''} ORDER BY ${dateCol ? ('s.`' + dateCol + '` DESC') : 's.`' + (idCol || 'exam_id') + '` DESC'}`;

        const [rows] = await conn.query(sql, params);
        // Normalize faculty_name when NULL
        const normalized = rows.map(r => ({
            exam_id: r.exam_id,
            title: r.title,
            date: r.date,
            start_time: r.start_time,
            end_time: r.end_time,
            hall: r.hall,
            paper: r.paper,
            course_id: r.course_id,
            course_title: r.course_title || null,
            faculty_id: r.faculty_id,
            faculty_name: r.faculty_name || null,
        }));

        return res.json(normalized);
    } catch (error) {
        console.error('Error fetching exams:', error);
        return res.json([]);
    } finally {
        if (conn) conn.release();
    }
});

// ===== EXAM MANAGEMENT ENDPOINTS =====

// Create a new exam with hall and teacher assignments
app.post('/api/exams', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { title, exam_date, start_time, end_time, course_id, section_id, hall, exam_type, teacher_assignments } = req.body;
        
        // Insert main exam record
        const [result] = await conn.query(
            `INSERT INTO exam_schedule (title, exam_date, start_time, end_time, course_id, section_id, hall, exam_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, exam_date, start_time, end_time, course_id, section_id, hall, exam_type || 'Regular']
        );
        
        const examId = result.insertId;
        
        // Insert teacher assignments if provided
        if (teacher_assignments && Array.isArray(teacher_assignments)) {
            for (const assignment of teacher_assignments) {
                await conn.query(
                    `INSERT INTO exam_teacher_assignment (exam_id, faculty_id, course_id, role_type) 
                     VALUES (?, ?, ?, ?)`,
                    [examId, assignment.faculty_id, assignment.course_id, assignment.role_type || 'both']
                );
            }
        }
        
        res.json({ success: true, exam_id: examId, message: 'Exam created successfully' });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        conn.release();
    }
});

// Get all exams with details
app.get('/api/exams', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [exams] = await conn.query(`
            SELECT 
                es.*,
                c.title AS course_title,
                CONCAT(COALESCE(s.section_no, ''), ' ', COALESCE(s.term, ''), ' ', COALESCE(s.year, '')) AS section_name,
                CONCAT(f.first_name, ' ', f.last_name) AS faculty_name
            FROM exam_schedule es
            LEFT JOIN course c ON es.course_id = c.course_id
            LEFT JOIN section s ON es.section_id = s.section_id
            LEFT JOIN faculty f ON es.faculty_id = f.faculty_id
            ORDER BY es.exam_date DESC, es.start_time DESC
        `);
        
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
});

// Get exam details with all assignments
app.get('/api/exams/:examId', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { examId } = req.params;
        
        // Get exam details
        const [exams] = await conn.query(`
            SELECT 
                es.*,
                c.title AS course_title,
                CONCAT(COALESCE(s.section_no, ''), ' ', COALESCE(s.term, ''), ' ', COALESCE(s.year, '')) AS section_name
            FROM exam_schedule es
            LEFT JOIN course c ON es.course_id = c.course_id
            LEFT JOIN section s ON es.section_id = s.section_id
            WHERE es.exam_id = ?
        `, [examId]);
        
        if (exams.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        // Get teacher assignments
        const [teachers] = await conn.query(`
            SELECT 
                eta.*,
                CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
                c.title AS course_title
            FROM exam_teacher_assignment eta
            JOIN faculty f ON eta.faculty_id = f.faculty_id
            JOIN course c ON eta.course_id = c.course_id
            WHERE eta.exam_id = ?
        `, [examId]);
        
        res.json({ exam: exams[0], teacher_assignments: teachers });
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
});

// Assign teacher to inspect/correct papers
app.post('/api/exams/:examId/assign-teacher', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { examId } = req.params;
        const { faculty_id, course_id, role_type } = req.body;
        
        await conn.query(
            `INSERT INTO exam_teacher_assignment (exam_id, faculty_id, course_id, role_type) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE role_type = VALUES(role_type)`,
            [examId, faculty_id, course_id, role_type || 'both']
        );
        
        res.json({ success: true, message: 'Teacher assigned successfully' });
    } catch (error) {
        console.error('Error assigning teacher:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        conn.release();
    }
});

// Create/Update exam timetable for sections
app.post('/api/exam-timetable', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { exam_id, section_id, course_id, exam_date, start_time, end_time, hall, instructions } = req.body;
        
        const [result] = await conn.query(
            `INSERT INTO exam_timetable (exam_id, section_id, course_id, exam_date, start_time, end_time, hall, instructions) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [exam_id, section_id, course_id, exam_date, start_time, end_time, hall, instructions]
        );
        
        res.json({ success: true, timetable_id: result.insertId, message: 'Timetable entry created' });
    } catch (error) {
        console.error('Error creating timetable entry:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        conn.release();
    }
});

// Get exam timetable for a section
app.get('/api/exam-timetable/section/:sectionId', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { sectionId } = req.params;
        
        const [timetable] = await conn.query(`
            SELECT 
                et.*,
                es.title AS exam_title,
                c.title AS course_title,
                CONCAT(COALESCE(s.section_no, ''), ' ', COALESCE(s.term, ''), ' ', COALESCE(s.year, '')) AS section_name
            FROM exam_timetable et
            JOIN exam_schedule es ON et.exam_id = es.exam_id
            JOIN course c ON et.course_id = c.course_id
            JOIN section s ON et.section_id = s.section_id
            WHERE et.section_id = ?
            ORDER BY et.exam_date, et.start_time
        `, [sectionId]);
        
        res.json(timetable);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
});

// Get all exam timetables (admin view)
app.get('/api/exam-timetable', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [timetable] = await conn.query(`
            SELECT 
                et.*,
                es.title AS exam_title,
                c.title AS course_title,
                CONCAT(COALESCE(s.section_no, ''), ' ', COALESCE(s.term, ''), ' ', COALESCE(s.year, '')) AS section_name
            FROM exam_timetable et
            JOIN exam_schedule es ON et.exam_id = es.exam_id
            JOIN course c ON et.course_id = c.course_id
            JOIN section s ON et.section_id = s.section_id
            ORDER BY et.exam_date, et.start_time
        `);
        
        res.json(timetable);
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
});

// Delete exam
app.delete('/api/exams/:examId', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { examId } = req.params;
        await conn.query('DELETE FROM exam_schedule WHERE exam_id = ?', [examId]);
        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        conn.release();
    }
});

// Get teacher's assigned exams
app.get('/api/teacher-exams/:facultyId', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { facultyId } = req.params;
        
        const [assignments] = await conn.query(`
            SELECT 
                eta.*,
                es.title AS exam_title,
                es.exam_date,
                es.start_time,
                es.end_time,
                es.hall,
                c.title AS course_title
            FROM exam_teacher_assignment eta
            JOIN exam_schedule es ON eta.exam_id = es.exam_id
            JOIN course c ON eta.course_id = c.course_id
            WHERE eta.faculty_id = ?
            ORDER BY es.exam_date DESC
        `, [facultyId]);
        
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching teacher exams:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
});


// --- Server Start ---
// Start the server and handle EADDRINUSE by trying the next port number
function startServer(portToTry) {
    const server = app.listen(portToTry, () => {
        console.log(`Server listening on port ${portToTry}`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.warn(`Port ${portToTry} in use, trying port ${portToTry + 1}...`);
            // Try the next port
            startServer(portToTry + 1);
        } else {
            console.error('Server failed to start:', err);
            process.exit(1);
        }
    });
}

startServer(desiredPort);

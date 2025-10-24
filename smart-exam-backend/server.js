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
       const [detailRows] = await pool.query(query, params);
       if (detailRows.length > 0) {
            const details = detailRows[0];
            userDetails = {
                id: details.id,
                username: `${details.first_name} ${details.last_name}`,
                email: details.email,
            };
       } else {
            console.error(`Could not find linked details for ${userAccount.person_type} ID: ${userAccount.linked_person_id}`);
            // Fallback if linked record not found
            userDetails = {
                 id: userAccount.linked_person_id || userAccount.user_id,
                 username: userAccount.username, // Fallback to username
                 email: userAccount.username,
            }
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

app.get('/api/courses', async (req, res) => {
     try {
        const [rows] = await pool.query(`
            SELECT 
                c.course_id as id, 
                c.title, 
                c.credits, 
                c.dept_id 
            FROM course c
            ORDER BY c.course_id ASC
        `);
         // Add dummy faculty/grade for now
        const coursesWithExtras = rows.map(c => ({ ...c, faculty: 'Unassigned', grade: null })); 
        res.json(coursesWithExtras);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch courses." });
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
        if (error && error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Student with given unique field already exists.', error: error.sqlMessage });
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

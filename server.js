import express from 'express';
import mysql from 'mysql2';
const app     = express();

// Load configuration from environment (with defaults for local dev)
const PORT = process.env.PORT || 3000;
const dbConfig = {
  host:     process.env.DB_HOST || 'localhost',
  user:     process.env.DB_USER || 'tasksuser',
  password: process.env.DB_PASSWORD || 'taskspassword',
  database: process.env.DB_NAME || 'tasksdb'
};

// Create a connection pool to the MySQL database
const pool = mysql.createPool(dbConfig);

// Middleware to parse JSON request bodies
app.use(express.json());

// Ensure the "tasks" table exists (create if not present)
pool.query(
  `CREATE TABLE IF NOT EXISTS tasks (
     id INT AUTO_INCREMENT PRIMARY KEY,
     description VARCHAR(255) NOT NULL,
     done TINYINT(1) NOT NULL DEFAULT 0
   )`,
  err => {
    if (err) {
      console.error('Error ensuring tasks table exists:', err);
    } else {
      console.log('Tasks table is ready.');
    }
  }
);

// API route: Get all tasks
app.get('/api/tasks', (req, res) => {
  pool.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    // results will be an array of task objects
    res.json(results);
  });
});

// API route: Create a new task
app.post('/api/tasks', (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  pool.query(
    'INSERT INTO tasks (description, done) VALUES (?, ?)',
    [description, 0],  // new tasks start as not done
    (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      // Construct the created task object (insertId gives new ID)
      const newTask = { id: results.insertId, description: description, done: 0 };
      res.status(201).json(newTask);
    }
  );
});

// API route: Update a task (e.g., mark as done or update description)
app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { description, done } = req.body;
  if (description === undefined && done === undefined) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  // Build dynamic query based on provided fields
  const updates = [];
  const params = [];
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }
  if (done !== undefined) {
    updates.push('done = ?');
    // Convert boolean `done` to numeric 0/1
    params.push(done ? 1 : 0);
  }
  params.push(taskId);
  const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ id: Number(taskId), description, done });
  });
});

// API route: Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  pool.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();  // 204 No Content on successful deletion
  });
});

// Serve static files (frontend)
app.use(express.static('frontend'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
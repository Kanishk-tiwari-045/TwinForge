import pool from '../config/database.js';

// Save browsing history
export async function saveHistory(req, res) {
  try {
    const { email, url, title, duration, last_visit_time } = req.body;

    if (!email || !url) {
      return res.status(400).json({ error: 'Email and URL are required' });
    }

    const query = `
      INSERT INTO browsing_history (email, url, title, duration, last_visit_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      email,
      url,
      title || 'No Title',
      duration || 0,
      last_visit_time || new Date().toISOString()
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error saving browsing history:', error);
    res.status(500).json({ error: 'Failed to save browsing history' });
  }
}

// Get browsing history by email
export async function getHistory(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const query = `
      SELECT * FROM browsing_history 
      WHERE email = $1 
      ORDER BY last_visit_time DESC 
      LIMIT 50
    `;

    const result = await pool.query(query, [email]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching browsing history:', error);
    res.status(500).json({ error: 'Failed to fetch browsing history' });
  }
}

import pool from '../config/database.js';

// Get all emails
export const getEmails = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, subject, body, sender, date FROM emails ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Error fetching data from database' });
  }
};

// Add sample emails to database
export const addSampleEmails = async (req, res) => {
  try {
    const sampleEmails = [
      {
        subject: "Top Internships That Fit Your Skills, Adhiraj Singh",
        body: "Here are some exciting internship opportunities that align with your skills and expertise:\n\n1. ML Internship at Tower Research Capital India - ₹16,667/month\n2. Data Analyst Internship at Fairdeal.Market - ₹10,000/month\n3. Front End Development Internship at Softius Technologies - ₹4,500/month\n4. Backend Developer Internship at Vecmocon - ₹30,000/month\n5. Outreach/Marketing Internship at F13 Technologies - ₹5,000/month\n\nApply now and make the most of these opportunities!",
        sender: "noreply@dare2compete.news",
        date: "2025-03-30"
      },
      {
        subject: "Future Trends in Data Pipelines Test Submitted Successfully",
        body: "Hello Champion! 🏆\n\nCongrats on completing the Future Trends in Data Pipelines Test! 🎉 We're thrilled to have you in the SkillBrew.AI community. Your time and effort are like the secret sauce that makes everything better!\n\nIf you have any questions or just want to chat, feel free to reach out. We're always here to help! ☕\n\nCheers, Team SkillBrew",
        sender: "no-reply@skillbrew.ai",
        date: "2025-03-29"
      },
      {
        subject: "GitHub Invitation to Collaborate on TwinForge",
        body: "You've been invited to collaborate on the Kanishk-tiwari-045/TwinForge repository on GitHub. Accept or decline the invitation by visiting the link below.\n\nInvitation expires in 7 days.\n\n[View Invitation](https://github.com/Kanishk-tiwari-045/TwinForge/invitations)\n\nNote: If this invitation was not expected, feel free to ignore it.",
        sender: "noreply@github.com",
        date: "2025-03-29"
      },
      {
        subject: "LinkedIn Comment Update on Ayush Ranwa Post",
        body: "Varun Pareek and others have added 2 comments on Ayush Ranwa's post. The discussion is about Blockchain and its potential to minimize deepfakes.\n\nJoin the conversation now!\n\n12 reactions · 2 comments",
        sender: "notifications-noreply@linkedin.com",
        date: "2025-03-29"
      },
      {
        subject: "HackCrux is Starting in 1 Hour",
        body: "HackCrux is starting in just 1 hour! It's happening today, March 29, from 8:00 AM to 8:30 PM GMT+5:30 at the LNM Institute of Information Technology, Jaipur.\n\nBe there for an exciting event, and don't forget to check your ticket details.",
        sender: "usr-D1DoiS40qwIxgtw@user.luma-mail.com",
        date: "2025-03-29"
      }
    ];

    const insertPromises = sampleEmails.map(email =>
      pool.query(
        'INSERT INTO emails (subject, body, sender, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [email.subject, email.body, email.sender, email.date]
      )
    );

    const results = await Promise.all(insertPromises);
    const insertedEmails = results.map(r => r.rows[0]);

    res.status(201).json({
      success: true,
      message: `${insertedEmails.length} sample emails added successfully`,
      data: insertedEmails
    });
  } catch (error) {
    console.error('Error adding sample emails:', error);
    res.status(500).json({ error: 'Error adding sample emails to database' });
  }
};

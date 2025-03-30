
import React, { useState } from 'react';
import { ArrowRight, Mail, AlertCircle, Loader2, ChevronRight, ChevronDown } from 'lucide-react';

const emails = [
    {
      id: 1,
      subject: "Top Internships That Fit Your Skills, Adhiraj Singh",
      body: "Here are some exciting internship opportunities that align with your skills and expertise:\n\n1. ML Internship at Tower Research Capital India - ₹16,667/month\n2. Data Analyst Internship at Fairdeal.Market - ₹10,000/month\n3. Front End Development Internship at Softius Technologies - ₹4,500/month\n4. Backend Developer Internship at Vecmocon - ₹30,000/month\n5. Outreach/Marketing Internship at F13 Technologies - ₹5,000/month\n\nApply now and make the most of these opportunities!",
      sender: "noreply@dare2compete.news",
      date: "March 30, 2025",
    },
    {
      id: 2,
      subject: "Future Trends in Data Pipelines Test Submitted Successfully",
      body: "Hello Champion! 🏆\n\nCongrats on completing the Future Trends in Data Pipelines Test! 🎉 We’re thrilled to have you in the SkillBrew.AI community. Your time and effort are like the secret sauce that makes everything better!\n\nIf you have any questions or just want to chat, feel free to reach out. We’re always here to help! ☕\n\nCheers, Team SkillBrew",
      sender: "no-reply@skillbrew.ai",
      date: "March 29, 2025",
    },
    {
      id: 3,
      subject: "GitHub Invitation to Collaborate on TwinForge",
      body: "You’ve been invited to collaborate on the Kanishk-tiwari-045/TwinForge repository on GitHub. Accept or decline the invitation by visiting the link below.\n\nInvitation expires in 7 days.\n\n[View Invitation](https://github.com/Kanishk-tiwari-045/TwinForge/invitations)\n\nNote: If this invitation was not expected, feel free to ignore it.",
      sender: "noreply@github.com",
      date: "March 29, 2025",
    },
    {
      id: 4,
      subject: "LinkedIn Comment Update on Ayush Ranwa Post",
      body: "Varun Pareek and others have added 2 comments on Ayush Ranwa’s post. The discussion is about Blockchain and its potential to minimize deepfakes.\n\nJoin the conversation now!\n\n12 reactions · 2 comments",
      sender: "notifications-noreply@linkedin.com",
      date: "March 29, 2025",
    },
    {
      id: 5,
      subject: "HackCrux is Starting in 1 Hour",
      body: "HackCrux is starting in just 1 hour! It’s happening today, March 29, from 8:00 AM to 8:30 PM GMT+5:30 at the LNM Institute of Information Technology, Jaipur.\n\nBe there for an exciting event, and don’t forget to check your ticket details.",
      sender: "usr-D1DoiS40qwIxgtw@user.luma-mail.com",
      date: "March 29, 2025",
    },
  ];
  
  
const EmailPage: React.FC = () => {
  const [generatedReplies, setGeneratedReplies] = useState<Record<number, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null);
  const userId = localStorage.getItem('username');

  const handleGenerateReply = async (emailId: number, emailBody: string) => {
    if (!userId) {
      setErrors(prev => ({ ...prev, [emailId]: "User ID not found. Please log in." }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [emailId]: true }));
    setErrors(prev => ({ ...prev, [emailId]: '' }));
    setGeneratedReplies(prev => ({ ...prev, [emailId]: '' }));

    try {
      const response = await fetch('http://localhost:3000/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, email_or_msg: emailBody }),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success && data.ai_response) {
        setGeneratedReplies(prev => ({ ...prev, [emailId]: data.ai_response }));
      } else {
        throw new Error(data.message || 'No reply generated');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [emailId]: error instanceof Error ? error.message : 'Failed to generate reply'
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [emailId]: false }));
    }
  };

  const toggleEmailExpand = (id: number) => {
    setExpandedEmailId(expandedEmailId === id ? null : id);
  };

  // Styles object remains the same as in your previous code
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)',
    } as React.CSSProperties,
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '900px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    } as React.CSSProperties,
    header: {
      background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
      padding: '2rem',
      color: 'white',
      textAlign: 'center',
    } as React.CSSProperties,
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    } as React.CSSProperties,
    description: {
      fontSize: '1rem',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
    } as React.CSSProperties,
    content: {
      padding: '2rem',
    } as React.CSSProperties,
    emailList: {
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
    } as React.CSSProperties,
    emailItem: {
      borderBottom: '1px solid #e2e8f0',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#f7fafc',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
    } as React.CSSProperties,
    emailHeader: {
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
    } as React.CSSProperties,
    emailSubject: {
      fontWeight: '600',
      color: '#1a365d',
      fontSize: '1rem',
      margin: 0,
      flex: 1,
    } as React.CSSProperties,
    emailMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#718096',
      fontSize: '0.875rem',
    } as React.CSSProperties,
    emailBody: {
      padding: '0 1.5rem 1.5rem 1.5rem',
      color: '#4a5568',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
    } as React.CSSProperties,
    emailActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    } as React.CSSProperties,
    button: {
      backgroundColor: '#4299e1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#3182ce',
      },
      '&:disabled': {
        backgroundColor: '#cbd5e0',
        cursor: 'not-allowed',
      },
    } as React.CSSProperties,
    replyContainer: {
      backgroundColor: '#ebf8ff',
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '1.5rem',
      borderLeft: '4px solid #4299e1',
    } as React.CSSProperties,
    replyHeader: {
      fontWeight: '600',
      color: '#2b6cb0',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    } as React.CSSProperties,
    replyText: {
      color: '#2d3748',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
    } as React.CSSProperties,
    error: {
      backgroundColor: '#fff5f5',
      color: '#c53030',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.95rem',
    } as React.CSSProperties,
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#4a5568',
      fontSize: '0.875rem',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Mail size={24} />
            Email Reply Generator
          </h1>
          <p style={styles.description}>
            Generate personalized replies to your emails using AI
          </p>
        </div>

        <div style={styles.content}>
          <div style={styles.emailList}>
            {emails.map((email) => (
              <div key={email.id} style={styles.emailItem}>
                <div 
                  style={styles.emailHeader}
                  onClick={() => toggleEmailExpand(email.id)}
                >
                  <h3 style={styles.emailSubject}>{email.subject}</h3>
                  <div style={styles.emailMeta}>
                    <span>{email.sender}</span>
                    <span>{email.date}</span>
                    {expandedEmailId === email.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {expandedEmailId === email.id && (
                  <div style={styles.emailBody}>
                    <p>{email.body}</p>
                    <div style={styles.emailActions}>
                      <button
                        onClick={() => handleGenerateReply(email.id, email.body)}
                        disabled={loadingStates[email.id]}
                        style={styles.button}
                      >
                        {loadingStates[email.id] ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ArrowRight size={16} />
                            Generate Reply
                          </>
                        )}
                      </button>
                    </div>

                    {errors[email.id] && (
                      <div style={styles.error}>
                        <AlertCircle size={18} />
                        {errors[email.id]}
                      </div>
                    )}

                    {generatedReplies[email.id] && (
                      <div style={styles.replyContainer}>
                        <h4 style={styles.replyHeader}>Generated Reply</h4>
                        <p style={styles.replyText}>{generatedReplies[email.id]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPage;

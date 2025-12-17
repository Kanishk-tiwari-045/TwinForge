
import React, { useState, useEffect, CSSProperties } from 'react';
import { Trash2, Plus, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

const UserPrompting: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('username');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError('User ID not found. Please log in again.');
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      addMessage();
    }
  };

  const addMessage = async () => {
    if (!inputText.trim()) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch("http://localhost:3000/api/detect-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText.trim() }),
      });
  
      const data = await response.json();
  
      if (data.ai_generated) {
        setError("AI-generated text detected. Please enter a human-written email/message.");
      } else {
        setMessages([...messages, inputText.trim()]);
        setInputText("");
      }
    } catch (err) {
      // If AI detection fails (quota/error), still add the message
      console.warn("AI detection failed, adding message anyway:", err);
      setMessages([...messages, inputText.trim()]);
      setInputText("");
    } finally {
      setLoading(false);
    }
  };
  

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (messages.length < 5) {
      setError('Please add at least 10 sample emails before submitting.');
      return;
    }

    if (!userId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!userId || !Array.isArray(messages) || messages.length === 0) {
        setError('Please provide a user ID and at least one message.');
        setLoading(false);
        return;
      }
    
      const response = await fetch('http://localhost:3000/api/analyze-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          messages: messages
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze writing style');
      }
    
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem',
      background: 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)',
    } as CSSProperties,
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '900px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    } as CSSProperties,
    header: {
      background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
      padding: '2rem',
      color: 'white',
      textAlign: 'center',
    } as CSSProperties,
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      fontFamily: "'Inter', sans-serif",
    } as CSSProperties,
    description: {
      fontSize: '1.1rem',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
    } as CSSProperties,
    content: {
      padding: '2rem',
    } as CSSProperties,
    inputSection: {
      marginBottom: '2rem',
      background: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '12px',
    } as CSSProperties,
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1a365d',
      marginBottom: '0.75rem',
    } as CSSProperties,
    sectionDescription: {
      fontSize: '1rem',
      color: '#4a5568',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
    } as CSSProperties,
    textarea: {
      width: '100%',
      minHeight: '180px',
      padding: '1rem',
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      fontFamily: "'Inter', sans-serif",
      fontSize: '1rem',
      color: '#2d3748',
      resize: 'vertical',
      transition: 'border-color 0.2s',
      '&:focus': {
        borderColor: '#4299e1',
        outline: 'none',
      },
    } as CSSProperties,
    buttonRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
    } as CSSProperties,
    hint: {
      fontSize: '0.875rem',
      color: '#718096',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    } as CSSProperties,
    button: {
      backgroundColor: '#4299e1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#3182ce',
      },
    } as CSSProperties,
    samplesContainer: {
      background: '#ffffff',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      overflow: 'hidden',
    } as CSSProperties,
    samplesHeader: {
      padding: '1rem 1.5rem',
      borderBottom: '2px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as CSSProperties,
    badge: {
      backgroundColor: '#ebf8ff',
      color: '#2b6cb0',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
    } as CSSProperties,
    samplesList: {
      maxHeight: '400px',
      overflowY: 'auto',
    } as CSSProperties,
    sampleItem: {
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#f7fafc',
      },
    } as CSSProperties,
    sampleText: {
      margin: 0,
      flex: 1,
      paddingRight: '1rem',
      fontSize: '0.95rem',
      color: '#2d3748',
      lineHeight: '1.6',
    } as CSSProperties,
    deleteButton: {
      background: 'none',
      border: 'none',
      color: '#e53e3e',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '6px',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#fff5f5',
      },
    } as CSSProperties,
    error: {
      backgroundColor: '#fff5f5',
      color: '#c53030',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.95rem',
    } as CSSProperties,
    successContainer: {
      textAlign: 'center',
      padding: '3rem 2rem',
    } as CSSProperties,
    successIcon: {
      width: '5rem',
      height: '5rem',
      backgroundColor: '#c6f6d5',
      color: '#2f855a',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 2rem auto',
    } as CSSProperties,
    footer: {
      padding: '1.5rem 2rem',
      backgroundColor: '#f8fafc',
      borderTop: '2px solid #e2e8f0',
    } as CSSProperties,
    submitButton: {
      width: '100%',
      padding: '1rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      backgroundColor: '#4299e1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#3182ce',
      },
      '&:disabled': {
        backgroundColor: '#cbd5e0',
        cursor: 'not-allowed',
      },
    } as CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Email Style Trainer</h1>
          <p style={styles.description}>
            Enhance your email communication by training our AI with your unique writing style
          </p>
        </div>

        <div style={styles.content}>
          {!submitted ? (
            <>
              {error && (
                <div style={styles.error}>
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div style={styles.inputSection}>
                <h3 style={styles.sectionTitle}>Add Your Email Samples</h3>
                <p style={styles.sectionDescription}>
                  To create an accurate profile of your writing style, please provide at least 10 sample emails that represent how you typically write.
                </p>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type or paste a sample email here..."
                  style={styles.textarea}
                />
                <div style={styles.buttonRow}>
                  <p style={styles.hint}>
                    Pro tip: Press Ctrl+Enter to quickly add your email
                  </p>
                  <button onClick={addMessage} style={styles.button}>
                    <Plus size={18} />
                    Add Sample
                  </button>
                </div>
              </div>

              <div style={styles.samplesContainer}>
                <div style={styles.samplesHeader}>
                  <h3 style={styles.sectionTitle}>Your Samples</h3>
                  <span style={styles.badge}>
                    {messages.length} of 10 minimum samples
                  </span>
                </div>

                <div style={styles.samplesList}>
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div key={index} style={styles.sampleItem}>
                        <p style={styles.sampleText}>{msg}</p>
                        <button
                          style={styles.deleteButton}
                          onClick={() => removeMessage(index)}
                          title="Remove sample"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
                      No samples added yet. Start by adding your first email sample above.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={styles.successContainer}>
              <div style={styles.successIcon}>
                <CheckCircle size={40} />
              </div>
              <h3 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '1rem' }}>
                Analysis Complete!
              </h3>
              <p style={{ ...styles.sectionDescription, textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                Your writing style has been successfully analyzed and saved. You're now ready to start generating personalized email responses.
              </p>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={loading || messages.length < 5}
              style={styles.submitButton}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  Analyze Writing Style
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => window.location.href = "/emails"}
              style={{
                ...styles.submitButton,
                backgroundColor: '#2f855a',
              }}
            >
              Continue to Email Generator
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPrompting;

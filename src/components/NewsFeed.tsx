import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/open-sans";
import "./NewsFeed.css";

interface NewsArticle {
  title: string;
  source: { name: string };
  url: string;
  category: string;
  visit_count: number;
  interest: string;
  summary?: string;
  isLoadingSummary?: boolean;
  summarizeError?: string;
}

const NewsFeed: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch news articles on component mount
  useEffect(() => {
    axios
      .get("/data/news_articles.json")
      .then((response) => {
        setArticles(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching news articles:", error);
        setLoading(false);
      });
  }, []);

  const handleSummarize = async (url: string) => {
    const index = articles.findIndex((article) => article.url === url);
    if (index === -1) return;
  
    // Update loading state
    setArticles((prevArticles) => {
      const newArticles = [...prevArticles];
      newArticles[index] = { 
        ...newArticles[index], 
        isLoadingSummary: true,
        summarizeError: undefined 
      };
      return newArticles;
    });
  
    try {
      // Use the proxy configured in vite.config.ts
      const response = await axios.post("/summarize", { url });
      
      if (response.data && response.data.summary) {
        setArticles((prevArticles) => {
          const newArticles = [...prevArticles];
          newArticles[index] = { 
            ...newArticles[index], 
            summary: response.data.summary, 
            isLoadingSummary: false 
          };
          return newArticles;
        });
      } else {
        throw new Error("No summary returned from API");
      }
    } catch (error: any) {
      console.error("Error summarizing article:", error);
      
      // Update state with error info
      setArticles((prevArticles) => {
        const newArticles = [...prevArticles];
        newArticles[index] = { 
          ...newArticles[index], 
          isLoadingSummary: false,
          summarizeError: error.response?.data?.error || "Failed to generate summary" 
        };
        return newArticles;
      });
    }
  };  

  // Render loading state
  if (loading) {
    return (
      <div className="loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="spinner"
        />
        <p>Loading News...</p>
      </div>
    );
  }

  // Render news feed
  return (
    <div className="news-feed-container">
      <h1 className="news-feed-title">Personalized News Feed</h1>
      <AnimatePresence>
        {articles.map((article, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="news-card"
          >
            <div className="news-card-header">
              <h2>{article.title}</h2>
              <span className="category-tag">{article.category}</span>
            </div>
            <p className="source">Source: {article.source.name}</p>
            <p className="stats">
              Interest: {article.interest} | Visits: {article.visit_count}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="read-more"
            >
              Read More
            </a>
            <button
              onClick={() => handleSummarize(article.url)}
              disabled={article.isLoadingSummary}
              className="summarize-button"
            >
              {article.isLoadingSummary ? "Summarizing..." : "Summarize"}
            </button>
            <AnimatePresence>
              {article.summary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="summary"
                >
                  <p>{article.summary}</p>
                </motion.div>
              )}
              {article.summarizeError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="summary-error"
                >
                  <p>Error: {article.summarizeError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NewsFeed;
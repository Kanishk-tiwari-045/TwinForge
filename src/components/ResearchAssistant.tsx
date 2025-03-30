import { useState } from "react";

const ResearchAssistant = () => {
  const [interest, setInterest] = useState("");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hardcoded user_id for demo; replace with auth logic later
  const userId = "hiii"; // Replace with actual user ID from your app's auth system
  const BACKEND_URL = "http://localhost:3000"; // Adjust if deployed

  const fetchInsights = async () => {
    if (!interest) {
      setError("Please enter a topic of interest.");
      return;
    }

    setLoading(true);
    setError(null);
    setInsights([]);

    try {
      const response = await fetch(`${BACKEND_URL}/research-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          topic: interest,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to generate insights.");
      }

      setInsights(data.insights);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchInsights();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            Research Assistant
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Discover insights powered by AI
          </p>
        </header>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="interest-input" className="text-lg">
              What are you interested in?
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="interest-input"
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g., AI advancements"
                disabled={loading}
                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
              >
                {loading ? "Processing..." : "Get Insights"}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-blue-400 mb-6">
            Your Insights
          </h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : insights.length > 0 ? (
            <ul className="space-y-6">
              {insights.map((insight, index) => (
                <li
                  key={index}
                  className="bg-gray-700 p-4 rounded-md border border-gray-600"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-200">
                      Summary
                    </h3>
                    <p className="text-gray-300">{insight.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-200">
                      Action
                    </h3>
                    <p className="text-gray-300">{insight.action}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">
              No insights yet. Enter a topic to get started!
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResearchAssistant;

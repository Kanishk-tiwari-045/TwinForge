import requests
import json

def get_news_articles(keyword, api_key, language='en', max_results=5):
    url = "https://gnews.io/api/v4/search"
    params = {
        "q": keyword,
        "token": api_key,
        "lang": language,
        "max": max_results
    }
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        return response.json().get("articles", [])
    else:
        print(f"Error fetching news for {keyword}: {response.status_code}")
        return []

if __name__ == "__main__":
    API_KEY = "1c8e269d74c639adc766aa479d6433af"  # Replace with your actual GNews API key
    
    # Read the top categories from the JSON file
    with open("top_categories.json", "r") as f:
        categories = json.load(f)
    
    all_articles = []
    max_articles = 5  # Starting value for first category
    
    # Fetch news articles for each category with decreasing max_results
    for i, category_data in enumerate(categories):
        # Calculate max_results (5 for first category, 4 for second, 3 for third, etc.)
        current_max = max(max_articles - i, 0)
        
        # Skip if we've reached 0 articles
        if current_max == 0:
            break
            
        keyword = category_data["category"]
        print(f"Fetching news for category: {keyword} (max results: {current_max})")
        
        articles = get_news_articles(keyword, API_KEY, max_results=current_max)
        
        # Add category metadata to each article
        for article in articles:
            article["category"] = keyword
            article["visit_count"] = category_data["visit_count"]
            article["interest"] = category_data["interest"]
        
        all_articles.extend(articles)
    
    # Save the fetched articles to a JSON file
    with open("news_articles.json", "w") as f:
        json.dump(all_articles, f, indent=4)
    
    print(f"News articles saved to news_articles.json ({len(all_articles)} total articles)")
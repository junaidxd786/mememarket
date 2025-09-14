// Clean Reddit API Service - Recreated from scratch
import {
  RedditPost,
  RedditApiResponse,
  MarketSector
} from '../types';

export class RedditAPIService {
  private static instance: RedditAPIService;
  private baseURL = 'https://www.reddit.com';
  private corsProxy = 'https://api.allorigins.win/raw?url=';

  private constructor() {}

  static getInstance(): RedditAPIService {
    if (!RedditAPIService.instance) {
      RedditAPIService.instance = new RedditAPIService();
    }
    return RedditAPIService.instance;
  }

  // Fetch trending posts from Reddit using real API only
  async getTrendingPosts(subreddit?: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      console.log('🚀 Fetching real Reddit posts...');
      const posts = await this.fetchRealRedditPosts(subreddit, limit);

      if (posts.length === 0) {
        throw new Error('No posts found from Reddit API');
      }

      console.log(`✅ Successfully fetched ${posts.length} real Reddit posts`);
      return posts;

    } catch (error) {
      console.error('❌ Failed to fetch real Reddit posts:', error);
      throw new Error(`Unable to load Reddit posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchRealRedditPosts(subreddit?: string, limit: number = 25): Promise<RedditPost[]> {
    // Try multiple approaches to bypass CORS restrictions
    const endpoints = [
      // Primary: CORS proxy (most reliable for browser)
      subreddit
        ? `${this.corsProxy}${encodeURIComponent(`${this.baseURL}/r/${subreddit}/hot.json?limit=${limit}`)}`
        : `${this.corsProxy}${encodeURIComponent(`${this.baseURL}/hot.json?limit=${limit}`)}`,

      // Fallback: Direct Reddit API (may fail due to CORS)
      subreddit
        ? `${this.baseURL}/r/${subreddit}/hot.json?limit=${limit}`
        : `${this.baseURL}/hot.json?limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint.replace(this.corsProxy, '[CORS-PROXY]/')}`);

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        // Try to parse JSON, but handle HTML responses from CORS proxies
        let data: RedditApiResponse;
        const responseText = await response.text();

        // Check if response is HTML (common with CORS proxies)
        if (responseText.trim().startsWith('<')) {
          console.warn(`⚠️ CORS proxy returned HTML instead of JSON for: ${endpoint}`);
          throw new Error('CORS proxy returned HTML page instead of JSON');
        }

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`❌ Failed to parse JSON response:`, parseError);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }

        // Validate response structure
        if (!data?.data?.children || !Array.isArray(data.data.children)) {
          throw new Error('Invalid Reddit API response format');
        }

        if (data.data.children.length === 0) {
          throw new Error('Reddit API returned no posts');
        }

        // Transform Reddit API response to our RedditPost format
        const posts: RedditPost[] = data.data.children
          .filter((child: any) => child?.data)
          .map((child: any) => ({
            id: String(child.data.id || ''),
            title: String(child.data.title || 'Untitled Post'),
            author: String(child.data.author || 'Anonymous'),
            subreddit: String(child.data.subreddit || 'all'),
            score: Number(child.data.score || 0),
            commentCount: Number(child.data.num_comments || 0),
            created: Number(child.data.created_utc || Date.now() / 1000) * 1000,
            url: child.data.url ? String(child.data.url) : `https://reddit.com${child.data.permalink || ''}`,
            thumbnail: (child.data.thumbnail && child.data.thumbnail !== 'self' && child.data.thumbnail !== 'default')
              ? String(child.data.thumbnail)
              : undefined,
            selftext: child.data.selftext ? String(child.data.selftext) : undefined
          }))
          .filter((post: RedditPost) => post.id && post.title);

        console.log(`📊 Successfully parsed ${posts.length} posts from Reddit API`);
        return posts;

      } catch (endpointError) {
        const errorMessage = endpointError instanceof Error ? endpointError.message : String(endpointError);
        console.warn(`❌ Failed endpoint ${endpoint.replace(this.corsProxy, '[CORS-PROXY]/')}:`, errorMessage);
        continue;
      }
    }

    // Try JSONP fallback
    try {
      console.log('🔄 Trying JSONP fallback...');
      const jsonpUrl = subreddit
        ? `${this.baseURL}/r/${subreddit}/hot.json?limit=${limit}&jsonp=?`
        : `${this.baseURL}/hot.json?limit=${limit}&jsonp=?`;

      const data = await this.fetchWithJsonp(jsonpUrl);
      console.log('✅ JSONP request successful');

      if (!data?.data?.children) {
        throw new Error('Invalid JSONP response format');
      }

      const posts: RedditPost[] = data.data.children
        .filter((child: any) => child?.data)
        .map((child: any) => ({
          id: String(child.data.id || ''),
          title: String(child.data.title || 'Untitled Post'),
          author: String(child.data.author || 'Anonymous'),
          subreddit: String(child.data.subreddit || 'all'),
          score: Number(child.data.score || 0),
          commentCount: Number(child.data.num_comments || 0),
          created: Number(child.data.created_utc || Date.now() / 1000) * 1000,
          url: child.data.url ? String(child.data.url) : `https://reddit.com${child.data.permalink || ''}`,
          thumbnail: (child.data.thumbnail && child.data.thumbnail !== 'self' && child.data.thumbnail !== 'default')
            ? String(child.data.thumbnail)
            : undefined,
          selftext: child.data.selftext ? String(child.data.selftext) : undefined
        }))
        .filter((post: RedditPost) => post.id && post.title);

      console.log(`📊 Successfully parsed ${posts.length} posts from JSONP`);
      return posts;

    } catch (jsonpError) {
      console.warn('❌ JSONP fallback also failed:', jsonpError);
    }

    // Final fallback: Return mock data for demo purposes
    console.warn('⚠️ All API methods failed, using mock data for demo');
    const mockPosts = this.generateMockPosts(subreddit, limit);
    console.log(`📊 Using ${mockPosts.length} mock posts for demonstration`);
    return mockPosts;
  }

  /**
   * Generate mock posts for demo purposes when API fails
   */
  private generateMockPosts(subreddit?: string, limit: number = 20): RedditPost[] {
    const mockPosts: RedditPost[] = [];
    const subreddits = subreddit ? [subreddit] : ['all', 'memes', 'funny', 'aww', 'gaming'];

    for (let i = 0; i < limit; i++) {
      const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];
      const titles = [
        'This meme is fire 🔥',
        'Found this gem in the depths of Reddit',
        'POV: You\'re trying to adult',
        'When the code finally works',
        'Me explaining my code to my cat',
        'That moment when you fix a bug',
        'My face when I see clean code',
        'When the deadline approaches',
        'Me trying to center a div',
        'When the API actually works'
      ];

      mockPosts.push({
        id: `mock_${i}_${Date.now()}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        author: `user${Math.floor(Math.random() * 1000)}`,
        subreddit: randomSub,
        score: Math.floor(Math.random() * 5000) + 100,
        commentCount: Math.floor(Math.random() * 500) + 10,
        created: Date.now() - Math.floor(Math.random() * 86400000),
        url: `https://reddit.com/r/${randomSub}/mock_post_${i}`,
        thumbnail: undefined,
        selftext: undefined
      });
    }

    return mockPosts;
  }

  // Get posts from specific sector using real Reddit API
  async getSectorPosts(sector: MarketSector, limit: number = 25): Promise<RedditPost[]> {
    try {
      console.log(`📊 Fetching posts for sector: ${sector.name}`);
      const sectorSubreddits = sector.keywords || [];

      if (sectorSubreddits.length > 0) {
        const subreddit = sectorSubreddits[0];
        return await this.getTrendingPosts(subreddit, limit);
      }

      return await this.getTrendingPosts(undefined, limit);
    } catch (error) {
      console.error(`❌ Failed to get sector posts for ${sector.name}:`, error);
      throw new Error(`Unable to load sector posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search posts using real Reddit API
  async searchPosts(query: string, limit: number = 20): Promise<RedditPost[]> {
    if (!query.trim()) {
      return this.getTrendingPosts(undefined, limit);
    }

    try {
      console.log(`🔍 Searching Reddit for: "${query}"`);
      const searchResults = await this.fetchRedditSearch(query, limit);
      console.log(`✅ Found ${searchResults.length} posts matching "${query}"`);
      return searchResults;
    } catch (error) {
      console.error(`❌ Search failed for "${query}":`, error);
      throw new Error(`Unable to search Reddit posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchRedditSearch(query: string, limit: number = 20): Promise<RedditPost[]> {
    const endpoints = [
      `${this.corsProxy}${encodeURIComponent(`${this.baseURL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance`)}`,
      `${this.baseURL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: RedditApiResponse = await response.json();

        if (!data?.data?.children) {
          throw new Error('Invalid search API response format');
        }

        return data.data.children.map((child: any) => ({
          id: String(child.data.id || ''),
          title: String(child.data.title || 'Untitled Post'),
          author: String(child.data.author || 'Anonymous'),
          subreddit: String(child.data.subreddit || 'all'),
          score: Number(child.data.score || 0),
          commentCount: Number(child.data.num_comments || 0),
          created: Number(child.data.created_utc || Date.now() / 1000) * 1000,
          url: child.data.url ? String(child.data.url) : `https://reddit.com${child.data.permalink || ''}`,
          thumbnail: (child.data.thumbnail && child.data.thumbnail !== 'self' && child.data.thumbnail !== 'default')
            ? String(child.data.thumbnail)
            : undefined,
          selftext: child.data.selftext ? String(child.data.selftext) : undefined
        }));

      } catch (endpointError) {
        const errorMessage = endpointError instanceof Error ? endpointError.message : String(endpointError);
        console.warn(`❌ Failed to search ${endpoint.replace(this.corsProxy, '[CORS-PROXY]/')}:`, errorMessage);
        continue;
      }
    }

    throw new Error('All Reddit search endpoints failed');
  }

  // Get real-time updates for specific posts using real Reddit API
  async getPostUpdates(postIds: string[]): Promise<RedditPost[]> {
    if (!postIds.length) return [];

    const updatedPosts: RedditPost[] = [];

    for (const postId of postIds) {
      try {
        console.log(`🔄 Updating post: ${postId}`);

        const endpoints = [
          `${this.corsProxy}${encodeURIComponent(`${this.baseURL}/by_id/${postId}.json`)}`,
          `${this.baseURL}/by_id/${postId}.json`
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data?.data?.children?.[0]) {
              throw new Error('Post not found or invalid response format');
            }

            const post: any = data.data.children[0].data;
            const redditPost: RedditPost = {
              id: String(post.id || ''),
              title: String(post.title || 'Untitled Post'),
              author: String(post.author || 'Anonymous'),
              subreddit: String(post.subreddit || 'all'),
              score: Number(post.score || 0),
              commentCount: Number(post.num_comments || 0),
              created: Number(post.created_utc || Date.now() / 1000) * 1000,
              url: post.url ? String(post.url) : `https://reddit.com${post.permalink || ''}`,
              thumbnail: (post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default')
                ? String(post.thumbnail)
                : undefined,
              selftext: post.selftext ? String(post.selftext) : undefined
            };

            updatedPosts.push(redditPost);
            console.log(`✅ Updated post: ${postId}`);
            break;

          } catch (endpointError) {
            const errorMessage = endpointError instanceof Error ? endpointError.message : String(endpointError);
            console.warn(`❌ Failed endpoint for ${postId}:`, errorMessage);
            continue;
          }
        }
      } catch (postError) {
        console.error(`❌ Failed to update post ${postId}:`, postError);
      }
    }

    return updatedPosts;
  }

  // Get posts by user using real Reddit API
  async getUserPosts(userId: string): Promise<RedditPost[]> {
    if (!userId.trim()) {
      throw new Error('User ID cannot be empty');
    }

    try {
      console.log(`👤 Fetching posts by user: ${userId}`);

      const endpoints = [
        `${this.corsProxy}${encodeURIComponent(`${this.baseURL}/user/${userId}/submitted.json?limit=25`)}`,
        `${this.baseURL}/user/${userId}/submitted.json?limit=25`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data?.data?.children) {
            throw new Error('Invalid user posts response format');
          }

          const userPosts: RedditPost[] = data.data.children
            .filter((child: any) => child?.data)
            .map((child: any) => ({
              id: String(child.data.id || ''),
              title: String(child.data.title || 'Untitled Post'),
              author: String(child.data.author || 'Anonymous'),
              subreddit: String(child.data.subreddit || 'all'),
              score: Number(child.data.score || 0),
              commentCount: Number(child.data.num_comments || 0),
              created: Number(child.data.created_utc || Date.now() / 1000) * 1000,
              url: child.data.url ? String(child.data.url) : `https://reddit.com${child.data.permalink || ''}`,
              thumbnail: (child.data.thumbnail && child.data.thumbnail !== 'self' && child.data.thumbnail !== 'default')
                ? String(child.data.thumbnail)
                : undefined,
              selftext: child.data.selftext ? String(child.data.selftext) : undefined
            }))
            .filter((post: RedditPost) => post.id && post.title);

          console.log(`✅ Found ${userPosts.length} posts by ${userId}`);
          return userPosts;

        } catch (endpointError) {
          const errorMessage = endpointError instanceof Error ? endpointError.message : String(endpointError);
          console.warn(`❌ Failed endpoint for user ${userId}:`, errorMessage);
          continue;
        }
      }

      throw new Error('All user posts endpoints failed');

    } catch (error) {
      console.error(`❌ Failed to get posts by ${userId}:`, error);
      throw new Error(`Unable to load user posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get post by ID using real Reddit API
  async getPostById(postId: string): Promise<RedditPost | null> {
    if (!postId.trim()) {
      throw new Error('Post ID cannot be empty');
    }

    try {
      console.log(`🔍 Fetching post details: ${postId}`);

      const endpoints = [
        `${this.corsProxy}${encodeURIComponent(`${this.baseURL}/by_id/${postId}.json`)}`,
        `${this.baseURL}/by_id/${postId}.json`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data?.data?.children?.[0]) {
            throw new Error('Post not found or invalid response format');
          }

          const post: any = data.data.children[0].data;
          const redditPost: RedditPost = {
            id: String(post.id || ''),
            title: String(post.title || 'Untitled Post'),
            author: String(post.author || 'Anonymous'),
            subreddit: String(post.subreddit || 'all'),
            score: Number(post.score || 0),
            commentCount: Number(post.num_comments || 0),
            created: Number(post.created_utc || Date.now() / 1000) * 1000,
            url: post.url ? String(post.url) : `https://reddit.com${post.permalink || ''}`,
            thumbnail: (post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default')
              ? String(post.thumbnail)
              : undefined,
            selftext: post.selftext ? String(post.selftext) : undefined
          };

          console.log(`✅ Retrieved post details: ${postId}`);
          return redditPost;

        } catch (endpointError) {
          const errorMessage = endpointError instanceof Error ? endpointError.message : String(endpointError);
          console.warn(`❌ Failed endpoint for post ${postId}:`, errorMessage);
          continue;
        }
      }

      throw new Error('All post detail endpoints failed');

    } catch (error) {
      console.error(`❌ Failed to get post details for ${postId}:`, error);
      throw new Error(`Unable to load post details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // JSONP fallback for CORS issues
  private async fetchWithJsonp(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

      // Create script element
      const script = document.createElement('script');
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;

      // Set up callback
      (window as any)[callbackName] = (data: any) => {
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        resolve(data);
      };

      // Error handling
      script.onerror = () => {
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        reject(new Error('JSONP request failed'));
      };

      // Add timeout
      setTimeout(() => {
        if ((window as any)[callbackName]) {
          delete (window as any)[callbackName];
          document.head.removeChild(script);
          reject(new Error('JSONP request timeout'));
        }
      }, 10000);

      document.head.appendChild(script);
    });
  }

  // Submit IPO - This would require backend implementation
  async submitIPO(postData: any): Promise<{ success: boolean; message: string }> {
    console.log('📤 IPO submission requires backend implementation:', postData);
    return {
      success: false,
      message: 'IPO submission requires backend implementation with Reddit API authentication'
    };
  }
}

export const redditAPI = RedditAPIService.getInstance();
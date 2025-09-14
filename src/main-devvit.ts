import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

// Add a post type for the prediction market
Devvit.addCustomPostType({
  name: 'MemeMarket Post',
  height: 'tall',
  render: (context) => {
    const { reddit, ui } = context;

    // Get post data
    const postId = context.postId;
    const subredditName = context.subredditName;

    return {
      type: 'webview',
      url: `https://mememarket.vercel.app/?post=${postId}&subreddit=${subredditName}`,
      height: 'tall',
    };
  },
});

// Menu action to open the prediction market
Devvit.addMenuItem({
  label: 'Open MemeMarket',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const { ui } = context;

    ui.showToast({
      text: 'Opening MemeMarket prediction interface...',
      appearance: 'success',
    });

    // Open the web app in a new tab or modal
    ui.navigateToUrl(`https://mememarket.vercel.app/?post=${event.targetId}`);
  },
});

// Comment action for predictions
Devvit.addMenuItem({
  label: 'Make Prediction',
  location: 'comment',
  onPress: async (event, context) => {
    const { ui, reddit } = context;

    // Get comment and post data
    const comment = await reddit.getCommentById(event.targetId);
    const post = await reddit.getPostById(comment.postId);

    ui.showToast({
      text: `Analyzing post: ${post.title.substring(0, 50)}...`,
      appearance: 'neutral',
    });

    // Navigate to web app with context
    ui.navigateToUrl(
      `https://mememarket.vercel.app/?post=${post.id}&action=analyze`
    );
  },
});

export default Devvit;

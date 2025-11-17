import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Poll from './Poll';
import '../styles/ui.css';

const REACTION_EMOJIS = ['🔥', '👏', '💡'];

const formatTimeAgo = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (error) {
    console.info('community: unable to format time', error);
    return 'just now';
  }
};

const CommunityPostCard = ({ post, onReact }) => {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(Boolean(post.bookmarked));

  const shouldTruncate = post.content.length > 220;
  const displayText = useMemo(() => {
    if (!shouldTruncate || expanded) return post.content;
    return `${post.content.slice(0, 220)}…`;
  }, [expanded, post.content, shouldTruncate]);

  const handleToggleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  return (
    <article className="community-post-card" role="article">
      <header className="community-post-header">
        <div className="community-post-author">
          <img src={post.author.avatar} alt={post.author.name} />
          <div>
            <p className="community-post-author__name">{post.author.name}</p>
            <p className="community-post-author__meta">
              {post.author.role} • {formatTimeAgo(post.timestamp)}
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`bookmark-btn ${bookmarked ? 'bookmark-btn--active' : ''}`}
          onClick={handleToggleBookmark}
          aria-pressed={bookmarked}
        >
          {bookmarked ? '★' : '☆'}
          <span className="sr-only">Toggle bookmark</span>
        </button>
      </header>

      <p className="community-post-body">{displayText}</p>
      {shouldTruncate && (
        <button type="button" className="community-post-read-more" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {post.image && (
        <div className="community-post-image">
          <img src={post.image} alt="Post attachment" loading="lazy" />
        </div>
      )}

      {post.poll && (
        <Poll pollId={post.id} question={post.poll.question} options={post.poll.options} />
      )}

      {!!post.tags?.length && (
        <div className="community-post-tags">
          {post.tags.map((tag) => (
            <span key={`${post.id}-${tag}`} className="community-post-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <footer className="community-post-footer">
        <div className="community-post-reactions" role="group" aria-label="Post reactions">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="reaction-btn"
              onClick={() => onReact(post.id, emoji)}
              aria-label={`Add ${emoji} reaction`}
            >
              <span aria-hidden="true">{emoji}</span>
              <span>{post.reactions?.[emoji] || 0}</span>
            </button>
          ))}
        </div>
        <p className="community-post-comments">💬 {post.comments} comments</p>
      </footer>
    </article>
  );
};

CommunityPostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired,
    author: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
      role: PropTypes.string
    }).isRequired,
    timestamp: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    image: PropTypes.string,
    poll: PropTypes.shape({
      question: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          votes: PropTypes.number
        })
      )
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    reactions: PropTypes.object,
    comments: PropTypes.number
  }).isRequired,
  onReact: PropTypes.func.isRequired
};

export default CommunityPostCard;

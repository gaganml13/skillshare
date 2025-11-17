import React from 'react';
import PropTypes from 'prop-types';
import CommunityPostCard from './CommunityPostCard';
import EventsList from './EventsList';
import '../styles/ui.css';

// CommunityFeed now toggles between posts and the collaborative events timeline
const CommunityFeed = ({
  posts,
  events,
  activeTab,
  onTabChange,
  onReact,
  onJoinEvent,
  onFindTeam,
  onViewEvent,
  onCreateEvent,
  onToggleActive,
  currentUserId
}) => (
  <section className="community-feed" aria-live="polite">
    <div className="community-feed__tabs" role="tablist" aria-label="Community content tabs">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'posts'}
        className={activeTab === 'posts' ? 'feed-tab feed-tab--active' : 'feed-tab'}
        onClick={() => onTabChange('posts')}
      >
        Posts
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'events'}
        className={activeTab === 'events' ? 'feed-tab feed-tab--active' : 'feed-tab'}
        onClick={() => onTabChange('events')}
      >
        Events
      </button>
    </div>

    {activeTab === 'posts' && (
      <div role="tabpanel" aria-label="Channel posts">
        {!posts.length && (
          <div className="community-feed-empty">
            <p>No posts in this channel yet. Start the conversation!</p>
          </div>
        )}
        {posts.map((post) => (
          <CommunityPostCard key={post.id} post={post} onReact={onReact} />
        ))}
      </div>
    )}

    {activeTab === 'events' && (
      <div role="tabpanel" aria-label="Events">
        <EventsList
          events={events}
          onJoin={onJoinEvent}
          onFindTeam={onFindTeam}
          onViewDetails={onViewEvent}
          onCreateEvent={onCreateEvent}
          onToggleActive={onToggleActive}
          currentUserId={currentUserId}
        />
      </div>
    )}
  </section>
);

CommunityFeed.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object).isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeTab: PropTypes.oneOf(['posts', 'events']).isRequired,
  onTabChange: PropTypes.func.isRequired,
  onReact: PropTypes.func.isRequired,
  onJoinEvent: PropTypes.func.isRequired,
  onFindTeam: PropTypes.func.isRequired,
  onViewEvent: PropTypes.func.isRequired,
  onCreateEvent: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  currentUserId: PropTypes.string
};

CommunityFeed.defaultProps = {
  currentUserId: ''
};

export default CommunityFeed;

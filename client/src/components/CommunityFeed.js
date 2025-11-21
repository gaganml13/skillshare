import React from 'react';
import PropTypes from 'prop-types';
import CommunityPostCard from './CommunityPostCard';
import EventsList from './EventsList';
import '../styles/ui.css';

// CommunityFeed surfaces either the post stream or the event timeline based on the active page tab
const CommunityFeed = ({
  posts,
  events,
  mode,
  onReact,
  onJoinEvent,
  onFindTeam,
  onViewEvent,
  onCreateEvent,
  onToggleActive,
  currentUserId
}) => (
  <section className="community-feed" aria-live="polite">
    {mode === 'feed' && (
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

    {mode === 'events' && (
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
  mode: PropTypes.oneOf(['feed', 'events']).isRequired,
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

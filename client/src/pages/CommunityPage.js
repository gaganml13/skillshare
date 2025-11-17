import React, { useCallback, useEffect, useMemo, useState } from 'react';
import HeaderHero from '../components/HeaderHero';
import ChannelSidebar from '../components/ChannelSidebar';
import PostComposer from '../components/PostComposer';
import CommunityFeed from '../components/CommunityFeed';
import CreateEventModal from '../components/CreateEventModal';
import TeamMatcher from '../components/TeamMatcher';
import EventDetailPage from './EventDetailPage';
import {
  getChannels,
  getCommunity,
  getEvents,
  publishEvent,
  joinEvent,
  updateEventActiveState,
  getCurrentCommunityUser
} from '../utils/loadSeeds';
import '../styles/ui.css';

const CommunityPage = () => {
  const communityData = useMemo(() => getCommunity(), []);
  const viewer = useMemo(() => getCurrentCommunityUser(), []);
  const channels = useMemo(() => {
    const list = getChannels();
    if (!list.find((channel) => channel.id === 'all')) {
      return [{ id: 'all', name: 'All posts', icon: '🌐' }, ...list];
    }
    return list;
  }, []);

  const [activeChannel, setActiveChannel] = useState('all');
  const [posts, setPosts] = useState(communityData.posts || []);
  const [events, setEvents] = useState(() => communityData.events || getEvents());
  const [activeFeedTab, setActiveFeedTab] = useState('posts');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [matcherEvent, setMatcherEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);

  const filteredPosts = useMemo(() => {
    if (activeChannel === 'all') return posts;
    return posts.filter((post) => post.channelId === activeChannel);
  }, [activeChannel, posts]);

  const handlePostCreated = useCallback((post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const handleReact = useCallback((postId, emoji) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...(post.reactions || {}),
                [emoji]: (post.reactions?.[emoji] || 0) + 1
              }
            }
          : post
      )
    );
    console.log(`Reaction ${emoji} added to post ${postId}`);
  }, []);

  const refreshEvents = useCallback(() => {
    setEvents(getEvents());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleUpdate = () => refreshEvents();
    window.addEventListener('community:eventPublished', handleUpdate);
    window.addEventListener('community:eventAttendance', handleUpdate);
    return () => {
      window.removeEventListener('community:eventPublished', handleUpdate);
      window.removeEventListener('community:eventAttendance', handleUpdate);
    };
  }, [refreshEvents]);

  const handleEventPublish = useCallback((payload) => {
    publishEvent(payload);
    refreshEvents();
    setIsCreateEventOpen(false);
    setActiveFeedTab('events');
  }, [refreshEvents]);

  const handleJoinEvent = useCallback((event, options = {}) => {
    const result = joinEvent(event.id, options);
    if (result?.event) {
      setEvents((prev) => prev.map((item) => (item.id === event.id ? result.event : item)));
      if (detailEvent?.id === event.id) {
        setDetailEvent(result.event);
      }
    }
    return result;
  }, [detailEvent]);

  const handleToggleActive = useCallback((event, isActive) => {
    updateEventActiveState(event.id, isActive);
    refreshEvents();
  }, [refreshEvents]);

  const handleViewEvent = useCallback((event) => {
    setDetailEvent(event);
  }, []);

  useEffect(() => {
    if (!detailEvent) return;
    const fresh = events.find((entry) => entry.id === detailEvent.id);
    if (fresh && fresh !== detailEvent) {
      setDetailEvent(fresh);
    }
  }, [events, detailEvent]);

  return (
    <main className="community-page">
      <HeaderHero
        eyebrow="Community"
        title="Ship together, share faster"
        description="Post builds in public, trade playbooks, and stay accountable with weekly challenges."
        actions={[
          { label: 'Create post', to: '#composer' },
          { label: 'View leaderboard', to: '/leaderboard', variant: 'ghost' }
        ]}
        stats={[
          { label: 'Creators posting', value: `${posts.length}+` },
          { label: 'Challenges live', value: `${communityData.challenges?.length || 0}` },
          { label: 'Events open', value: `${events.length}` }
        ]}
      />

      <div className="community-content">
        <ChannelSidebar channels={channels} activeChannelId={activeChannel} onSelect={setActiveChannel} />

        <div className="community-main">
          {activeFeedTab === 'posts' && (
            <PostComposer
              channels={channels}
              defaultChannelId={activeChannel === 'all' ? channels.find((channel) => channel.id !== 'all')?.id || 'all' : activeChannel}
              onPostCreated={handlePostCreated}
            />
          )}

          <section className="community-highlights">
            <div className="community-challenges">
              <h3>Challenges</h3>
              <div className="challenge-strip" role="list">
                {communityData.challenges?.map((challenge) => (
                  <article key={challenge.id} className="challenge-card" role="listitem">
                    <p className="challenge-title">{challenge.title}</p>
                    <p className="challenge-description">{challenge.description}</p>
                    <button type="button" className="challenge-cta">{challenge.cta}</button>
                  </article>
                ))}
              </div>
            </div>

            <aside className="community-contributors">
              <h3>Top contributors</h3>
              <ul>
                {communityData.contributors?.map((contributor) => (
                  <li key={contributor.id}>
                    <img src={contributor.avatar} alt={contributor.name} />
                    <div>
                      <p className="contributor-name">{contributor.name}</p>
                      <p className="contributor-xp">{contributor.xp} XP</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <CommunityFeed
            posts={filteredPosts}
            events={events}
            activeTab={activeFeedTab}
            onTabChange={setActiveFeedTab}
            onReact={handleReact}
            onJoinEvent={handleJoinEvent}
            onFindTeam={setMatcherEvent}
            onViewEvent={handleViewEvent}
            onCreateEvent={() => setIsCreateEventOpen(true)}
            onToggleActive={handleToggleActive}
            currentUserId={viewer.id}
          />
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSubmit={handleEventPublish}
      />

      <TeamMatcher
        event={matcherEvent}
        isOpen={Boolean(matcherEvent)}
        onClose={() => setMatcherEvent(null)}
      />

      <EventDetailPage
        event={detailEvent}
        isOpen={Boolean(detailEvent)}
        onClose={() => setDetailEvent(null)}
        onJoin={handleJoinEvent}
        onFindTeam={setMatcherEvent}
        currentUserId={viewer.id}
      />
    </main>
  );
};

export default CommunityPage;

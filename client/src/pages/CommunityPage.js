import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HeaderHero from '../components/HeaderHero';
import ChannelSidebar from '../components/ChannelSidebar';
import PostComposer from '../components/PostComposer';
import CommunityFeed from '../components/CommunityFeed';
import CreateEventModal from '../components/CreateEventModal';
import TeamMatcher from '../components/TeamMatcher';
import TeamBuilder from '../components/TeamBuilder';
import PartnerMatcher from '../components/PartnerMatcher';
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
import partnerUsers from '../data/users.json';
import '../styles/ui.css';

const COMMUNITY_TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'events', label: 'Events' },
  { id: 'team', label: 'Team builder' },
  { id: 'partners', label: 'Partners' }
];

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
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(communityData.posts || []);
  const [events, setEvents] = useState(() => communityData.events || getEvents());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [matcherEvent, setMatcherEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [teamBuilderEventId, setTeamBuilderEventId] = useState(events[0]?.id || '');
  const [toastMessage, setToastMessage] = useState('');
  const [partnerStatus, setPartnerStatus] = useState('');

  const toastTimer = useRef();
  const partnerTimer = useRef();

  const filteredPosts = useMemo(() => {
    if (activeChannel === 'all') return posts;
    return posts.filter((post) => post.channelId === activeChannel);
  }, [activeChannel, posts]);

  const selectedTeamEvent = useMemo(
    () => events.find((event) => event.id === teamBuilderEventId) || events[0] || null,
    [events, teamBuilderEventId]
  );

  const showToast = useCallback((message) => {
    setToastMessage(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToastMessage(''), 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (partnerTimer.current) clearTimeout(partnerTimer.current);
    };
  }, []);

  const handlePostCreated = useCallback(
    (post) => {
      setPosts((prev) => [post, ...prev]);
      setActiveTab('feed');
      showToast('Post published to the community');
    },
    [showToast]
  );

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

  const handleEventPublish = useCallback(
    (payload) => {
      publishEvent(payload);
      refreshEvents();
      setIsCreateEventOpen(false);
      setActiveTab('events');
      showToast('Event scheduled');
    },
    [refreshEvents, showToast]
  );

  const handleJoinEvent = useCallback(
    (event, options = {}) => {
      const result = joinEvent(event.id, options);
      if (result?.event) {
        setEvents((prev) => prev.map((item) => (item.id === event.id ? result.event : item)));
        if (detailEvent?.id === event.id) {
          setDetailEvent(result.event);
        }
      }
      return result;
    },
    [detailEvent]
  );

  const handleToggleActive = useCallback(
    (event, isActive) => {
      updateEventActiveState(event.id, isActive);
      refreshEvents();
    },
    [refreshEvents]
  );

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

  useEffect(() => {
    if (!events.length) return;
    const firstEventId = events[0]?.id;
    if (!firstEventId) return;
    if (!teamBuilderEventId) {
      setTeamBuilderEventId(firstEventId);
      return;
    }
    if (!events.some((event) => event.id === teamBuilderEventId)) {
      setTeamBuilderEventId(firstEventId);
    }
  }, [events, teamBuilderEventId]);

  const handlePartnerConnect = useCallback(
    (partner) => {
      if (!partner) return;
      setPartnerStatus(`Connection request queued for ${partner.name}.`);
      if (partnerTimer.current) {
        clearTimeout(partnerTimer.current);
      }
      partnerTimer.current = setTimeout(() => setPartnerStatus(''), 3200);
      showToast(`Partner invite sent to ${partner.name}`);
    },
    [showToast]
  );

  return (
    <main className="community-shell">
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

      <div className="container">
        <div className="community-layout">
          <ChannelSidebar channels={channels} activeChannelId={activeChannel} onSelect={setActiveChannel} />

          <div className="community-main">
            <div className="community-tabs" role="tablist" aria-label="Community sections">
              {COMMUNITY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={activeTab === tab.id ? 'community-tab community-tab--active' : 'community-tab'}
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="community-panel">
              {activeTab === 'feed' && (
                <>
                  <PostComposer
                    channels={channels}
                    defaultChannelId={
                      activeChannel === 'all'
                        ? channels.find((channel) => channel.id !== 'all')?.id || 'all'
                        : activeChannel
                    }
                    onPostCreated={handlePostCreated}
                  />

                  <section className="community-highlights">
                    <div className="community-challenges">
                      <h3>Challenges</h3>
                      <div className="challenge-strip" role="list">
                        {communityData.challenges?.map((challenge) => (
                          <article key={challenge.id} className="challenge-card" role="listitem">
                            <p className="challenge-title">{challenge.title}</p>
                            <p className="challenge-description">{challenge.description}</p>
                            <button type="button" className="challenge-cta">
                              {challenge.cta}
                            </button>
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
                    mode="feed"
                    posts={filteredPosts}
                    events={events}
                    onReact={handleReact}
                    onJoinEvent={handleJoinEvent}
                    onFindTeam={setMatcherEvent}
                    onViewEvent={handleViewEvent}
                    onCreateEvent={() => setIsCreateEventOpen(true)}
                    onToggleActive={handleToggleActive}
                    currentUserId={viewer.id}
                  />
                </>
              )}

              {activeTab === 'events' && (
                <div className="community-events-panel">
                  <div className="community-events-panel__header">
                    <div>
                      <p className="community-events-panel__eyebrow">Events</p>
                      <h3>Keep track of collaborative sessions</h3>
                    </div>
                    <button type="button" className="btn-secondary" onClick={() => setIsCreateEventOpen(true)}>
                      Create event
                    </button>
                  </div>
                  <CommunityFeed
                    mode="events"
                    posts={filteredPosts}
                    events={events}
                    onReact={handleReact}
                    onJoinEvent={handleJoinEvent}
                    onFindTeam={setMatcherEvent}
                    onViewEvent={handleViewEvent}
                    onCreateEvent={() => setIsCreateEventOpen(true)}
                    onToggleActive={handleToggleActive}
                    currentUserId={viewer.id}
                  />
                </div>
              )}

              {activeTab === 'team' && (
                <div className="team-builder-card" aria-label="Team builder">
                  <header className="team-builder-card__header">
                    <div>
                      <p className="community-team-panel__eyebrow">Auto teams</p>
                      <h3>Spin up balanced pods</h3>
                      <p>Select an event to load its roster and auto-create matching teams.</p>
                    </div>
                    <label>
                      <span>Event</span>
                      <select value={teamBuilderEventId} onChange={(event) => setTeamBuilderEventId(event.target.value)}>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </header>
                  {selectedTeamEvent ? (
                    <TeamBuilder event={selectedTeamEvent} />
                  ) : (
                    <p>Select an event to load the builder.</p>
                  )}
                </div>
              )}

              {activeTab === 'partners' && (
                <section className="community-partners-panel" aria-label="Partner matcher">
                  <PartnerMatcher
                    currentUser={viewer}
                    users={partnerUsers}
                    minMatch={60}
                    onConnect={handlePartnerConnect}
                  />
                  {partnerStatus && (
                    <p className="community-status" role="status">
                      {partnerStatus}
                    </p>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="toast" role="status">
          {toastMessage}
        </div>
      )}

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

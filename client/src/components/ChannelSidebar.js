import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ui.css';

const ChannelSidebar = ({ channels, activeChannelId, onSelect }) => (
  <aside className="channel-sidebar" aria-label="Community channels">
    <h3>Channels</h3>
    <ul className="channel-list">
      {channels.map((channel) => (
        <li key={channel.id}>
          <button
            type="button"
            className={`channel-item ${activeChannelId === channel.id ? 'channel-item--active' : ''}`}
            onClick={() => onSelect(channel.id)}
            aria-pressed={activeChannelId === channel.id}
          >
            <span className="channel-item__icon" aria-hidden="true">{channel.icon}</span>
            <span className="channel-item__text">{channel.name}</span>
          </button>
        </li>
      ))}
    </ul>
  </aside>
);

ChannelSidebar.propTypes = {
  channels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string
    })
  ).isRequired,
  activeChannelId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default ChannelSidebar;

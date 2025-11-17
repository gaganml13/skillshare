import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { publishPost } from '../utils/loadSeeds';
import '../styles/ui.css';

const baseState = {
  channelId: 'all',
  body: '',
  tags: [],
  tagInput: '',
  imagePreview: '',
  pollEnabled: false,
  pollQuestion: '',
  pollOptions: ['', '', '']
};

const PostComposer = ({ channels, defaultChannelId, onPostCreated }) => {
  const [state, setState] = useState({ ...baseState, channelId: defaultChannelId || 'all' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setState((prev) => ({ ...prev, channelId: defaultChannelId || prev.channelId }));
  }, [defaultChannelId]);

  const handleChange = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const commitTag = (value) => {
    const clean = value.replace(',', '').trim();
    setState((prev) => {
      if (clean && !prev.tags.includes(clean)) {
        return { ...prev, tags: [...prev.tags, clean], tagInput: '' };
      }
      return { ...prev, tagInput: '' };
    });
  };

  const handleRemoveTag = (tag) => {
    setState((prev) => ({ ...prev, tags: prev.tags.filter((entry) => entry !== tag) }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleChange('imagePreview', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const canSubmit = () => {
    if (state.pollEnabled) {
      return state.pollQuestion.trim().length > 3 && state.pollOptions.some((option) => option.trim().length > 0);
    }
    return state.body.trim().length > 0 || Boolean(state.imagePreview);
  };

  const resetForm = () => {
    setState({ ...baseState, channelId: defaultChannelId || 'all' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit() || submitting) return;
    setSubmitting(true);

    const postPayload = {
      channelId: state.channelId,
      content: state.body.trim(),
      type: state.pollEnabled ? 'poll' : state.imagePreview ? 'image' : 'text',
      image: state.imagePreview || null,
      poll: state.pollEnabled
        ? {
            question: state.pollQuestion.trim(),
            options: state.pollOptions
              .filter((option) => option.trim())
              .map((option, index) => ({ id: `poll-option-${index}`, label: option.trim(), votes: 0 }))
          }
        : null,
      tags: state.tags,
      reactions: { '🔥': 0, '👏': 0, '💡': 0 },
      comments: 0,
      author: {
        name: 'You',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Creator',
        role: 'Community member'
      }
    };

    const published = publishPost(postPayload);
    if (published) {
      onPostCreated(published);
      resetForm();
    }
    setSubmitting(false);
  };

  const handlePollOptionChange = (index, value) => {
    setState((prev) => {
      const nextOptions = [...prev.pollOptions];
      nextOptions[index] = value;
      return { ...prev, pollOptions: nextOptions };
    });
  };

  return (
    <section className="post-composer" id="composer" aria-label="Create a community post">
      <form onSubmit={handleSubmit}>
        <div className="composer-top">
          <select
            value={state.channelId}
            onChange={(event) => handleChange('channelId', event.target.value)}
            className="composer-channel"
            aria-label="Select channel"
          >
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <div className="composer-tags">
            {state.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="composer-tag"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                #{tag}
                <span aria-hidden="true">×</span>
              </button>
            ))}
            <input
              type="text"
              placeholder="Add tags"
              value={state.tagInput}
              onChange={(event) => {
                const value = event.target.value;
                if (value.includes(',')) {
                  commitTag(value);
                } else {
                  setState((prev) => ({ ...prev, tagInput: value }));
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitTag(state.tagInput);
                }
              }}
              className="composer-tag-input"
            />
          </div>
        </div>

        <textarea
          value={state.body}
          onChange={(event) => handleChange('body', event.target.value)}
          placeholder="Share a win, ask for feedback, or drop a question."
          rows={4}
          className="composer-textarea"
        />

        {state.imagePreview && (
          <div className="composer-image-preview">
            <img src={state.imagePreview} alt="Attachment preview" />
            <button type="button" onClick={() => handleChange('imagePreview', '')}>
              Remove image
            </button>
          </div>
        )}

        {state.pollEnabled && (
          <div className="composer-poll">
            <label className="composer-field">
              <span>Poll question</span>
              <input
                type="text"
                value={state.pollQuestion}
                onChange={(event) => handleChange('pollQuestion', event.target.value)}
                required
              />
            </label>
            <div className="composer-poll-options">
              {state.pollOptions.map((option, index) => (
                <label key={`poll-${index}`} className="composer-field">
                  <span>Option {index + 1}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(event) => handlePollOptionChange(index, event.target.value)}
                    required={index < 2}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="composer-actions">
          <label className="composer-attach">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <span>Attach image</span>
          </label>
          <button
            type="button"
            className={`composer-toggle ${state.pollEnabled ? 'composer-toggle--active' : ''}`}
            onClick={() => handleChange('pollEnabled', !state.pollEnabled)}
            aria-pressed={state.pollEnabled}
          >
            {state.pollEnabled ? 'Remove poll' : 'Add poll'}
          </button>
          <button type="submit" className="button-pill" disabled={!canSubmit() || submitting}>
            {submitting ? 'Posting…' : 'Share update'}
          </button>
        </div>
      </form>
    </section>
  );
};

PostComposer.propTypes = {
  channels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  defaultChannelId: PropTypes.string,
  onPostCreated: PropTypes.func.isRequired
};

PostComposer.defaultProps = {
  defaultChannelId: 'all'
};

export default PostComposer;

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { publishPost } from '../utils/loadSeeds';
import '../styles/ui.css';

const baseState = {
  channelId: 'all',
  title: '',
  description: '',
  tags: [],
  tagInput: '',
  attachment: null,
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

  const hasContent = state.description.trim().length > 0 || Boolean(state.attachment);
  const canSubmit = () => {
    if (state.pollEnabled) {
      return (
        state.title.trim().length > 3 &&
        state.pollQuestion.trim().length > 3 &&
        state.pollOptions.some((option) => option.trim().length > 0)
      );
    }
    return state.title.trim().length > 3 && hasContent;
  };

  const resetForm = () => {
    setState({ ...baseState, channelId: defaultChannelId || 'all' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit() || submitting) return;
    setSubmitting(true);

    const attachmentPayload = state.attachment
      ? {
          type: state.attachment.type,
          name: state.attachment.name,
          preview: state.attachment.preview || null
        }
      : null;

    const postPayload = {
      channelId: state.channelId,
      title: state.title.trim(),
      description: state.description.trim(),
      content: state.description.trim(),
      type: state.pollEnabled ? 'poll' : attachmentPayload?.type === 'image' ? 'image' : 'text',
      image: attachmentPayload?.type === 'image' ? attachmentPayload.preview : null,
      attachment: attachmentPayload,
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

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setState((prev) => ({
          ...prev,
          attachment: { type: 'image', preview: reader.result, name: file.name }
        }));
      };
      reader.readAsDataURL(file);
      return;
    }
    setState((prev) => ({
      ...prev,
      attachment: { type: 'file', name: file.name }
    }));
  };

  const removeAttachment = () => {
    setState((prev) => ({ ...prev, attachment: null }));
  };

  return (
    <section className="community-composer" id="composer" aria-label="Create a community post">
      <form className="composer-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Channel</span>
          <select
            value={state.channelId}
            onChange={(event) => handleChange('channelId', event.target.value)}
            className="composer-select"
            aria-label="Select channel"
          >
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </label>

        <div className="composer-tags" aria-label="Selected tags">
          {state.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="chip chip--accent"
              onClick={() => handleRemoveTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              #{tag}
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

        <label className="form-field">
          <span>Post title</span>
          <input
            type="text"
            value={state.title}
            onChange={(event) => handleChange('title', event.target.value)}
            placeholder="e.g. Async cohort retros"
            required
          />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea
            value={state.description}
            onChange={(event) => handleChange('description', event.target.value)}
            placeholder="Share a win, ask for feedback, or drop a question."
            rows={4}
            className="composer-textarea"
          />
        </label>

        {state.attachment && (
          <div className="composer-attachment" role="region" aria-label="Attachment preview">
            {state.attachment.type === 'image' && (
              <img src={state.attachment.preview} alt="Attachment preview" />
            )}
            <p>{state.attachment.name}</p>
            <button type="button" onClick={removeAttachment} className="btn-tertiary">
              Remove attachment
            </button>
          </div>
        )}

        {state.pollEnabled && (
          <div className="composer-poll">
            <label className="form-field">
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
                <label key={`poll-${index}`} className="form-field">
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
            <input type="file" onChange={handleFileUpload} aria-label="Attach file" />
            <span>Attach file</span>
          </label>
          <button
            type="button"
            className={`chip${state.pollEnabled ? ' chip--accent' : ''}`}
            onClick={() => handleChange('pollEnabled', !state.pollEnabled)}
            aria-pressed={state.pollEnabled}
          >
            {state.pollEnabled ? 'Remove poll' : 'Add poll'}
          </button>
          <button type="submit" className="btn-primary" disabled={!canSubmit() || submitting}>
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

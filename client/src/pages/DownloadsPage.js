import React, { useEffect, useState } from 'react';
import { getDownloads, saveDownloadsList } from '../utils/loadSeeds';

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDownloads().then((items) => {
      setDownloads(items);
      setLoading(false);
    });
  }, []);

  // Persist list mutation helper to prevent repeated boilerplate.
  const persistDownloads = async (next) => {
    setDownloads(next);
    await saveDownloadsList(next);
  };

  const handleRemove = async (id) => {
    const next = downloads.filter((item) => item.id !== id);
    await persistDownloads(next);
    console.log('Download removed via page', id, new Date().toISOString());
  };

  const handleToggleComplete = async (id) => {
    const next = downloads.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    await persistDownloads(next);
    console.log('Download completion toggled via page', id, new Date().toISOString());
  };

  const handleRedownload = (item) => {
    const link = document.createElement('a');
    link.href = item.url || URL.createObjectURL(new Blob([item.title], { type: 'text/plain' }));
    link.download = `${item.title || 'download'}.txt`;
    link.click();
    if (!item.url) {
      URL.revokeObjectURL(link.href);
    }
    console.log('Download triggered via page', item.id, new Date().toISOString());
  };

  return (
    <main className="downloads-page">
      <header className="downloads-header">
        <div>
          <p className="downloads-header__eyebrow">Downloads</p>
          <h1>Your purchased resources</h1>
          <p className="downloads-header__subtitle">
            Manage exported courses, mentor packs, and job resources without leaving the dashboard.
          </p>
        </div>
      </header>
      {loading ? (
        <p>Loading downloads…</p>
      ) : (
        <ul className="download-list download-list--page">
          {downloads.length === 0 && <li>No downloads yet.</li>}
          {downloads.map((item) => (
            <li key={item.id} className="download-item">
              <div>
                <p className="download-item__title">{item.title}</p>
                <p className="download-item__meta">
                  {item.type} · {item.size}
                </p>
              </div>
              <div className="download-item__actions">
                <label className="download-item__complete">
                  <input
                    type="checkbox"
                    checked={Boolean(item.completed)}
                    onChange={() => handleToggleComplete(item.id)}
                  />
                  <span>Completed</span>
                </label>
                <button type="button" className="btn btn--ghost" onClick={() => handleRedownload(item)}>
                  Redownload
                </button>
                <button type="button" className="btn btn--text" onClick={() => handleRemove(item.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default DownloadsPage;

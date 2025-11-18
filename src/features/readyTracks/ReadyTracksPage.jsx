import React, { useState } from 'react';
import useReadyTracks from './useReadyTracks';

const ReadyTracksPage = () => {
  const { tracks, isLoading, error } = useReadyTracks();
  const [selectedTrackId, setSelectedTrackId] = useState('');

  const handleSelectTrack = (trackId) => {
    setSelectedTrackId(trackId);
  };

  const renderTracks = () => {
    if (tracks.length === 0) {
      return <p>Нет готовых треков</p>;
    }

    return (
      <ul className="ready-tracks-list">
        {tracks.map((track) => (
          <li key={track.id} className="ready-tracks-list__item">
            <div className="ready-tracks-list__info">
              <strong>{track.title}</strong>
              {track.artist ? (
                <span className="ready-tracks-list__artist">
                  {' '}
                  — {track.artist}
                </span>
              ) : null}
            </div>
            <button type="button" onClick={() => handleSelectTrack(track.id)}>
              Играть/Выбрать
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="ready-tracks-page">
      <h1>Готовые треки</h1>

      {isLoading && <p>Загружаем…</p>}

      {!isLoading && error && (
        <p role="alert" className="ready-tracks-page__error">
          {error}
        </p>
      )}

      {!isLoading && !error && renderTracks()}

      {selectedTrackId && !isLoading && !error && (
        <p className="ready-tracks-page__selection">
          Выбранный трек: {selectedTrackId}
        </p>
      )}
    </section>
  );
};

export default ReadyTracksPage;

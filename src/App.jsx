import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import SplitPane from './components/SplitPane';
import Card from './components/Card';
import Button from './components/Button';
import Tag from './components/Tag';

const createPlaylist = () => [
  { id: 1, title: 'Neon Nights', artist: 'Luna Vox', duration: '03:48' },
  { id: 2, title: 'Synthwave Dreams', artist: 'Echo Pulse', duration: '04:12' },
  { id: 3, title: 'Chromatic Sky', artist: 'Aurora Beam', duration: '02:59' },
];

function App() {
  const [theme, setTheme] = useState('light');
  const [selectedTrack, setSelectedTrack] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playlist = useMemo(() => createPlaylist(), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeTrack = playlist.find((track) => track.id === selectedTrack) ?? playlist[0];

  const handleSelectTrack = (trackId) => {
    setSelectedTrack(trackId);
    setIsPlaying(false);
  };

  const handleTogglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="app" data-theme={theme}>
      <Header theme={theme} onToggleTheme={handleToggleTheme} />
      <main className="app__main" aria-label="AI Karaoke workspace">
        <SplitPane
          ariaLabel="Playlist and player layout"
          left={
            <section className="playlist" aria-label="Playlist">
              <div className="playlist__header">
                <h2 className="playlist__title">Playlist</h2>
                <Button type="button" aria-label="Add a new song" variant="secondary">
                  +
                </Button>
              </div>
              <ul className="playlist__items">
                {playlist.map((track) => (
                  <li key={track.id}>
                    <Card
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedTrack === track.id}
                      className={selectedTrack === track.id ? 'playlist__card playlist__card--active' : 'playlist__card'}
                      onClick={() => handleSelectTrack(track.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelectTrack(track.id);
                        }
                      }}
                    >
                      <div className="playlist__card-header">
                        <span className="playlist__card-title">{track.title}</span>
                        <Tag variant="neutral">{track.duration}</Tag>
                      </div>
                      <p className="playlist__card-artist">{track.artist}</p>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          }
          right={
            <section className="player" aria-label="Player and lyrics">
              <Card className="player__surface" aria-labelledby="player-title">
                <div className="player__header">
                  <h2 id="player-title" className="player__title">
                    {activeTrack.title}
                  </h2>
                  <Tag variant="success" aria-label="Connection status">
                    Live Sync
                  </Tag>
                </div>
                <p className="player__subtitle">{activeTrack.artist}</p>
                <div className="player__controls" role="group" aria-label="Playback controls">
                  <Button
                    type="button"
                    aria-label={isPlaying ? 'Pause song' : 'Play song'}
                    aria-pressed={isPlaying}
                    onClick={handleTogglePlayback}
                  >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </Button>
                </div>
              </Card>
              <div className="player__lyrics">
                <label className="player__lyrics-label" htmlFor="lyrics">
                  Lyrics
                </label>
                <textarea
                  id="lyrics"
                  className="player__lyrics-input"
                  rows={6}
                  aria-describedby="lyrics-help"
                  placeholder="Lyrics will appear here..."
                  readOnly
                  defaultValue={`[Verse 1]\nFeel the rhythm in the neon rain\nLet the chorus guide the way`}
                />
                <span id="lyrics-help" className="sr-only">
                  Lyrics text area. Content is read-only.
                </span>
              </div>
            </section>
          }
        />
      </main>
    </div>
  );
}

export default App;

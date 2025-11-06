import React from 'react';
import karaokeConfig from './config.json';

const KaraokePage = () => {
  return (
    <section
      className="workspace karaoke-page"
      aria-labelledby="karaoke-page-title"
      aria-describedby="karaoke-page-description"
    >
      <header className="karaoke-page__header">
        <h1 id="karaoke-page-title" className="karaoke-page__title">
          {karaokeConfig.title}
        </h1>
        <p id="karaoke-page-description" className="karaoke-page__description">
          {karaokeConfig.description}
        </p>
      </header>
      <div className="karaoke-page__body">
        <p>{karaokeConfig.comingSoon}</p>
        <p>
          Пока мы завершаем разработку, вы можете подготовить плейлист и поделиться
          идеями по улучшению караоке-режима.
        </p>
      </div>
    </section>
  );
};

export default KaraokePage;

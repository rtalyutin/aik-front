import React, { useCallback, useEffect, useMemo, useState } from 'react';
import teamsConfig from './config.json';
import './team-showcase.css';

const AUTOPLAY_INTERVAL_MS = 8000;

const normalizeTeams = (config) => {
  if (!Array.isArray(config)) {
    return [];
  }

  return config
    .map((team) => {
      if (!team || typeof team !== 'object') {
        return null;
      }

      const members = Array.isArray(team.members)
        ? team.members
            .map((member, index) => {
              if (!member || typeof member !== 'object') {
                return null;
              }

              return {
                id: `${team.id ?? 'team'}-member-${index}`,
                name: String(member.name ?? '').trim(),
                position: String(member.position ?? '').trim(),
                hours: Number.isFinite(Number(member.hours))
                  ? Number(member.hours)
                  : null,
                description: String(member.description ?? '').trim(),
              };
            })
            .filter(Boolean)
        : [];

      return {
        id: String(team.id ?? team.name ?? Math.random().toString(36).slice(2)),
        name: String(team.name ?? '').trim(),
        type: String(team.type ?? '').trim(),
        summary: String(team.summary ?? '').trim(),
        logo: String(team.logo ?? '').trim(),
        members,
      };
    })
    .filter((team) => team && team.name);
};

const TeamShowcase = () => {
  const teams = useMemo(() => normalizeTeams(teamsConfig), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const teamCount = teams.length;

  useEffect(() => {
    if (teamCount <= 1 || isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((previous) => {
        if (teamCount <= 0) {
          return previous;
        }

        return (previous + 1) % teamCount;
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [teamCount, isPaused]);

  useEffect(() => {
    if (currentIndex >= teamCount && teamCount > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, teamCount]);

  const handleNext = useCallback(() => {
    setCurrentIndex((previous) => {
      if (teamCount <= 0) {
        return previous;
      }

      return (previous + 1) % teamCount;
    });
  }, [teamCount]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((previous) => {
      if (teamCount <= 0) {
        return previous;
      }

      return (previous - 1 + teamCount) % teamCount;
    });
  }, [teamCount]);

  const handleIndicatorClick = useCallback((index) => {
    if (!Number.isInteger(index)) {
      return;
    }

    setCurrentIndex((previous) => {
      if (teamCount <= 0) {
        return previous;
      }

      const normalized = ((index % teamCount) + teamCount) % teamCount;
      return normalized;
    });
  }, [teamCount]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback((event) => {
    if (!event) {
      setIsPaused(false);
      return;
    }

    const relatedTarget = event.relatedTarget;
    const currentTarget = event.currentTarget;

    if (!currentTarget || (relatedTarget && currentTarget.contains(relatedTarget))) {
      return;
    }

    setIsPaused(false);
  }, []);

  if (teamCount === 0) {
    return null;
  }

  return (
    <section className="team-showcase" aria-label="Команды сообщества">
      <div className="team-showcase__header">
        <h2 className="team-showcase__title">Команды сообщества</h2>
        <p className="team-showcase__subtitle">
          Познакомьтесь с ростерами, которые участвуют в наших квалификациях, и узнайте об их стиле игры.
        </p>
      </div>
      <div
        className="team-showcase__carousel"
        onMouseEnter={handlePause}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={handlePause}
        onBlur={handleResume}
      >
        <button
          type="button"
          className="team-showcase__control team-showcase__control--prev"
          onClick={handlePrevious}
          aria-label="Предыдущая команда"
        >
          ‹
        </button>
        <div className="team-showcase__viewport">
          <ul
            className="team-showcase__track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            data-testid="team-showcase-track"
          >
            {teams.map((team, index) => {
              const isActive = index === currentIndex;

              return (
                <li
                  key={team.id}
                  className="team-showcase__slide"
                  aria-hidden={isActive ? 'false' : 'true'}
                  data-active={isActive ? 'true' : 'false'}
                >
                  <article className="team-card">
                    <header className="team-card__header">
                      <div className="team-card__logo-wrapper">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={`Логотип ${team.name}`}
                            className="team-card__logo"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="team-card__headline">
                        <span className="team-card__type">{team.type}</span>
                        <h3 className="team-card__name">{team.name}</h3>
                        {team.summary ? <p className="team-card__summary">{team.summary}</p> : null}
                      </div>
                    </header>
                    <ul className="team-card__members" aria-label={`Состав команды ${team.name}`}>
                      {team.members.map((member) => (
                        <li key={member.id} className="team-card__member">
                          <div className="team-card__member-header">
                            <p className="team-card__member-name">{member.name}</p>
                            <span className="team-card__member-role">{member.position}</span>
                          </div>
                          <div className="team-card__member-meta">
                            {member.hours !== null ? (
                              <span className="team-card__member-hours" aria-label="Часы в игре">
                                {member.hours.toLocaleString('ru-RU')} ч
                              </span>
                            ) : null}
                          </div>
                          <p className="team-card__member-description">{member.description}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
        <button
          type="button"
          className="team-showcase__control team-showcase__control--next"
          onClick={handleNext}
          aria-label="Следующая команда"
        >
          ›
        </button>
      </div>
      <div className="team-showcase__indicators" role="tablist" aria-label="Навигация по командам">
        {teams.map((team, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              key={team.id}
              type="button"
              className="team-showcase__indicator"
              aria-label={`Показать команду ${team.name}`}
              aria-pressed={isActive}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => handleIndicatorClick(index)}
            />
          );
        })}
      </div>
    </section>
  );
};

export default TeamShowcase;

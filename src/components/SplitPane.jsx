import React from 'react';

const SplitPane = ({
  left,
  right,
  leftWidth = '30%',
  rightWidth = '70%',
  ariaLabel = 'Split view',
}) => {
  return (
    <section className="split-pane" aria-label={ariaLabel}>
      <div
        className="split-pane__pane split-pane__pane--left"
        style={{ flex: `0 0 ${leftWidth}` }}
      >
        {left}
      </div>
      <div className="split-pane__divider" aria-hidden="true" />
      <div
        className="split-pane__pane split-pane__pane--right"
        style={{ flex: `1 1 ${rightWidth}` }}
      >
        {right}
      </div>
    </section>
  );
};

export default SplitPane;

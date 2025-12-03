import ReactPlayer from 'react-player';

const resolvedReactPlayer = globalThis?.REACT_PLAYER_MOCK || ReactPlayer;

export default resolvedReactPlayer;

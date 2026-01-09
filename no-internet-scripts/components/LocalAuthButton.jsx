import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext.jsx';
import { isLocalFeaturesEnabled } from '../utils/isLocalFeaturesEnabled.js';

const LocalAuthButton = ({ buttonClassName }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isLocalFeaturesEnabled()) {
    return null;
  }

  const handleLocalAuth = () => {
    const fakeToken = 'local-dev-token-' + Date.now();
    login(fakeToken);
    navigate('/karaoke', { replace: true });
  };

  return (
    <button type="button" onClick={handleLocalAuth} className={buttonClassName}>
      Я свой, пусти
    </button>
  );
};

export default LocalAuthButton;

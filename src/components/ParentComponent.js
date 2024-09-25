import React, { useState } from 'react';
import Header from '../components/Header/Header';
import Exchange from '../screens/Ads/Ads/Exchange';

const ParentComponent = () => {
  const [headerPoints, setHeaderPoints] = useState(0);

  const updateHeaderPoints = (newPoints) => {
    setHeaderPoints(newPoints);
  };

  return (
    <div>
      <Header title="My Header" updateHeaderPoints={updateHeaderPoints} />
      <Exchange availablePoints={headerPoints} updateHeaderPoints={updateHeaderPoints} />
    </div>
  );
};

export default ParentComponent;

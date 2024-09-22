import React, { useState } from 'react';
import Header from './Header';
import Exchange from './Ads/Exchange';

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

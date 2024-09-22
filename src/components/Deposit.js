import React, { useState } from 'react';
import './Money.css'; // Assuming you have a CSS file for styling

const Deposit = () => {
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    // Add your deposit logic here
    alert(`Deposited: $${amount}`);
  };

  return (
    <div className="container">
      <h2>Deposit Funds</h2>
      <div className="input-group">
        <label htmlFor="amount">Amount</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>
      <button onClick={handleDeposit} className="btn">
        Deposit
      </button>
    </div>
  );
};

export default Deposit;

import React, { useState } from 'react';
import './Money.css'; // Assuming you have a CSS file for styling

const Withdrawal = () => {
  const [amount, setAmount] = useState('');

  const handleWithdrawal = () => {
    // Add your withdrawal logic here
    alert(`Withdrew: $${amount}`);
  };

  return (
    <div className="container">
      <h2>Withdraw Funds</h2>
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
      <button onClick={handleWithdrawal} className="btn">
        Withdraw
      </button>
    </div>
  );
};

export default Withdrawal;

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './Money.css';

const Withdrawl = () => {
  const [amount, setAmount] = useState('');
  const [paymentDetail, setPaymentDetail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user
  const fetchCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error);
      return;
    }
    setCurrentUserId(user.id);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch payment history whenever currentUserId changes
  const fetchPaymentHistory = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('withdrawl_history')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPaymentHistory(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to fetch payment history.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  // Check if the user is logged in
  if (!currentUserId) {
    return <div>You need to be logged in to submit a review.</div>;
  }

  const handleReview = async () => {
    console.log("Current User ID:", currentUserId);
  
    // Check if required fields are filled: amount, paymentDetail, and paymentMethod
    if (!amount || !paymentDetail || !paymentMethod) {
      alert("Please fill in all fields: amount, payment details, and payment method.");
      return;
    }
  
    // Ensure the amount is a number and meets the minimum value
    const minAmount = 1000000; 
    if (parseFloat(amount) < minAmount) {
      alert(`Minimum Payment is ${minAmount} Points.`);
      return;
    }
  
    // Validate the amount must be a positive number
    if (parseFloat(amount) <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }
  
    // Payment method specific validations
    if (paymentMethod === 'baridimob') {
      // Validate that RIP is exactly 10 digits
      const ripRegex = /^\d{10}$/;
      if (!ripRegex.test(paymentDetail)) {
        alert("Please enter a valid 10-digit RIP for Baridimob.");
        return;
      }
    } else if (paymentMethod === 'paypal') {
      // Validate that the input is a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paymentDetail)) {
        alert("Please enter a valid PayPal email address.");
        return;
      }
    } else if (paymentMethod === 'usdt') {
      // Assume we want a Binance ID for USDT, you can define a specific rule here
      if (!paymentDetail) {
        alert("Please enter a valid Binance ID for USDT.");
        return;
      }
    }
  
    const depositData = {
      user_id: currentUserId,
      amount: parseFloat(amount),
      amount_address: paymentDetail, // Storing the payment detail (ID or email)
      withdrawl_review: 'In Review', // Initial status
      created_at: new Date().toISOString(),
      payment_method: paymentMethod, // The chosen payment method
    };
  
    setLoading(true);
    setError(null);
  
    try {
      // Insert the deposit data into the withdrawl_history table
      const { error } = await supabase.from('withdrawl_history').insert([depositData]);
  
      if (error) throw error;
  
      // Refresh payment history after a successful submission
      await fetchPaymentHistory();
      resetForm();
      alert("Review submitted successfully!");
    } catch (error) {
      console.error('Error inserting deposit:', error);
      alert(`Failed to submit the review: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };  

  const resetForm = () => {
    setAmount('');
    setPaymentDetail('');
    setPaymentMethod('');
  };

  const getPlaceholders = () => {
    switch (paymentMethod) {
      case 'paypal':
        return { placeholder: 'Enter your PayPal email', instructions: 'Commission will charged from amount of transfer' };
      case 'baridimob':
        return { placeholder: 'Enter your RIP', instructions: `Commission: 0%
           send the receipt to this email designeeli2@gmail.com` };
      case 'usdt':
        return { placeholder: 'Enter your Binance ID', instructions: 'Commission: 0%' };
      default:
        return { placeholder: 'Enter your details', instructions: '' };
    }
  };

  const { placeholder, instructions } = getPlaceholders();

  return (
    <div className="deposit-container">
      <div className="deposit-form">
        <h2>Withdrawl</h2>

        {error && <div className="error">{error}</div>}

        <div className="custom-select">
          <label>Choose Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="" disabled>Select a method</option>
            <option value="usdt">USDT</option>
            <option value="baridimob">Baridimob</option>
            <option value="paypal">PayPal</option>
          </select>

          <div className="payment-images">
            <img src="/usdt.png" alt="USDT" className={paymentMethod === 'usdt' ? 'selected' : ''} />
            <img src="/baridi_logo.png" alt="Baridimob" className={paymentMethod === 'baridimob' ? 'selected' : ''} />
            <img src="/paypal.png" alt="PayPal" className={paymentMethod === 'paypal' ? 'selected' : ''} />
          </div>
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="form-group">
          <label>{placeholder}</label>
          <input
            type="text"
            value={paymentDetail}
            onChange={(e) => setPaymentDetail(e.target.value)}
            placeholder={placeholder}
          />
        </div>

        {instructions && <div className="withdraw-instructions">{instructions}</div>}

        <button className="review-btn" onClick={handleReview} disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
        <p>10000 Points = 0.1$</p>
        <p>Minimum Payment is 10$ = 1,000,000 Points</p>
      </div>

      <div className="payment-history">
  <h3>Payment History</h3>
  {loading ? (
    <p>Loading...</p>
  ) : (
    <table className="payment-history-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Method</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {paymentHistory.map((payment, index) => {
          // Determine the status color
          let statusClass = '';
          switch (payment.withdrawl_review) {
            case 'In Review':
              statusClass = 'status-orange'; // Orange for "In Review"
              break;
            case 'Approved':
              statusClass = 'status-green'; // Green for "Approved"
              break;
            case 'Rejected':
              statusClass = 'status-red'; // Red for "Rejected"
              break;
            default:
              statusClass = ''; // Default class if needed
          }

          return (
            <tr key={index}>
              <td>{new Date(payment.created_at).toLocaleString()}</td>
              <td>{payment.payment_method}</td>
              <td>{payment.amount}</td>
              <td className={statusClass}>{payment.withdrawl_review}</td> {/* Apply status class here */}
            </tr>
          );
        })}
      </tbody>
      <br />
      <br />
      <br />
      <div className="par">
      <h3>Payment Rules</h3>
      <p style={{ width: '100%' }}>Payment dates are <strong>1-2 and 16-17</strong> of each month, <strong style={{ color: 'red' }}>from 9.00 am till 6.00 pm GMT</strong>.<br />
        If these dates fall on <strong>weekends or holidays</strong> the payments will be processed on nearest business day.<br />
        Once you reach the minimum payout amount, the money is put on a two-week hold.<br />
        You will get the payout during the first payment period available after your hold period ends.</p>

        <p>For example:<br />
        You reach the minimum payout amount on June 8. The two-week hold period ends on June 22. The next available payment period is July 1-2.<br />
        You reach the minimum payout amount on June 17. The two-week hold period ends on July 1. The next available payment period is July 16-17.</p>

      </div>
    </table>
  )}
</div>
<br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default Withdrawl;

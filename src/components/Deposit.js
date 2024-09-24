import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './Money.css';

const Deposit = () => {
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
        .from('deposit_history')
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

    // Only check for required fields: amount, paymentDetail, and paymentMethod
    if (!amount || !paymentDetail || !paymentMethod) {
      alert("Please fill in the amount and payment method details.");
      return;
    }

    // Validate the amount
    if (parseFloat(amount) <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }

    const depositData = {
      user_id: currentUserId,
      amount: parseFloat(amount),
      amount_address: paymentDetail, // Storing the payment detail (ID or email)
      deposit_review: 'In Review', // Initial status
      created_at: new Date().toISOString(),
      payment_method: paymentMethod, // The chosen payment method
    };

    setLoading(true);
    setError(null);

    try {
      // Insert the deposit data into the deposit_history table
      const { error } = await supabase.from('deposit_history').insert([depositData]);

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
        return { placeholder: 'Enter your PayPal email', instructions: 'Send deposit to samifalouti02@gmail.com' };
      case 'baridimob':
        return { placeholder: 'Enter your RIP', instructions: 'Send deposit to 00247467487874' };
      case 'usdt':
        return { placeholder: 'Enter your Binance ID', instructions: 'Send deposit to TV54rDfetHKdghs65638GV' };
      default:
        return { placeholder: 'Enter your details', instructions: '' };
    }
  };

  const { placeholder, instructions } = getPlaceholders();

  return (
    <div className="deposit-container">
      <div className="deposit-form">
        <h2>Deposit Funds</h2>

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

        {instructions && <div className="payment-instructions"><strong>Instructions:</strong> {instructions}</div>}

        <button className="review-btn" onClick={handleReview} disabled={loading}>
          {loading ? 'Processing...' : 'Review'}
        </button>
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
          switch (payment.deposit_review) {
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
              <td className={statusClass}>{payment.deposit_review}</td> {/* Apply status class here */}
            </tr>
          );
        })}
      </tbody>
    </table>
  )}
</div>

    </div>
  );
};

export default Deposit;

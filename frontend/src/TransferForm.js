import React, { useEffect, useState, useCallback } from 'react';
import { init, createElement } from '@airwallex/components-sdk';
import './TransferForm.css';

const TransferForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferComponent, setTransferComponent] = useState(null);


  //use a KYC approved connected account
  const fetchAuthCode = async () => {
    const response = await fetch('http://localhost:5000/api/get-auth-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acct_eDWgRsz1PB2U4_TcLsKTzw' }), //use a KYC approved connected account
    });

    if (!response.ok) throw new Error('Failed to fetch auth code');
    return response.json();
  };

  const initializeSdk = async (authCode, codeVerifier) => {
    await init({
      authCode,
      codeVerifier,
      env: process.env.REACT_APP_API_ENV || 'demo',
      clientId: process.env.REACT_APP_CLIENT_ID,
      langKey: 'en',
    });
  };

  const initializeTransferComponent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { authCode, codeVerifier } = await fetchAuthCode();
      await initializeSdk(authCode, codeVerifier);

      const transferComponentInstance = await createElement('payoutForm', { hideHeader: true, hideNav: true });

      const container = document.getElementById('transfer-form-container');
      if (container) {
        transferComponentInstance.mount('transfer-form-container');

        transferComponentInstance.on('ready', () => {
          console.log('Transfer component is ready');
          setLoading(false);
        });

        transferComponentInstance.on('error', async (event) => {
          console.error('Transfer component error:', event);
          if (event.code === 'TOKEN_EXPIRED') {
            const newAuthCode = await fetchAuthCode();
            await initializeSdk(newAuthCode, codeVerifier);
            transferComponentInstance.mount('transfer-form-container');
          } else {
            setError('An error occurred in the transfer component.');
          }
        });

        // ✅ Fix: Set transferComponent in state correctly
        setTransferComponent(() => transferComponentInstance);
      } else {
        console.error('Container element not found for mounting the transfer component.');
      }
    } catch (error) {
      console.error('Error initializing SDK or mounting Transfer component:', error);
      setError(error.message || 'Failed to initialize the Transfer component');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeTransferComponent();
  }, [initializeTransferComponent]);

  const handleSubmit = async () => {
    if (transferComponent) {
      try {
        const results = await transferComponent.submit();
        console.log('Final payload:', results);
        const payload = results.values;
        console.log(payload)
        alert('Transfer submitted successfully!');
      } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit the transfer');
      }
    }
  };

  return (
    <div className="transfer-form-container">
      <h1>Airwallex Embedded Transfer Component</h1>
      {loading && <p>Loading Transfer Component...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        id="transfer-form-container"
        style={{
          width: '100%',
          minHeight: '500px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
          flexDirection: 'column',
        }}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: '#6A0DAD',
          color: 'white',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          marginTop: '20px',
          display: 'block',
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default TransferForm;

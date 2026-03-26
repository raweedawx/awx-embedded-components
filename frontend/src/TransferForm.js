import React, { useEffect, useState, useCallback } from 'react';
import { init, createElement } from '@airwallex/components-sdk';
import './TransferForm.css';

const TransferForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferComponent, setTransferComponent] = useState(null);
  const [connectedAccountId, setConnectedAccountId] = useState(
    process.env.REACT_APP_TRANSFER_CONNECTED_ACCOUNT_ID || 'acct_eDWgRsz1PB2U4_TcLsKTzw'
  );


  //use a KYC approved connected account
  const fetchAuthCode = async (accountId) => {
    if (!accountId) {
      throw new Error('Connected account ID is required');
    }

    const response = await fetch('http://localhost:5000/api/get-auth-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, component: 'transfer' }),
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

  const initializeTransferComponent = useCallback(async (accountId) => {
    setLoading(true);
    setError(null);

    try {
      const resolvedAccountId = accountId?.trim();
      const { authCode, codeVerifier } = await fetchAuthCode(resolvedAccountId);
      await initializeSdk(authCode, codeVerifier);

      const transferComponentInstance = await createElement('payoutForm', { hideHeader: true, hideNav: true });

      const container = document.getElementById('transfer-form-container');
      if (container) {
        container.innerHTML = '';
        transferComponentInstance.mount('transfer-form-container');

        transferComponentInstance.on('ready', () => {
          console.log('Transfer component is ready');
          setLoading(false);
        });

        transferComponentInstance.on('error', async (event) => {
          console.error('Transfer component error:', event);
          if (event.code === 'TOKEN_EXPIRED') {
            const refreshedAuthData = await fetchAuthCode(resolvedAccountId);
            await initializeSdk(refreshedAuthData.authCode, refreshedAuthData.codeVerifier);
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
    initializeTransferComponent(connectedAccountId);
  }, [initializeTransferComponent]);

  const handleLoadComponent = () => {
    initializeTransferComponent(connectedAccountId);
  };

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
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <label htmlFor="transfer-account-id" style={{ display: 'block', marginBottom: '8px' }}>
          Connected Account ID
        </label>
        <input
          id="transfer-account-id"
          type="text"
          value={connectedAccountId}
          onChange={(e) => setConnectedAccountId(e.target.value)}
          placeholder="acct_xxx..."
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={handleLoadComponent}
          disabled={loading}
          style={{
            backgroundColor: '#6A0DAD',
            color: 'white',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            marginTop: '12px',
          }}
        >
          {loading ? 'Loading...' : 'Load with account ID'}
        </button>
      </div>
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

import React, { useState, useEffect } from 'react';
import { init, createElement } from '@airwallex/components-sdk';

const BeneficiaryForm = () => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [beneficiaryComponent, setBeneficiaryComponent] = useState(null);
  const [connectedAccountId, setConnectedAccountId] = useState(
    process.env.REACT_APP_BENEFICIARY_CONNECTED_ACCOUNT_ID || 'acct_jfA9Wzk3NS-YSnWUnWE_hQ'
  );

  const handleInitialize = async () => {
    const accountId = connectedAccountId.trim();
    if (!accountId) {
      alert('Please provide a connected account ID.');
      return;
    }

    setLoading(true);
    try {
      const authResponse = await fetch('http://localhost:5000/api/get-auth-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, component: 'beneficiary' })
      });

      if (!authResponse.ok) {
        throw new Error('Failed to get auth code for beneficiary');
      }

      const { authCode, codeVerifier } = await authResponse.json();

      await init({
        authCode,
        codeVerifier,
        env: process.env.REACT_APP_API_ENV || 'demo',
        clientId: process.env.REACT_APP_CLIENT_ID,
        langKey: 'en',
      });

      console.log('✅ SDK initialized');
      setInitialized(true); // show form container
    } catch (err) {
      console.error('❌ Error initializing the SDK:', err);
      alert('SDK initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mountComponent = async () => {
      if (initialized) {
        const container = document.getElementById('beneficiary-form-container');
        if (!container) {
          console.error('Container not found in DOM');
          return;
        }

        try {
          const element = await createElement('beneficiaryForm', {
            defaultValues: {
              beneficiary: {
                entity_type: 'COMPANY',
                bank_details: {
                  account_currency: 'AUD',
                  bank_country_code: 'AU',
                  local_clearing_system: 'BANK_TRANSFER',
                },
              },
              transfer_methods: ['LOCAL'],
            },
          });

          element.mount(container);
          setBeneficiaryComponent(element);

          element.on('ready', () => {
            console.log('✅ Beneficiary form ready');
          });

          element.on('error', (event) => {
            console.error('❌ Form error:', event);
            alert('Error rendering beneficiary form.');
          });
        } catch (error) {
          console.error('❌ Error mounting element:', error);
        }
      }
    };

    mountComponent();
  }, [initialized]);

  const handleSubmit = async () => {
    if (beneficiaryComponent) {
      try {
        const results = await beneficiaryComponent.submit();
        const payload = results.values;

        const response = await fetch('http://localhost:5000/api/create-beneficiary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        alert('Beneficiary created successfully!');
        console.log('Created beneficiary:', data);
      } catch (error) {
        console.error('❌ Submission error:', error);
        alert('Failed to create beneficiary.');
      }
    }
  };

  return (
    <div className="beneficiary-form-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
      <header>
        <h1>Airwallex Embedded Beneficiary Form</h1>
      </header>

      {!initialized ? (
        <>
          <div style={{ marginTop: '20px', width: '100%', maxWidth: '500px' }}>
            <label htmlFor="beneficiary-account-id" style={{ display: 'block', marginBottom: '8px' }}>
              Connected Account ID
            </label>
            <input
              id="beneficiary-account-id"
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
          </div>
          <button onClick={handleInitialize} disabled={loading} style={{
            backgroundColor: '#6A0DAD',
            color: 'white',
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            marginTop: '20px'
          }}>
            {loading ? 'Initializing...' : 'Initialize Beneficiary Form'}
          </button>
        </>
      ) : (
        <>
          <div
            id="beneficiary-form-container"
            style={{
              width: '100%',
              minHeight: '600px',
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column'
            }}
          ></div>

          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#6A0DAD',
              color: 'white',
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              marginTop: '20px',
              alignSelf: 'flex-start',
            }}
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
};

export default BeneficiaryForm;

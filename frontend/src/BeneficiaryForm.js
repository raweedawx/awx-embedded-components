import React, { useState, useEffect } from 'react';
import { init, createElement } from '@airwallex/components-sdk';

const BeneficiaryForm = () => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [beneficiaryComponent, setBeneficiaryComponent] = useState(null);
  const [authData, setAuthData] = useState(null); // holds authCode + codeVerifier

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const authResponse = await fetch('http://localhost:5000/api/get-auth-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: 'acct_jfA9Wzk3NS-YSnWUnWE_hQ' }) // valid connected account
      });

      const { authCode, codeVerifier } = await authResponse.json();

      await init({
        locale: 'en',
        env: 'demo',
        enabledElements: ['onboarding', 'payouts', 'risk'],
        authCode,
        codeVerifier,
        clientId: process.env.REACT_APP_CLIENT_ID,
      });

      console.log('✅ SDK initialized');
      setAuthData({ authCode, codeVerifier }); // store it if needed
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

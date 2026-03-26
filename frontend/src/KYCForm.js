import React, { useState } from 'react';
import { init, createElement } from '@airwallex/components-sdk';
import './KYCForm.css'; // Import the CSS file with custom styles

const KYCForm = () => {
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [terms, setTerms] = useState(false);
  const [dataUsage, setDataUsage] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState(process.env.REACT_APP_KYC_CONNECTED_ACCOUNT_ID || '');
  const [loading, setLoading] = useState(false);
  const [kycInitialized, setKycInitialized] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let accountId = connectedAccountId.trim();

      if (accountId) {
        console.log('Using provided connected account id:', accountId);
      } else {
        const createAccountPayload = { email, countryCode, terms, dataUsage };
        console.log("Sending request to /api/create-account:", createAccountPayload);

        // Step 1: Create account only when no account id is provided.
        const accountResponse = await fetch('http://localhost:5000/api/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, countryCode, terms, dataUsage })
        });

        if (!accountResponse.ok) {
          throw new Error('Failed to create account');
        }

        const accountData = await accountResponse.json();
        accountId = accountData.accountId;
      }

      // Step 2: Get auth code
      const authResponse = await fetch('http://localhost:5000/api/get-auth-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, component: 'kyc' })
      });

      if (!authResponse.ok) {
        throw new Error('Failed to get auth code');
      }

      const { authCode, codeVerifier } = await authResponse.json();

      // Initialize SDK
      await init({
        authCode,
        codeVerifier,
        env: process.env.REACT_APP_API_ENV || 'demo',
        clientId: process.env.REACT_APP_CLIENT_ID
      });

      alert('SDK initialized successfully!');

      const theme = {
        "typography": {
            "fontFace": {
                "cssFontSource": "https://fonts.googleapis.com/css2?family=Kablammo&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
            },
            "fontFamily": "Roboto"
        },
        "palette": {
            "gradients": {
                "primary": [
                    "#a47a62",
                    "#CC9814"
                ],
                "secondary": [
                    "#ce3327",
                    "#E56820"
                ]
            },
            "error": {
                "5": "#dabdb7",
                "10": "#d1aea6",
                "20": "#c99e95",
                "30": "#c08f85",
                "40": "#b78074",
                "50": "#af7063",
                "60": "#a46254",
                "70": "#824e43",
                "80": "#603a32",
                "90": "#3f2620",
                "100": "#1d110f"
            },
            "success": {
                "5": "#d7faea",
                "10": "#c0f8de",
                "20": "#a9f5d2",
                "30": "#92f3c6",
                "40": "#7bf0ba",
                "50": "#64eeae",
                "60": "#4deba2",
                "70": "#1fe68a",
                "80": "#15bd6f",
                "90": "#108f54",
                "100": "#0b6139"
            },
            "secondary": {
                "5": "#f7fbd6",
                "10": "#f2f8bf",
                "20": "#edf6a8",
                "30": "#e9f391",
                "40": "#e4f17a",
                "50": "#dfee63",
                "60": "#daec4c",
                "70": "#d1e71e",
                "80": "#abbe14",
                "90": "#82900f",
                "100": "#58620a"
            },
            "primary": {
                "5": "#d9c7f3",
                "10": "#cbb2ef",
                "20": "#bd9ceb",
                "30": "#ae87e6",
                "40": "#a072e2",
                "50": "#925ddd",
                "60": "#8448d9",
                "70": "#6929c5",
                "80": "#53209b",
                "90": "#3c1771",
                "100": "#260f46"
            }
        },
        "components": {
            "textInput": {
                "colors": {
                    "background": {
                        "initial": "#2020ea"
                    }
                }
            },
            "button": {
                "colors": {
                    "primary": {
                        "background": {
                            "initial": "#3f17d6"
                        },
                        "foreground": {
                            "initial": "#e11d1d"
                        }
                    },
                    "secondary": {
                        "background": {
                            "initial": "#7c2626"
                        },
                        "foreground": {
                            "initial": "#515055"
                        }
                    },
                    "danger": {
                        "background": {
                            "initial": "#8b2c23"
                        }
                    }
                }
            }
        }
    };

      // Step 3: Create the KYC component
      // const element = await createElement('kyc', { theme: theme });

      const element = await createElement('kyc');

      // Mount the KYC component to the container div
      await element.mount('kyc-container');

      // Set KYC initialized to true to hide the form
      setKycInitialized(true);

      // Event Listeners
      element.on('ready', (event) => {
        if (event.kycStatus === 'INIT') {
          setLoading(false); // Remove loading state
        }
      });

      element.on('success', () => {
        alert('Onboarding successful!');
      });

      element.on('error', (event) => {
        console.error('Onboarding error:', event);
        alert('An error occurred during onboarding. Please try again.');
      });

    } catch (error) {
      console.error('Error initializing SDK or mounting KYC component:', error);
      alert('SDK initialization or KYC component mounting failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-form-container">
      {/* Header */}
      <header className="kyc-header">
      <img 
          src="data:image/jpeg;base64,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mzPQb3Bd3xg7QD1i6CkhVv8AIYf2bh4/7Sm/gsWZ5sz0G/dC+gFtiCA85+aeWOSSqw9hkieS6SFut8bibkxtHlMO3RGsbrjZEUkZaS1wII2gixHWDsV2bLG4nk7SVJvUUsMp4vjY5w6nEXCCm2zoW6ZCZuarEntcWOhp7gvlcCLt3iIEeO7p2D3KxdHkbh8Tg6OhpmuGx3JMuOokXCzgaEEc5ycpo8FoI6alGjK9nJQAf8NgFnSHpF9XFx61Wtz7kkkkm5JOsneSSrsPha7a0HrAK682Z6DfuhBG+ZTIvmVPzqZtqioaCLjxo4jYtbr2Enxj7I3LUc+2RPJSf0jA3xJCBUADyZDsfbcHbCeNuKnoBcPYDqIBHSgpVR1b4pGSxPLHscHMcNrSDcEK0mRGcCmraSOaWWOKXWyVjnBtnttctv8ANNwR19C27mzPQb3BciBo2Nb3BB9EREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf/9k=" 
          alt="airwallex-logo" 
          className="airwallex-logo" 
        />
        <h1>Welcome to Airwallex</h1>
        <p>
        KYC Emdedded component
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className={kycInitialized ? 'hidden' : 'kyc-form'}>
        <h2>Create an account with Airwallex</h2>
        <div className="form-group">
          <label>Connected Account ID (optional):</label>
          <input
            type="text"
            value={connectedAccountId}
            onChange={(e) => setConnectedAccountId(e.target.value)}
            placeholder="acct_xxx..."
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!connectedAccountId.trim()}
          />
        </div>
        <div className="form-group">
          <label>Country Code:</label>
          <input
            type="text"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            required={!connectedAccountId.trim()}
          />
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            Agree to terms and conditions
          </label>
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input type="checkbox" checked={dataUsage} onChange={(e) => setDataUsage(e.target.checked)} />
            Agree to data usage
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : connectedAccountId.trim() ? 'Start KYC' : 'Create Account'}
        </button>
      </form>

      {/* KYC Component Container */}
      <div
        id="kyc-container"
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
        }}
      />
    </div>
  );
};

export default KYCForm;

# Airwallex Embedded Components Demo

This demo implements:
- Airwallex KYC component ([docs](https://www.airwallex.com/docs/global-treasury__kyc-and-onboarding__embedded-kyc-component))
- Airwallex KYC RFI component ([docs](https://www.airwallex.com/docs/connected-accounts__handle-kyc-rfi__embedded-kyc-rfi-component))
- Airwallex Beneficiary component ([docs](https://www.airwallex.com/docs/payouts__embedded-beneficiary-component))
- Airwallex Transfer component ([docs](https://www.airwallex.com/docs/payouts__embedded-transfer-component))

---

## Implementations

- KYC: [KYCForm.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/KYCForm.js)
- KYC RFI: [KYCRFI.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/KYCRFI.js)
- Beneficiary: [BeneficiaryForm.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/BeneficiaryForm.js)
- Transfer: [TransferForm.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/TransferForm.js)

---

## Steps to Run the Application

### Backend setup
1. Navigate to the `backend` folder.
2. Create a `.env` file:
   ```plaintext
   API_CLIENT_ID=your_client_id
   API_KEY=your_api_key
   ```
3. Install dependencies and start:
   ```plaintext
   npm install
   node index.js
   ```

### Frontend setup
1. Navigate to the `frontend` folder.
2. Create a `.env` file:
   ```plaintext
   REACT_APP_API_ENV=demo
   REACT_APP_CLIENT_ID=your_client_id
   REACT_APP_BACKEND_URL=http://localhost:5000
   REACT_APP_KYC_CONNECTED_ACCOUNT_ID=acct_xxx
   REACT_APP_KYC_RFI_CONNECTED_ACCOUNT_ID=acct_xxx
   REACT_APP_BENEFICIARY_CONNECTED_ACCOUNT_ID=acct_xxx
   REACT_APP_TRANSFER_CONNECTED_ACCOUNT_ID=acct_xxx
   ```
3. Install dependencies and start:
   ```plaintext
   npm install
   npm start
   ```

## Connected account IDs per element

Each embedded element can use a different connected account ID:
- KYC: optional input + `REACT_APP_KYC_CONNECTED_ACCOUNT_ID`
- KYC RFI: input + `REACT_APP_KYC_RFI_CONNECTED_ACCOUNT_ID`
- Beneficiary: input + `REACT_APP_BENEFICIARY_CONNECTED_ACCOUNT_ID`
- Transfer: input + `REACT_APP_TRANSFER_CONNECTED_ACCOUNT_ID`

Behavior:
- If a connected account ID is entered, that account is used directly.
- In KYC only, if no account ID is entered, a new connected account is created first.

## Backend auth scope routing

`/api/get-auth-code` now accepts `component` and applies component-specific scopes:
- `kyc` -> `w:awx_action:onboarding`
- `kycRfi` -> `r:awx_action:rfi_view`, `w:awx_action:rfi_edit`
- `beneficiary` -> `w:awx_action:transfers_edit`
- `transfer` -> `w:awx_action:transfers_edit`

Make sure your Airwallex app permissions and account setup match these flows.

## Access each embedded component

### KYC
1. Open `http://localhost:3000`
2. Click `KYC Embedded component`
3. Optional: set connected account ID
4. If no account ID is set, fill email + ISO2 country code
5. Click `Create Account` / `Start KYC`

### KYC RFI
1. Open `http://localhost:3000`
2. Click `KYC RFI`
3. Set/confirm connected account ID
4. Click `Load RFI Component`

### Beneficiary
1. Open `http://localhost:3000`
2. Click `Beneficiary Embedded Component`
3. Set/confirm connected account ID
4. Click `Initialize Beneficiary Form`
5. Complete form and submit

### Transfer
1. Open `http://localhost:3000`
2. Click `Transfer Embedded Component`
3. Set/confirm connected account ID
4. Click `Load with account ID`
5. Complete form and submit (payload is logged in browser console)

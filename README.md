

# Airwallex KYC, Beneficiary and Transfer Embedded Components Implementation

This is an implementation of the:
- Airwallex KYC component as documented in the [Airwallex Documentation](https://www.airwallex.com/docs/global-treasury__kyc-and-onboarding__embedded-kyc-component).
- Airwallex KYC RFI component as documented in the [Airwallex Documentation](https://www.airwallex.com/docs/connected-accounts__handle-kyc-rfi__embedded-kyc-rfi-component).
- Airwallex Beneficiary component as documented in the [Airwallex Documentation](https://www.airwallex.com/docs/payouts__embedded-beneficiary-component).
- Airwallex Transfer component as documented in the [Airwallex Documentation](https://www.airwallex.com/docs/payouts__embedded-transfer-component).


---

# Implementations:

KYC component: [KYCForm.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/KYCForm.js)

KYC RFI component: [KYCRFIForm.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/KYCRFIForm.js)

Beneficiary embedded component: [BeneficiaryForm.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/BeneficiaryForm.js)

Transfer embedded component: [TransferForm.js](https://github.com/evangelos-gkavogiannis-awx/awx-embedded-components/blob/main/frontend/src/TransferForm.js)

---

## Steps to Run the Application

### Backend Setup
1. Navigate to the `backend` folder.
2. Create a `.env` file and add the following:
   ```plaintext
   API_CLIENT_ID=your_client_id
   API_KEY=your_api_key
3. Install dependencies and start the backend server
   ```plaintext
   npm install
   node backend/index.js   

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Create a `.env` file and add the following:
   ```plaintext
   REACT_APP_API_ENV=demo
   REACT_APP_CLIENT_ID=your_client_id
3. make sure the `authPayload` contains the correct scopes
3. For the `BeneficiaryForm.js` and the `TransferForm.js` use a KYC approved connected account
4. Install dependencies and start the frontend server
   ```plaintext
   npm install
   npm start

The `.env` credentials need to be aligned with the Beneficiary/Transfer account or the KYCRFI account

### Access the KYC Embedded component
1. Open a browser and go to `http://localhost:3000`
2. Click on the `KYC Embedded component`
3. Enter `email` and `ISO2 country code` and click Create Account: This will call Airwallex `/accounts/create`, it will create a connected account and trigger the KYC emdedded component

### Access the Beneficiary component
(you need a KYC approved account to add to the `BeneficiaryForm.js`)
1. Open a browser and go to `http://localhost:3000`
2. Click on the `Beneficiary Embedded Component`
3. Select Bank country and account currency
4. Fill in the required fields
5. Click on the submit button: The [Airwallex API - Create Beneficiary](https://www.airwallex.com/docs/api#/Payouts/Beneficiaries/_api_v1_beneficiaries_create/post) will be called and a new beneficiary will be created.  
   (You can check the actual payload sent either from the **API Request Console** on the bottom right corner or from the browser's console)

### Access the Trasnfer component
(you need a KYC approved account to add to the `TransferForm.js`)
1. Open a browser and go to `http://localhost:3000`
2. Click on the `Transfer Embedded Component`
3. Fill in the fields and click on Submit button: the transfer payload will be logged to browser's console can be used to call the [Create a Transfer](https://www.airwallex.com/docs/api#/Payouts/Transfers/_api_v1_transfers_create/post) endpoint






   

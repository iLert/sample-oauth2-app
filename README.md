# iLert Sample OAuth2 App

This repository showcases 3 potential ways to implement an OAuth2 authorization flow
with the iLert OAuth 2.0 Authorization Server.

Visit [the iLert docs](https://docs.ilert.com/rest-api/developing-ilert-apps) to learn more.

## Running the Sample App

- requires Node.js > v14
- `npm install`
- `npm start`
- visit your browser under `http://localhost:4597`
- choose your flow (opening the path will start it)
- an iLert user account is needed to authorize
- (update `/config/default.js` with your apps credentials if needed)

## Authorization Flows

### 1 Authorization Code Flow

The de-facto industry standard, relying on the fact that the `client_secret` is kept secure and is not exposed publicly. See flow in sample app under `/authorize`.


### 2 Authorization Code Flow with Proof Key for Code Exchange (PKCE)

Based on the authorization code flow an additional code verifier is created on the requesting side,
hashed and passed as challenge to the authorization server. When requesting the token for the code,
the verifier is passed again in plaintext and adds additional validition, ensuring that the token request
is coming from the same context as the initial authorization. See flow in sample app under `/authorize?pkce=1`.


### 3 Native / Web-App Authorization Code Flow with Proof Key for Code Exchange (PKCE)

The authorization code flow using PKCE, might be used in native or web apps that cannot use a `client_secret`
as they would expose it. See flow in sample app under `/webapp`.

const port = 4597;
const config = {
    port,
    ilert: {
        host: "https://app.ilert.com",
        clientId: "YOUR-CLIENT-ID",
        clientSecret: "YOUR-CLIENT-SECRET",
        redirectUri: `http://localhost:${port}/authorize-result`,
        scope: "profile source:w",
        authorizeUrl: "/api/developers/oauth2/authorize?client_id={clientId}&response_type=code&redirect_uri={redirectUri}&state={state}&scope={scope}",
        tokenUrl: "/api/developers/oauth2/token"
    }
};

export default config;

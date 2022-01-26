const config = {
    port: 4597,
    ilert: {
        host: "https://app.ilert.com",
        clientId: "sample",
        clientSecret: "YOUR-SECRET",
        redirectUri: "http://localhost:4597/authorize-result",
        scope: "user",
        authorizeUrl: "/api/developers/oauth2/authorize?client_id={clientId}&response_type=code&redirect_uri={redirectUri}&state={state}&scope={scope}",
        tokenUrl: "/api/developers/oauth2/token"
    }
};

export default config;
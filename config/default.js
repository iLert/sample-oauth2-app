const config = {
    port: 4597,
    ilert: {
        host: "http://localhost:8080",
        clientId: "123",
        clientSecret: "456",
        redirectUri: "http://localhost:4597/authorize-result",
        scope: "user",
        authorizeUrl: "/api/developers/oauth2/authorize?client_id={clientId}&response_type=code&redirect_uri={redirectUri}&state={state}&scope={scope}",
        tokenUrl: "/api/developers/oauth2/token"
    }
};

export default config;
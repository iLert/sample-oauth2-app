import express from "express";
import axios from "axios";
import Debug from "debug";
import fs from "fs";
import path from "path";
const debug = Debug("oauth2sample:app");

import {
    generateCodeVerifier,
    getCodeChallengeForVerifier,
    uuid
} from "./oauth2-util.js";

class App {

    constructor(config = {}) {
        this.config = config;
        this.refs = {};
    }

    async run() {

        const app = express();

        app.use((req, _res, next) => {
            debug(req.url);
            next();
        });

        app.get("/", (req, res) => {
            res.json({
                "Authorization Code Flow": "/authorize",
                "Authorization Code Flow with PKCE": "/authorize?pkce=1",
                "Native/Web App Flow with PKCE": "/webapp"
            });
        });

        // STEP 1: build our authorize request and redirect the user's browser to it
        app.get("/authorize", async (req, res) => {

            let url = this.config.ilert.host + this.config.ilert.authorizeUrl;
            url = url.replace("{clientId}", encodeURIComponent(this.config.ilert.clientId));
            url = url.replace("{redirectUri}", encodeURIComponent(this.config.ilert.redirectUri));
            url = url.replace("{scope}", encodeURIComponent(this.config.ilert.scope));

            const state = {
                bla: "some other data"
            };

            // PKCE flow
            if(req.query.pkce) {
                const refId = uuid();
                const verifier = generateCodeVerifier();
                this.refs[refId] = verifier; // store the verifier so that we can check it later in result
                const codeChallenge = getCodeChallengeForVerifier(verifier);
                url += "&code_challenge=" + codeChallenge;
                url += "&code_challenge_method=S256";
                state.refId = refId; // attach the refId to the state, so that we know for which verifier to check later
                // Note: never expose verifier here, that is what the challenge is for
                debug("PKCE ->", refId, verifier, codeChallenge);
            }

            url = url.replace("{state}", encodeURIComponent(JSON.stringify(state)));
            res.redirect(url);
        });

        // STEP 2: iLert redirect's back with a code (or error)
        app.get("/authorize-result", async (req, res) => {

            const error = req.query.error;
            if(error) {
                return res.end("Failed to authorize: " + error + ", please try again");
            }

            const code = req.query.code;
            if(!code) {
                return res.end("Failed to retrieve 'code', please try again");
            }

            const state = req.query.state ? JSON.parse(req.query.state) : {};
            debug(state); // our state has been proxied back :)

            let verifier = null;
            if(state.refId) {
                verifier = this.refs[state.refId];
            }

            const params = new URLSearchParams()
            params.append("client_id", this.config.ilert.clientId);
            params.append("grant_type", "authorization_code");
            params.append("code", code);

            if(verifier) {
                // in PKCE flow client_secret may be omitted, however if you do use PKCE for backend flows you should provide it as well
                params.append("code_verifier", verifier);
                debug("PKCE <-", verifier);
            }

            // clientSecret is only send to iLert using our backend, it must never be exposed to users
            params.append("client_secret", this.config.ilert.clientSecret);

            const url = this.config.ilert.host + this.config.ilert.tokenUrl;
            let result = null;
            try {
                result = await axios.post(url, params, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json"
                    }
                });
            } catch(error) {

                if(error.response) {
                    debug(error.response.data);
                    return res.end("Failed to retrieve token: " + error.message + ", " + JSON.stringify(error.response.data));
                }

                debug(error.message);
                return res.end("Failed to retrieve token: " + error.message);
            }

            debug(result.data);

            // STEP 3: lets try out our access token

            const userUrl = this.config.ilert.host + "/api/users/current";
            let userResult = null;
            try {
                userResult = await axios.get(userUrl, {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": "Bearer " + result.data.access_token
                    }
                });
            } catch(error) {

                if(error.response) {
                    debug(error.response.data);
                    return res.end("Failed to fetch current user: " + error.message + ", " + JSON.stringify(error.response.data));
                }

                debug(error.message);
                return res.end("Failed to fetch current user: " + error.message);
            }

            res.json(userResult.data);
        });

        const webappFile = new URL("../public/sample-app.html", import.meta.url);
        const webappData = fs.readFileSync(webappFile, { encoding: "utf8" });
        app.get("/webapp", async (req, res) => {
            res.header("content-type", "text/html").end(webappData);
        });

        return new Promise((resolve, reject) => {
            this.server = app.listen(this.config.port, (error) => {

                if(error) {
                    reject(error);
                } else {
                    debug("app listening at http://localhost:", this.config.port);
                    resolve(this);
                }
            });
        });
    }
}

export default App;
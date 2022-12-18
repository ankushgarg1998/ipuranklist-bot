require('../config/config');
const axios = require('axios');
var { log } = require('../util/logger');

var GITHUB_BASE_URL = 'https://api.github.com/repos/ankushgarg1998/ipuranklist-instagram-updates/actions/workflows/actions.yml/dispatches';

var getAxiosConfig = function (payload) {
    return {
        method: 'post',
        url: GITHUB_BASE_URL,
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        },
        data: payload
    };
};

var callGitHubActions = function (entryType, message) {
    let pythonScriptPaylod = {
        entryType: entryType,
        message: message,
        environment: process.env.ENVIRONMENT
    };
    let githubActionsAPIPaylad = JSON.stringify({
        "ref": "master",
        "inputs": {
            "payload": JSON.stringify(pythonScriptPaylod)
        }
    });

    log(`Sending Instabot Request to GH Actions: ${pythonScriptPaylod.environment} - ${pythonScriptPaylod.entryType}`)
    axios(getAxiosConfig(githubActionsAPIPaylad))
        .then(function (response) {
            log(`API Response code: ${response.status} : ${response.statusText}`);
        })
        .catch(function (error) {
            console.log(error);
        });
}

module.exports = { callGitHubActions };

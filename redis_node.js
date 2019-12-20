
'use strict';

const express = require('express');
const app = express();
const request = require('superagent');
const redis = require('redis');
const client = redis.createClient(index=1);

const respond = (username, repositories) => {
    return `Users "${username}" has ${repositories} public repositories.`;
};

const getUserRepos = (req, res) => {
    let username = req.query.username;
    request.get(`http://35.240.211.226:7001/event/events?kongsi_id=1&visibility=public&active=true`, function (err, response) {
        if (err) throw err;

        let repoLength = response.body.data_events.length;

        client.setex(username, 3600, repoLength);

        res.send(respond(username, repoLength));
    });
};

function cache(req, res, next) {
    const username = req.query.username;
    client.get(username, function (err, data) {
        if (err) throw err;

        if (data != null) {
            res.send(respond(username, data));
        } else {
            next();
        }
    });
}

app.get('/users', cache, getUserRepos);

app.listen(3000, function () {
    console.log('node-redis app listening on port 3000!')
})
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync(path.join(__dirname, './private.pem'));
const publicKey = fs.readFileSync(path.join(__dirname, './public.pem'));
module.exports = {
    sign(data) {
        try {
            return jwt.sign(data, privateKey, {algorithm: 'RS256'});
        } catch (err) {
            return err;
        }
    },
    verify(token) {
        try {
            return jwt.verify(token, publicKey, {algorithm: 'RS256'});
        } catch (err) {
            return err;
        }

    },
};
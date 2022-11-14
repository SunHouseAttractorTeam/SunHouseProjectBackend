const express = require('express');
const User = require('../models/User');
const config = require('../config');
const axios = require('axios');
const {nanoid} = require("nanoid");
const router = express.Router();
const utils = require('../middleweare/token');


router.post('/',  async (req, res) => {
    try {
        const {email, password, username} = req.body;

        if (!email || !password || !username) {
            return res.status(400).send({error: 'Data not valid'});
        }

        const maxAge = 72 * 60 * 60
        const token = utils.getToken(username, maxAge);

        const userData = {email, password, username, token};
        
        const user = new User(userData);

        res.cookie("jwt", token, {
            httpOnly: false,
            maxAge: maxAge * 1000,
        });

        await user.save();

        return res.status(201).send(user);

    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/sessions', async (req, res) => {
    try {
        if (req.cookies.jwt) {
            const user = await User.findOne({token: req.cookies.jwt});
            return res.send(user)
        }

        const user = await User.findOne({email: req.body.email});

        if (!user) {
            return res.status(401).send({error: 'Credentials are wrong!'});
        } else {

            const isMatch = await user.checkPassword(req.body.password);
            if (!isMatch) {
                res.status(401).send({error: 'Credentials are wrong!'});
            }

            const {username} = user;
            const maxAge = 72 * 60 * 60;
            const token = utils.getToken(username, maxAge)


            res.cookie("jwt", token, {
                httpOnly: false,
                maxAge: maxAge * 1000,
            });

            user.token = token;
            await user.save({validateBeforeSave: false});

            res.send(user);
        }
    } catch (e) {
        res.status(500);
    }
});

router.post('/facebookLogin', async (req, res) => {
    const inputToken = req.body.accessToken;
    const accessToken = config.facebook.appId + '|' + config.facebook.appSecret;

    const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${inputToken}&access_token=${accessToken}`;

    try {
        const response = await axios.get(debugTokenUrl);

        if (response.data.data.error) {
            return res.status(401).send({message: 'Facebook token incorrect!'});
        }

        if (req.body.id !== response.data.data.user_id) {
            return res.status(401).send({message: 'Wrong User ID'});
        }

        let user = await User.findOne({facebookId: req.body.id});

        const {username} = user;
        const maxAge = 2 * 60 * 60;
        const token = utils.getToken(username, maxAge)

        if (!user) {
            user = new User({
                email: req.body.email,
                password: nanoid(),
                facebookId: req.body.id,
                username: req.body.name,
                avatar: req.body.picture.data.url,
            });
        }

        await user.save({validateBeforeSave: false});
        user.token = token;
        return res.send(user);
    } catch (e) {
        return res.status(401).send({message: 'Facebook token incorrect!'});
    }
});

router.delete('/sessions', async (req, res) => {
    const success = {message: 'Success'};
    const cookie = req.cookies.jwt;

    if (!cookie) return res.send(success);

    const user = await User.findOne({token: cookie});

    if (!user) return res.send(success);
    const maxAge = 2 * 60 * 60;

    user.token = utils.getToken(user.username, maxAge);
    await user.save({validateBeforeSave: false});

    return res.send({success, user});
});


module.exports = router;
const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400 //1 dia
    });
}

//registro
router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        if(await User.findOne({ email }))
            return res.status(400).send({ error: 'User already exists.'});

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ 
            user,
            token: generateToken({ id: user.id }),
         });

    } catch (err) {
        return res.status(400).send('register');
    }
});

//autenticacao
router.post('/authenticate', async(req, res)=>{
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user){
       return res.status(400).send({ error: 'User not found' });
    }
    if (!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Invalid password' });
    }
    user.password = undefined;

   res.send({
       user,
       token: generateToken({ id: user.id }),
   });
});

router.post('/forgot_password', async(req, res)=>{
    const { email } = req.body;
    console.log(email);

    try{
        console.log('entrou no try');
        const user = await User.findOne({ email });
        
        if(!user)
            return res.status(400).send({ error: 'User not found'});
        
        console.log('antes do token');
        const token = crypto.randomBytes(20).toString('hex');
        
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set':{
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendEmmail({
            to: email,
            from : 'adria@email.com',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if(err)
                return res.status(400).send({error: 'Cannot send forgot password email'})
            return res.send();
        })

        console.log('-------------------------');
        console.log('token:', token);
        console.log('date expires:', now);
    }catch(err){
        console.log('caiu no catch');
        res.status(400).send({error: 'Erro on forgot password, try again'})
    }
});

module.exports = app => app.use('/auth', router);
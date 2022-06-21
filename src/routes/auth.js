const {Router} = require('express');
const router = Router();
const path = require('path');
const fs = require('fs')
const bcrypt = require('bcrypt');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const {secret} = require('../../config');

const buffer = fs.readFileSync(path.join(__dirname, '../../data/users.json'));
const data = JSON.parse(buffer.toString());
router.post(
    '/registration',
    [
        check('name', 'Must be longer than 2 characters').isLength({ min: 2 }),
        check('email', 'Invalid email address').isEmail(),
        check('email').custom(value => {
            const contain = data.users.find(item => item.email == value);
            if (contain) {
                throw new Error('An account with this email address already exists')
            }
            return true;
        }), 
        check('password', 'Must be longer than 8 characters').isLength({ min: 8 }),
        check('password').custom((value, { req }) => {
            if (value !== req.body.passwordConfirmation) {
                throw new Error('Password confirmation is incorrect');
            }
            return true;
        })
    ],

    async (req, res) => {
    
        try {
            const errors = validationResult(req);
            const errorMessage = errors.errors.map(item => item.msg)

            if (!errors.isEmpty()) {
                return res.status(400).json(errorMessage);
            }
            const {name, email, password} = req.body;
            const hash = bcrypt.hashSync(password, 10);
            const generData = {
                name, 
                email,
                hash,
                role: "user"
            }
            data.users.push(generData);
            
            fs.writeFileSync(path.join(__dirname, '../../data/users.json'), JSON.stringify(data, null, '\t'));
            res.status(200).json({message: 'account is registered'});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'server error'});
        }
    }
);

router.post(
    '/login',
    [
        check('email', 'Invalid email address').isEmail(),
        check('password', 'Must be longer than 8 characters').isLength({ min: 8 })
    ],
    async (req, res) => {
        try {
            const {email, password} = req.body;
            const user = data.users.find(item => item.email == email);
            if (!user) {
                return res.status(400).json({message: 'this email is not registered'});
            }
            const validPassword = bcrypt.compareSync(password, user.hash);
            if (!validPassword) {
                return res.status(400).json({message: 'incorrect password'});
            }

            const generateAccessToken = (email, roles) => {
                const payload = {email, roles};
                return jwt.sign(payload, secret, {expiresIn: '24h'})
            }
            const token = generateAccessToken(user.email, user.roles);
            return res.status(200).json({
                token,
            user: {
                name: user.name,
                email: user.email
            }
        })
        } catch(error) {
            console.log(error);
            res.status(500).json({message: 'server error'});
        }
    }

)

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Get User Profile
router.get('/', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    try {
		const user = await User.findOne({username: req.session.user.username}).lean();
        res.json({message: "User Profile", Username: user.username, Wallet: user.wallet, Share: user.share});
    } catch(err) {
        res.json({message: err})
    }
});

// Create a new User
router.post('/register', async (req, res) => {
	const { username, password: plainTextPassword } = req.body

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	const password = await bcrypt.hash(plainTextPassword, 10)
	const wallet = 0

	try {
		const response = await User.create({
			username,
			password,
			wallet
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
	}


	res.json({ status: 'ok' })
})

// Login a User
router.post('/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

        try {
			const token = jwt.sign(
				{
					id: user._id,
					username: user.username
				},
				process.env.JWT_SECRET
			);

            const updateToken = await User.updateOne(
                { username: user.username },
                { $set: { token: token } }
            );  
			req.session.user = user;
            res.json({status: 'ok', message: "Logged In"});
        } catch (err) {
            res.json({ status: 'error', error: 'Invalid username/password' })
        }
	}
})

// Logout a User
router.delete('/logout', async (req, res) => {
	if(!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    try {
        req.session.destroy();
        res.json({ message: "Logged Out"});
    } catch (err) {
        res.json({ message: err });
    }
})

module.exports = router;
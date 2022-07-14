const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { response } = require('express');
const axios = require('axios');


// Get Live Stock Data
router.get('/:code', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    axios
    .get('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+req.params.code+'/quote')
    .then(resp => {
        const {symbol, companyName, latestPrice} = resp.data;
        res.json({symbol, companyName, latestPrice});
    })
    .catch(error => {
        res.json("Stock not found");
    });
});


// Add Balance to Wallet
router.post('/add', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    if (isNaN(req.body.balance)) {
        return res.json("Invalid Balance");
    }

    try {
        const user = await User.findOne({username: req.session.user.username}).lean()
        const newBalance = user.wallet + req.body.balance;
        const addBalance = await User.updateOne(
            { username: user.username },
            { $set: { wallet: newBalance } }
        );
        res.json({ message: addBalance });
    } catch (err) {
        res.json({ message: err });
    }
});

// Buy Shares 
router.post('/buy/:code', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    if (isNaN(req.body.shares)) {
        return res.json("Invalid Shares");
    }

    async function getStock() {
        const url = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+req.params.code+'/quote';
        let response = await axios.get(url).catch(error => {return "Stock not Found"});
            return response.data;
      }
      
      let stockData = await getStock();

    if (typeof(stockData) != "object") {
        res.json("Invalid Stock Code");
    } else {
        const user = await User.findOne({username: req.session.user.username}).lean()
        if ((stockData.latestPrice * req.body.shares) > user.wallet)
            res.json("Not Enough Balance");
        else {
            try {
                var shareBought = {}
                var newShares = {}
                if (user.share == undefined) {
                    newShares[req.params.code] = req.body.shares;
                }
                else if (!user.share[req.params.code]) {
                    currentShares = user.share
                    shareBought[req.params.code] = req.body.shares;
                    newShares = Object.assign(currentShares, shareBought);
                    console.log(newShares);
                } else {
                    currentShare = user.share[req.params.code]
                    shareBought[req.params.code] = req.body.shares + currentShare;
                    currentShares = user.share
                    newShares = Object.assign(currentShares, shareBought);
                }
                newBalance = user.wallet - (stockData.latestPrice * req.body.shares);
                user.wallet = newBalance;
                const updateShare = await User.updateMany(
                    { username: user.username },
                    { $set: { share: newShares, wallet: user.wallet} }
                );  
                res.json({status: 'ok', message: updateShare});
            } catch (err) {
                res.json({ status: 'error', error: err });
            }
        }
    }
});

// Sell Shares 
router.post('/sell/:code', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    if (isNaN(req.body.shares)) {
        return res.json("Invalid Shares");
    }


    async function getStock() {
        const url = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+req.params.code+'/quote';
        let response = await axios.get(url).catch(error => {return "Stock not Found"});
            return response.data;
      }
      
      let stockData = await getStock();

    if (typeof(stockData) != "object") {
        res.json("Invalid Stock Code");
    } else {
        const user = await User.findOne({username: req.session.user.username}).lean();

        try {
            if (!user.share[req.params.code] || user.share == undefined) {
                res.json("Shares Not Found")
            } else {
                currentShare = user.share[req.params.code]
                if (req.body.shares > currentShare) {
                    res.json("Not Enough Shares")
                } else {

                    currentShares = user.share
                    currentShares[req.params.code] = currentShare - req.body.shares
                    if (currentShares[req.params.code] == 0) {
                        delete currentShares[req.params.code];
                    }
                    newBalance = user.wallet + (stockData.latestPrice * req.body.shares);
                    user.wallet = newBalance;
                    const updateShare = await User.updateMany(
                        { username: user.username },
                        { $set: { share: currentShares, wallet: user.wallet} }
                    );  
                    res.json({status: 'ok', message: "Share Sold / Money added to wallet"});
                }
            }
        } catch (err) {
            res.json({ status: 'error', error: err });
        }
        
    }
});


module.exports = router;


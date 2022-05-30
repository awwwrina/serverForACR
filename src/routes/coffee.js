const {Router} = require('express');
const router = Router();
const path = require('path');
const fs = require('fs')

router.post('/create', async (req, res) => {
    
    try {
        try {
            const buffer = fs.readFileSync(path.join(__dirname, '../../data/db.json'));
            const data = JSON.parse(buffer.toString());
            data.push(req.body)
            console.log(data);

        } catch (err) {
            console.error('no access!');
        }

        res.status(200).json();
    } catch (error) {
        res.status(500).json({message: 'server error'});
    }
});

router.get('/product', async (req, res) => {
    try {
        const buffer = fs.readFileSync(path.join(__dirname, '../../data/db.json'));
        const data = JSON.parse(buffer.toString());
        let limit = +req.query.limit;
        let offset = +req.query.offset;

        //console.log(limit,offset);
        //console.log(data.product.slice(offset, limit));
        const slicedData = data.product.slice(offset, limit)
        //res.send(data.product.slice(offset, limit))
        res.status(200).json(slicedData);
        
    } 
    catch (error) {
        res.status(500).json({message: 'server error'});
    }
});
const buffer = fs.readFileSync(path.join(__dirname, '../../data/db.json'));
const data = JSON.parse(buffer.toString());

router.get('/product/:productId', async (req, res) => {
    try {
        const id = req.params['productId'];
        const currentProduct = data.product.find(item => item.id == id);
        res.status(200).json(currentProduct);

    } catch (error) {
        res.status(500).json({message: 'server error'});
    }
})

module.exports = router;
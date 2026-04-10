const express = require('express');
const router = express.Router();
const CarbonLog = require('../models/CarbonLog');
const auth = require('../middleware/auth'); 


router.post('/add', auth, async (req, res) => {
    try {
        const { activity, amount } = req.body;
        
        
        const newLog = new CarbonLog({
            userId: req.user, 
            activity,
            amount
        });

        const savedLog = await newLog.save();
        res.status(201).json(savedLog);
    } catch (err) {
       
        res.status(400).json({ error: err.message });
    }
});


router.get('/all', auth, async (req, res) => {
    try {
        
        const logs = await CarbonLog.find({ userId: req.user });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
       
        const log = await CarbonLog.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user 
        });

        if (!log) {
            return res.status(404).json({ message: "Log not found or unauthorized" });
        }

        res.json({ message: "Log deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
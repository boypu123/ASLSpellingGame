const express = require('express');
const cors = require('cors')
const Model = require('./edge/run-impulse');
const app = express();
const PORT = 8080;

app.use(cors())

const EdgeImpulseClassifier = Model.EdgeImpulseClassifier;
const classifier = new EdgeImpulseClassifier();

app.use(express.json());

app.get('/test', (req, res) => {
    res.status(200).send({
        status: 'success'
    });
});

app.post('/api', (req, res) => {
    try {
        const {userInput} = req.body;
        if (!userInput) {
            return res.status(400).json({ error: 'userInput is required' });
        }
        let features = userInput.split(',').map(x => Number(x.trim()));
        let result = classifier.classify(features);
        let final = JSON.stringify(result, null, 4);
        res.json({ final });
    } catch (ex) {
        console.error('Failed to classify: ' + (ex.message || ex.toString()));
        res.status(500).json({ error: 'Failed to classify' });
    }
});

app.listen(PORT, () => {
    console.log('Server is alive on http://localhost:8080');
});

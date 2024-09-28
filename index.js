// const express = require('express')
// const { parseIcsFile } = require('./icsHelpers')
// const app = express()
// const port = 3000

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// parseIcsFile('path/to/your/file.ics')
//   .then(events => {
//     console.log(events);
//   })
//   .catch(err => {
//     console.error(err);
//   });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

const express = require('express');
const { findBestCombination } = require('./icsHelpers');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/best-combination', async (req, res) => {
    const { dsGroups, seGroups, mcGroups, groupEvents } = req.body;

    // Error handling for missing parameters
    if (!dsGroups || !seGroups || !mcGroups || !groupEvents) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const result = await findBestCombination(dsGroups, seGroups, mcGroups, groupEvents);
        res.json({
            combination: result.bestCombination,
            conflicts: result.minConflicts
        });
    } catch (error) {
        res.status(500).send('Error calculating conflicts');
    }
});


// Usage example
const groupEvents = {
    DS1: './DS1.ics', 
    DS2: './DS2.ics',
    DS3: './DS3.ics',
    SE1: './SE1.ics',
    SE2: './SE2.ics',
    SE3: './SE3.ics',
    MC1: './MC1.ics',
    MC2: './MC2.ics',
    MC3: './MC3.ics',
    OSL1: './OSL1.ics',
    OSL2: './OSL2.ics',
    DCL1: './DCL1.ics',
    DCL2: './DCL2.ics',
    BUL1: './BUL1.ics',
    BUL2: './BUL2.ics',
    SSL21: './SSL21.ics',
    SSL22: './SSL22.ics',
    SSL23: './SSL23.ics'
};

const dsGroups = ['DS1', 'DS2', 'DS3'];
const seGroups = ['SE1', 'SE2', 'SE3'];
const mcGroups = ['MC1', 'MC2', 'MC3'];
const oslGroups = ['OSL1', 'OSL2'];
const dclGroups = ['DCL1', 'DCL2'];
const bulGroups = ['BUL1', 'BUL2'];
const ssl2Groups = ['SSL21', 'SSL22', 'SSL23'];

findBestCombination(dsGroups, seGroups, mcGroups, oslGroups, dclGroups, bulGroups, ssl2Groups, groupEvents)
    .then(result => {
        console.log(`Best combination: ${result.bestCombination.DS}, ${result.bestCombination.SE}, ${result.bestCombination.MC}, ${result.bestCombination.OSL}, ${result.bestCombination.DCL}, ${result.bestCombination.BUL}, ${result.bestCombination.SSL2}`);
        console.log(`Number of conflicts: ${result.minConflicts}`);
    })
    .catch(err => console.error(err));


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

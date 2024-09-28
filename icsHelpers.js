const ical = require('ical');
const fs = require('fs');

// Function to parse .ics file and extract events
function parseIcsFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(err);
            
            const parsedData = ical.parseICS(data);
            
            const events = Object.values(parsedData)
                .filter(event => event.type === 'VEVENT')
                .map(event => ({
                    summary: event.summary,
                    location: event.location,
                    start: new Date(event.start),
                    end: new Date(event.end)
                }));
                
            resolve(events);
        });
    });
}
// Function to generate all possible combinations of the groups
function generateCombinations(dsGroups, seGroups, mcGroups, oslGroups, dclGroups, bulGroups, ssl2Groups) {
    const combinations = [];
    dsGroups.forEach(ds => {
        seGroups.forEach(se => {
            mcGroups.forEach(mc => {
                oslGroups.forEach(osl => {
                    dclGroups.forEach(dcl => {
                        bulGroups.forEach(bul => {
                            ssl2Groups.forEach(ssl2 => {
                                combinations.push({ DS: ds, SE: se, MC: mc, OSL: osl, DCL: dcl, BUL: bul, SSL2: ssl2 });
                            });
                        });
                    });
                });
            });
        });
    });
    return combinations;
}

// Function to find the best combination with the least conflicts
async function findBestCombination(dsGroups, seGroups, mcGroups, oslGroups, dclGroups, bulGroups, ssl2Groups, groupEvents) {
    const combinations = generateCombinations(dsGroups, seGroups, mcGroups, oslGroups, dclGroups, bulGroups, ssl2Groups);
    let bestCombination = null;
    let minConflicts = Infinity;

    for (const combination of combinations) {
        const conflictCount = await calculateTotalConflicts(combination, groupEvents);
        conflictCount == 0 && console.log(combination, conflictCount);
        if (conflictCount < minConflicts) {
            minConflicts = conflictCount;
            bestCombination = combination;
        }
    }

    return { bestCombination, minConflicts };
}

// Function to check if two events conflict
function hasConflict(event1, event2) {
    return event1.start < event2.end && event1.end > event2.start;
}

// Function to calculate the number of conflicts between two event lists
function calculateConflicts(events1, events2) {
    let conflictCount = 0;
    events1.forEach(event1 => {
        events2.forEach(event2 => {
            if (hasConflict(event1, event2)) conflictCount++;
        });
    });
    return conflictCount;
}

// Function to calculate total conflicts for a given combination
async function calculateTotalConflicts(combination, groupEvents) {
    const dsEvents = await parseIcsFile(groupEvents[combination.DS]);
    const seEvents = await parseIcsFile(groupEvents[combination.SE]);
    const mcEvents = await parseIcsFile(groupEvents[combination.MC]);
    const oslEvents = await parseIcsFile(groupEvents[combination.OSL]);
    const dclEvents = await parseIcsFile(groupEvents[combination.DCL]);
    const bulEvents = await parseIcsFile(groupEvents[combination.BUL]);
    const ssl2Events = await parseIcsFile(groupEvents[combination.SSL2]);

    let totalConflicts = 0;
    totalConflicts += calculateConflicts(dsEvents, seEvents);
    totalConflicts += calculateConflicts(dsEvents, mcEvents);
    totalConflicts += calculateConflicts(dsEvents, oslEvents);
    totalConflicts += calculateConflicts(dsEvents, dclEvents);
    totalConflicts += calculateConflicts(dsEvents, bulEvents);
    totalConflicts += calculateConflicts(dsEvents, ssl2Events);

    totalConflicts += calculateConflicts(seEvents, mcEvents);
    totalConflicts += calculateConflicts(seEvents, oslEvents);
    totalConflicts += calculateConflicts(seEvents, dclEvents);
    totalConflicts += calculateConflicts(seEvents, bulEvents);
    totalConflicts += calculateConflicts(seEvents, ssl2Events);

    totalConflicts += calculateConflicts(mcEvents, oslEvents);
    totalConflicts += calculateConflicts(mcEvents, dclEvents);
    totalConflicts += calculateConflicts(mcEvents, bulEvents);
    totalConflicts += calculateConflicts(mcEvents, ssl2Events);

    totalConflicts += calculateConflicts(oslEvents, dclEvents);
    totalConflicts += calculateConflicts(oslEvents, bulEvents);
    totalConflicts += calculateConflicts(oslEvents, ssl2Events);

    totalConflicts += calculateConflicts(dclEvents, bulEvents);
    totalConflicts += calculateConflicts(dclEvents, ssl2Events);

    totalConflicts += calculateConflicts(bulEvents, ssl2Events);

    return totalConflicts;
}



module.exports = { findBestCombination };

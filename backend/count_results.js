const results = require('../mobile-app/src/data/biochemistry_results.json');
console.log('Total records in mobile-app json:', results.length);

const adminResults = require('../admin-panel/src/data/biochemistry_results.json');
console.log('Total records in admin-panel json:', adminResults.length);

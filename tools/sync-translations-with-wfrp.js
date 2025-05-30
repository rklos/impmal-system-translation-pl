import fs from 'fs';

async function updateTranslations() {
    try {
        // Read local JSON file
        const localJson = JSON.parse(fs.readFileSync('./src/lang/warhammer-library.json', 'utf8'));
        
        // Fetch remote JSON file
        const response = await fetch('https://raw.githubusercontent.com/silentmark/wfrp4e-core-pl/main/lang/pl.json');
        const remoteJson = await response.json();
        
        // Track changed translations
        const changedTranslations = [];
        
        // Function to recursively search and update values
        function updateNestedValues(localObj, remoteObj, path = '') {
            for (const key in localObj) {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (typeof localObj[key] === 'object' && localObj[key] !== null) {
                    if (remoteObj[key]) {
                        updateNestedValues(localObj[key], remoteObj[key], currentPath);
                    }
                } else if (typeof localObj[key] === 'string' && remoteObj[key]) {
                    if (localObj[key] !== remoteObj[key]) {
                        changedTranslations.push({
                            path: currentPath,
                            old: localObj[key],
                            new: remoteObj[key]
                        });
                        localObj[key] = remoteObj[key];
                    }
                }
            }
        }
        
        // Update values
        updateNestedValues(localJson, remoteJson);
        
        // Write updated JSON back to file
        fs.writeFileSync('./src/lang/warhammer-library.json', JSON.stringify(localJson, null, 2));
        
        // Report changes
        if (changedTranslations.length > 0) {
            console.log('\nUpdated translations:');
            changedTranslations.forEach(({path, old, new: newValue}) => {
                console.log(`\n${path}:`);
                console.log(`  Old: "${old}"`);
                console.log(`  New: "${newValue}"`);
            });
            console.log(`\nTotal translations updated: ${changedTranslations.length}`);
        } else {
            console.log('No translations were updated');
        }
    } catch (error) {
        console.error('Error updating translations:', error);
    }
}

updateTranslations();

const { Comuna, Region } = require('./models');

async function checkData() {
    try {
        const regions = await Region.count();
        const comunas = await Comuna.count();
        console.log(`Regions count: ${regions}`);
        console.log(`Comunas count: ${comunas}`);
        
        if (regions > 0) {
            const firstRegion = await Region.findOne();
            console.log('First Region:', JSON.stringify(firstRegion, null, 2));
        }
        if (comunas > 0) {
            const firstComuna = await Comuna.findOne();
            console.log('First Comuna:', JSON.stringify(firstComuna, null, 2));
        }

    } catch (error) {
        console.error('Error checking data:', error);
    }
}

checkData();

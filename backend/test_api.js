
async function testFilters() {
    const baseUrl = 'http://localhost:5000/api/transactions';

    console.log('--- Testing Filters ---');

    // Helper for fetch
    const get = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    };

    // 1. Test Filter Options
    try {
        console.log('\nFetching Filter Options...');
        const data = await get(`${baseUrl}/options`);
        console.log('Regions:', data.regions?.slice(0, 5));
        console.log('Categories:', data.categories?.slice(0, 5));
        console.log('Tags:', data.tags?.slice(0, 5));
    } catch (err) {
        console.error('Error fetching options:', err.message);
    }

    // 2. Test Gender Filter
    try {
        console.log('\nTesting Gender=male...');
        const maleData = await get(`${baseUrl}?gender=male`);
        console.log(`Total Sales (male): ${maleData.pagination.total}`);
        const sampleMale = maleData.data[0];
        console.log('Sample Male Record Gender:', sampleMale?.gender);

        console.log('\nTesting Gender=female...');
        const femaleData = await get(`${baseUrl}?gender=female`);
        console.log(`Total Sales (female): ${femaleData.pagination.total}`);
    } catch (err) {
        console.error('Error testing gender:', err.message);
    }

    // 3. Test Region Filter
    try {
        console.log('\nTesting Region Filter (using first available)...');
        // Re-fetch options to pick one
        const data = await get(`${baseUrl}/filters`);
        const region = data.regions?.[0];
        if (region) {
            console.log(`Filtering by Region: ${region}`);
            const regionData = await get(`${baseUrl}?customerRegion=${encodeURIComponent(region)}`);
            console.log(`Total Sales (${region}): ${regionData.pagination.total}`);
            const sampleRegion = regionData.data[0];
            console.log('Sample Region Record:', sampleRegion?.customerRegion);
        } else {
            console.log('No regions found to test.');
        }
    } catch (err) {
        console.error('Error testing region:', err.message);
    }
}

testFilters();

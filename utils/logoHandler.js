const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOGOS_DIR = path.join(__dirname, '../logos');

if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR);
}

async function downloadLogo(teamName, logoUrl) {
    const sanitizedTeamName = teamName.replace(/[^a-zA-Z0-9]/g, '_');
    const logoPath = path.join(LOGOS_DIR, `${sanitizedTeamName}.png`);

    if (fs.existsSync(logoPath)) {
        return `/logos/${sanitizedTeamName}.png`;
    }

    try {
        const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(logoPath, response.data);
        return `/logos/${sanitizedTeamName}.png`;
    } catch (error) {
        console.error(`Error downloading logo for ${teamName}:`, error.message);
        return '/logos/default.png';
    }
}

module.exports = { downloadLogo };
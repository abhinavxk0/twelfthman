const axios = require('axios');
const { downloadLogo } = require('../utils/logoHandler');

module.exports = async(req, res) => {
    try {
        const response = await axios.get('https://api.football-data.org/v4/competitions', {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        const competitionsWithLogos = await Promise.all(
            response.data.competitions.map(async(competition) => {
                const logoPath = await downloadLogo(competition.name, competition.emblem);
                return {...competition, logo: logoPath };
            })
        );

        res.json(competitionsWithLogos);
    } catch (error) {
        console.error('Error fetching competitions:', error.message);
        res.status(500).json({ error: 'Error fetching competitions', details: error.message });
    }
};
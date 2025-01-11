const axios = require('axios');
const { downloadLogo } = require('../utils/logoHandler');

module.exports = async(req, res) => {
    const competitionId = req.query.competitionId;

    try {
        const response = await axios.get(
            `https://api.football-data.org/v4/competitions/${competitionId}/matches`, { headers: { 'X-Auth-Token': process.env.APITOKEN } }
        );

        const upcomingMatches = response.data.matches
            .filter((match) => new Date(match.utcDate) > new Date())
            .slice(0, 5);

        const matchesWithLogos = await Promise.all(
            upcomingMatches.map(async(match) => {
                const homeLogo = await downloadLogo(match.homeTeam.name, match.homeTeam.crest);
                const awayLogo = await downloadLogo(match.awayTeam.name, match.awayTeam.crest);
                return {
                    ...match,
                    homeTeam: {...match.homeTeam, logo: homeLogo },
                    awayTeam: {...match.awayTeam, logo: awayLogo },
                };
            })
        );

        res.json(matchesWithLogos);
    } catch (error) {
        console.error(`Error fetching matches for competition ${competitionId}:`, error.message);
        res.status(500).json({ error: 'Error fetching matches', details: error.message });
    }
};
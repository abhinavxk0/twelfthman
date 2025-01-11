const axios = require('axios');

module.exports = async(req, res) => {
    const teamId = req.query.id;

    try {
        const response = await axios.get(`https://api.football-data.org/v4/teams/${teamId}/matches`, {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        const matches = response.data.matches;
        const now = new Date();
        const pastMatches = matches.filter((match) => new Date(match.utcDate) < now && match.status === 'FINISHED');
        const upcomingMatches = matches.filter((match) => new Date(match.utcDate) >= now);

        pastMatches.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
        upcomingMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

        res.json({
            next5: upcomingMatches.slice(0, 5),
            last5: pastMatches.slice(0, 5),
        });
    } catch (error) {
        console.error(`Error fetching team matches for ID ${teamId}:`, error.message);
        res.status(500).json({ error: 'Error fetching team matches', details: error.message });
    }
};
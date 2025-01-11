const axios = require('axios');

module.exports = async(req, res) => {
    const teamName = req.query.name.toLowerCase();

    try {
        const response = await axios.get('https://api.football-data.org/v4/teams/', {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        const teams = response.data.teams.filter((team) =>
            team.name.toLowerCase().includes(teamName)
        );

        res.json(teams);
    } catch (error) {
        console.error('Error fetching team data:', error.message);
        res.status(500).json({ error: 'Error fetching teams', details: error.message });
    }
};
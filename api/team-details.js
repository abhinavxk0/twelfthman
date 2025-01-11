const axios = require('axios');

module.exports = async(req, res) => {
    const teamId = req.query.id;

    try {
        const response = await axios.get(`https://api.football-data.org/v4/teams/${teamId}`, {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching team details for ID ${teamId}:`, error.message);
        res.status(500).json({ error: 'Error fetching team details', details: error.message });
    }
};
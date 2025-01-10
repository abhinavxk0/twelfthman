const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config()
const app = express();
const PORT = 3000;
const LOGOS_DIR = path.join(__dirname, 'logos');

app.use(express.static('public'));
app.use(cors());

if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR);
}

// Fetch competitions from Football Data API
app.get('/competitions', async(req, res) => {
    try {
        const response = await axios.get('https://api.football-data.org/v4/competitions', {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        // Download logos for each competition and attach the logo path
        const competitionsWithLogos = await Promise.all(response.data.competitions.map(async competition => {
            const logoPath = await downloadLogo(competition.name, competition.emblem);
            return {...competition, logo: logoPath };
        }));

        res.json(competitionsWithLogos);
    } catch (error) {
        console.error('Error fetching competitions:', error.message);
        res.status(500).json({ error: 'Error fetching competitions', details: error.message });
    }
});

// Fetch next 5 matches for a specific competition
app.get('/matches/:competitionId', async(req, res) => {
    const competitionId = req.params.competitionId;

    try {
        const response = await axios.get(
            `https://api.football-data.org/v4/competitions/${competitionId}/matches`, { headers: { 'X-Auth-Token': process.env.APITOKEN } }
        );

        const upcomingMatches = response.data.matches
            .filter(match => new Date(match.utcDate) > new Date())
            .slice(0, 5);

        if (upcomingMatches.length === 0) {
            return res.json({
                matches: 'No upcoming matches.'
            });
        }

        const matchesWithLogos = await Promise.all(upcomingMatches.map(async match => {
            const homeLogo = await downloadLogo(match.homeTeam.name, match.homeTeam.crest);
            const awayLogo = await downloadLogo(match.awayTeam.name, match.awayTeam.crest);
            return {
                ...match,
                homeTeam: {...match.homeTeam, logo: homeLogo },
                awayTeam: {...match.awayTeam, logo: awayLogo }
            };
        }));

        res.json(matchesWithLogos);
    } catch (error) {
        console.error(`Error fetching matches for competition ${competitionId}:`, error.message);
        res.status(500).json({ error: 'Error fetching matches', details: error.message });
    }
});
app.get('/teams/search', async(req, res) => {
    const teamName = req.query.name.toLowerCase(); // Normalize input for case-insensitivity

    try {
        const response = await axios.get('https://api.football-data.org/v4/teams/?limit=500', {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        const teams = response.data.teams.filter(team =>
            team.name.toLowerCase().includes(teamName)
        );

        res.json(teams);
    } catch (error) {
        console.error('Error fetching team data:', error.message);
        res.status(500).json({ error: 'Error fetching teams', details: error.message });
    }
});

app.get('/teams/:id', async(req, res) => {
    const teamId = req.params.id;

    try {
        const response = await axios.get(`https://api.football-data.org/v4/teams/${teamId}`, {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching team details for ID ${teamId}:`, error.message);
        res.status(500).json({ error: 'Error fetching team details', details: error.message });
    }
});

app.get('/teams/:id/matches', async(req, res) => {
    const teamId = req.params.id;
    try {
        const response = await axios.get(`https://api.football-data.org/v4/teams/${teamId}/matches`, {
            headers: { 'X-Auth-Token': process.env.APITOKEN }
        });

        const matches = response.data.matches;
        const now = new Date();
        const pastMatches = matches.filter(match => new Date(match.utcDate) < now && match.status === 'FINISHED');
        const upcomingMatches = matches.filter(match => new Date(match.utcDate) >= now);


        pastMatches.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
        upcomingMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));


        const last5Matches = pastMatches.slice(0, 5);
        const next5Matches = upcomingMatches.slice(0, 5);

        if (last5Matches.length === 0) {
            return res.json({
                matches: 'No upcoming matches.'
            });
        }
        if (next5Matches.length === 0) {
            return res.json({
                matches: 'No upcoming matches.'
            });
        }


        res.json({ next5: next5Matches, last5: last5Matches });
    } catch (error) {
        console.error(`Error fetching team details for ID ${teamId}:`, error.message);
        res.status(500).json({ error: 'Error fetching team details', details: error.message });
    }
})

// Download and cache competition logos
async function downloadLogo(teamName, logoUrl) {
    const logoPath = path.join(LOGOS_DIR, `${teamName.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
    if (fs.existsSync(logoPath)) {
        return `/logos/${teamName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    }
    try {
        const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(logoPath, response.data);
        console.log(`Logo downloaded: ${teamName}`);
        return `/logos/${teamName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    } catch (error) {
        console.error(`Error downloading logo for ${teamName}:`, error.message);
        return '/logos/default.png'; // Return a default logo if there's an error
    }
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
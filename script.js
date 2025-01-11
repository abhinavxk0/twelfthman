const baseUrl = 'https://twelfthman.vercel.app/api';

// Check if the page is being loaded fresh or reloaded
if (!sessionStorage.getItem("isReloaded")) {
    // If it's not reloaded, mark it as reloaded and set the redirect
    sessionStorage.setItem("isReloaded", "true");

    // Redirect after a set timeout
    setTimeout(() => {
        window.location.href = "/splashscreen/splashscreen.html"; // Adjust path as needed
    }); // Redirect after 5 seconds
} else {
    // Clear the session storage once the page has been loaded after the redirect
    sessionStorage.removeItem("isReloaded");
}

document.addEventListener('DOMContentLoaded', async() => {
    const competitionsDiv = document.getElementById('competitions');
    const matchesDiv = document.getElementById('matches');
    const upcomingMessage = document.getElementById('upcomingmatches');
    const competitionMessage = document.getElementById('comps');
    const loadingMatches = document.getElementById('loadingmatches');
    const loadButton = document.getElementById('searchByCompetitions');
    const mainmenudiv = document.getElementById('mainmenu');
    const searchByTeamsButton = document.getElementById('searchByTeams');
    const teamSearchContainer = document.getElementById('team-search-container');
    const searchTeamButton = document.getElementById('search-team-button');
    const teamsearchresults = document.getElementById('search-results');


    // Add this inside the DOMContentLoaded listener
    searchByTeamsButton.addEventListener('click', () => {
        // Toggle the visibility of the search box
        teamSearchContainer.style.display = 'block';
    });

    // Add this inside the DOMContentLoaded listener
    document.getElementById('team-search-box').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { // Check if the Enter key is pressed
            event.preventDefault(); // Prevent form submission if it's inside a form
            searchTeamButton.click(); // Simulate a click on the search button
        }
    });


    searchTeamButton.addEventListener('click', async() => {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = `<p style="font-family: Poppins, sans-serif;">
  <img src="loading/loading.gif" alt="Loading" style="vertical-align: middle; height:28px"> 
  Loading results...
</p>
`;
        const teamName = document.getElementById('team-search-box').value.trim();

        if (teamName) {
            try {
                const response = await fetch(`${baseUrl}/teams/search?name=${teamName}`);
                const teamData = await response.json();

                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = ''; // Clear previous results

                if (teamData.length > 0) {
                    teamData.forEach(team => {
                        const teamElement = document.createElement('div');
                        teamElement.classList.add('team-result');

                        const crestImg = document.createElement('img');
                        crestImg.src = team.crest || '/logos/default.png';
                        crestImg.alt = `${team.name} Crest`;
                        crestImg.style.width = '50px';
                        crestImg.style.height = '50px';
                        teamElement.appendChild(crestImg);

                        const teamNameElement = document.createElement('h3');
                        teamNameElement.textContent = team.name;
                        teamElement.appendChild(teamNameElement);

                        teamElement.addEventListener('click', () => fetchTeamDetails(team.id));

                        resultsContainer.appendChild(teamElement);
                    });
                } else {
                    resultsContainer.innerHTML = '<p>No teams found!</p>';
                }
            } catch (error) {
                console.error('Error fetching team data:', error);
            }
        } else {
            alert('Please enter a team name.');
        }
    });

    async function fetchTeamDetails(teamId) {
        try {
            const response = await fetch(`${baseUrl}/teams/${teamId}`);
            const teamDetails = await response.json();
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = ''; // Clear previous results

            const detailsElement = document.createElement('div');
            detailsElement.classList.add('team-details');

            detailsElement.innerHTML = `
                <h2>${teamDetails.name}</h2>
                <a href="${teamDetails.website}" target="_blank"><img src="${teamDetails.crest}" alt="${teamDetails.name}" style="width:100px; height:100px;"></a>
                <p><strong>Since</strong> ${teamDetails.founded}</p>
                <p><strong>Venue:</strong> ${teamDetails.venue}</p>
                <p><strong>Coach:</strong> ${teamDetails.coach.name} from ${teamDetails.coach.contract.start}</p>
            `;


            resultsContainer.appendChild(detailsElement);
        } catch (error) {
            console.error('Error fetching team details:', error);
        }
    }

    async function fetchCompetitions() {
        mainmenudiv.remove();
        searchByTeamsButton.remove();
        teamSearchContainer.remove();
        searchTeamButton.remove();
        teamsearchresults.remove();
        try {
            competitionMessage.innerHTML = `<p style="font-family: Poppins, sans-serif;">
  <img src="loading/loading.gif" alt="Loading" style="vertical-align: middle; height:28px"> 
  Loading competitions...
</p>
`;

            const response = await fetch(`${baseUrl}/competitions`);
            const competitions = await response.json();
            competitionMessage.textContent = '✦ Football Competitions ✦';

            competitionsDiv.innerHTML = '';

            competitions.forEach(competition => {
                const button = document.createElement('button');
                button.textContent = ''; // Clear any default text

                // Create a div to hold the logo and name
                const container = document.createElement('div');
                container.style.textAlign = 'center'; // Centers the content inside the button

                // Add logo to the container
                const img = document.createElement('img');
                img.src = competition.emblem; // Use the logo URL fetched from the server
                img.alt = competition.name; // Use the competition name as alt text
                img.width = 100;
                img.height = 100; // Adjust size as necessary
                container.appendChild(img);

                // Add competition name below the image
                const name = document.createElement('div');
                name.textContent = competition.name;
                name.style.marginTop = '10px'; // Add some space between the logo and name
                container.appendChild(name);

                button.appendChild(container); // Add the container with image and name to the button

                button.onclick = () => fetchMatches(competition.id);
                competitionsDiv.appendChild(button);
            });

        } catch (error) {
            console.error('Error during fetching competitions:', error.message);
            competitionMessage.textContent = 'Error loading competitions.';
        }
    }

    async function fetchMatches(competitionId) {
        try {
            upcomingMessage.innerHTML = `<p style="font-family: Poppins, sans-serif;">
            <img src="loading/loading.gif" alt="Loading" style="vertical-align: middle; height:28px"> 
            Loading matches...
          </p>
          `;
            const response = await fetch(`${baseUrl}/matches/${competitionId}`);
            const data = await response.json();

            if (data.matches == 'No upcoming matches.') {
                upcomingMessage.textContent = 'No upcoming matches for this competition.';
            } else {
                upcomingMessage.textContent = "✦ Upcoming Matches ✦";
                matchesDiv.innerHTML = '';
                if (data.message) {
                    const noMatchesMessage = document.createElement('p');
                    noMatchesMessage.textContent = data.message;
                    matchesDiv.appendChild(noMatchesMessage);
                    return;
                }

                loadingMatches.textContent = '';

                data.forEach(match => {
                    const matchButton = document.createElement('button');
                    matchButton.classList.add('match-button');
                    const formattedDate = new Date(match.utcDate).toLocaleString('en-US', {
                        weekday: 'long', // Day of the week (e.g., 'Monday')
                        year: 'numeric', // Full year (e.g., 2025)
                        month: 'long', // Full month name (e.g., 'January')
                        day: 'numeric', // Day of the month (e.g., 3)
                        hour: '2-digit', // 12-hour format hour (e.g., 02 or 2)
                        minute: '2-digit', // 2-digit minutes (e.g., 30)
                        hour12: true // Use 12-hour clock (AM/PM)
                    });
                    matchButton.innerHTML = `
                            <div class="match-info">
                            <img src="${match.homeTeam.logo}" alt="Home Team Logo">
                            <div class="match-teams">
                            <p><strong>${match.homeTeam.name}</strong></p>
                            <p><strong>vs</strong></p>
                            <p><strong>${match.awayTeam.name}</strong></p>
                            </div>
                            <img src="${match.awayTeam.logo}" alt="Away Team Logo">
                            </div>
                            <p class="match-time"><strong>${formattedDate}</strong></p>
                    `;

                    matchButton.onclick = () => {
                        localStorage.setItem('selectedMatch', JSON.stringify(match));
                        window.location.href = 'match-details.html';
                    };

                    matchesDiv.appendChild(matchButton);
                })
            }

        } catch (error) {
            console.error('Error fetching matches:', error.message);
            upcomingMessage.textContent = 'Error loading matches.';
        }
    }

    loadButton.addEventListener('click', fetchCompetitions);
});
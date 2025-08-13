# BookinGuru Assignment

Paste the following in your .env file:
```
PORT=3000
NODE_ENV=development
DB_NAME=database.sqlite
POLLUTION_API_BASE_URL=https://be-recruitment-task.onrender.com
POLLUTION_API_PASSWORD=testpass
POLLUTION_API_USERNAME=testuser
POLLUTION_API_CACHE_TIMEOUT=60000
WIKIPEDIA_API_BASE_URL=https://en.wikipedia.org/api/rest_v1
```

Things I've implemented:

1. CRON job to fetch cities data from the third-party API
   - Reason: If we implement this directly in user requests, our API will fail when the third-party API fails
   - Solution: Fetch data from the third-party API at specific intervals and store it in the database

2. CRON job to fetch descriptions from Wikipedia
   - Instead of calling the Wikipedia API every time, I've created a batch process that fetches data for specific cities and stores it in the database, reducing frequent Wikipedia API calls

3. Corrupt and invalid state data validation
   - I've implemented a 3-layer validation for city validation. First, we check if the city is valid using the `isValidCityName.js` file. If the city is valid, we call the Wikipedia API. If the Wikipedia API doesn't respond with the given city name, we simply mark it as invalid in the database

4. `/cities` API has 3 validations:
   - Country code validation: Only [PL, DE, FR, ES] are allowed
   - Limit validation
   - Page number validation
   - It will respond as expected given in the assignment

FAQ:
- Have you used AI?

→ Yes, I've used AI to write the code. I completed this project using Vibe coding, but the logic and architecture were designed by me only.

- Is this a production-grade app?

→ Yes, it is production-grade, but I've used SQLite database for this assignment. We can use a better database for a production-grade app.

→ I've implemented logging with Winston that provides detailed descriptions and error logs as expected in a production app.

→ The architecture is scalable - we can easily add new APIs, controllers, models, and cron jobs.

→ Even for the database, I've written migrations so anyone can start the project, run migrations, and have a ready-to-use project.

---

How to install and start the project:

1. Clone the project
2. Run `npm i`
3. Run `npm run db:migrate`

The code is ready to use!



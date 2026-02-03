# Enarc Exchange
## Overview
* **Enarc Exchange** is a prediction market specifically for the University of Texas at Dallas. As a student, you can bet (using Temoc Tokens, not real money) on academics, sports, and really anything having to do with UTD! Think that the average grade for linear algebra this semseter will be an A? Bet on it!
## MVP
* **Auth:** 
    * Users should be restricted to only those with @utdallas.edu emails
    * Simple authentication with email/password and JWT
    * Upon signup, a new user is issued 500 tokens
* **Market:**
    * Markets should be able to be created
    * Markets should have betting and pricing functionality (LMSR)
    * Markets should be able to be resolved and distribute tokens
* **Real Time Data:**
    * Markets should update with live data using websockets
    * Markets should have live chat feed
* **Profiles:**
    * Should have CRUD functionality for accessing user specific data (P/L, active bets, closed bets, etc.)
## Stretch Goals
* **Integration with UTD Data:** For markets where it applies, say for instance there's a market on what the dining hall will serve on a given day, we pull data from [here](https://dineoncampus.com/utdallasdining/whats-on-the-menu/comet-pi-the-market-dhw/) to determine the resolution instead of doing it manually
* **Automatic AI Generated Markets:** Integrate with Gemini or another LLM, give it context for UTD and prompt it for what markets make sense. Make it automatically run if the number of markets drops below a certain threshold, so we never have zero available markets to bet on.
* **Leaderboard:** Show the most successful traders based on profits
* **Containerization:** Ideally we get to containerize this using Docker, but we may just not have time to get to it
## Tech Stack
* **API:** Node/Express
* **DB:** PostgreSQL
* **Websockets:** Socket.io
* **Auth:** JWT
* **AI Features:** Gemini Flash
* **Containerization:** Docker
* **Documentation:** Swagger
* **Deployment:** AWS (EC2 and RDS)
* **Testing:**
    * Jest (unit tests)
    * Postman (API testing)
* **Frontend:** Next.js *(This is a backend project, but it would be nice to actually visualize what yall are building. If anyone wants the experience they can do this, otherwise I'll throw something together towards the end.)*
## Resources
* [Intro to Rest APIs (just first 2 mins and 30 seconds)](https://www.youtube.com/watch?v=-MTSQjw5DrM)
* [JWT Intro](https://www.youtube.com/watch?v=mbsmsi7l3r4)
* [Node/Express/Typescript part 1](https://www.youtube.com/watch?v=NYZKUTGC51g)
* [Node/Express/Typescript part 2](https://www.youtube.com/watch?v=8Dv9yWAJ6ww)
* [Node/Express/Typescript part 3](https://www.youtube.com/watch?v=dr8e6Nh1llk)
* [Chat/Sockets Example](https://www.youtube.com/watch?v=jD7FnbI76Hg)
* [Deploying to EC2](https://www.youtube.com/watch?v=T-Pum2TraX4)
* [Intro to Database Design](https://www.youtube.com/watch?v=5RpUmDEsn1k)
* [AWS RDS](https://www.youtube.com/watch?v=I_fTQTsz2nQ)
* [Swagger Documentation Generator (I haven't tried this, so if it doesn't work we'll just do it manually. This is a good use case for AI)](https://www.youtube.com/watch?v=Ck-CoNNn89g)
* [LMSR Primer 1](http://blog.oddhead.com/2006/10/30/implementing-hansons-market-maker/)
* [LMSR Primer 2](https://gnosis-pm-js.readthedocs.io/en/v1.3.0/lmsr-primer.html)
* [Example LMSR JS Implementation](https://github.com/cdetrio/prediction-market-lmsr)
* [LMSR demo](https://cdetr.io/prediction-market-lmsr/index.html)
## Timeline
*this is subject to change*
* **Week 1:** PostgreSQL schema design, Express server initialization
* **Week 2:** Authentication and begining to set up token economy/market logic
* **Week 3:** Prediction market core logic
* **Week 4:** Real time features (sockets)
* **Week 5:** Stretch goals and testing
* **Week 6:** Containerization and deployment

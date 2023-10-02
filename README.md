# video-stream-app

## Run Backend:

### Requirements
- Node.js
- Docker-Desktop

### Initialize DB (necessary at the first start):
- Use the docker-compose file in 'dev-db' to start the db in Docker
- Wait until it is up and running
- Open dir 'video-data-service' in a terminal
- Run 'npm i'
- Run 'npx prisma migrate dev'
- Directory 'db-data' will be generated automatically. This directory contains the db-files.
- Use the docker-compose file in 'dev-db' to stop the database.

### Run all Backend Components
- Run 'npm run start' in the project root directory.


## Run Frontend:
- Run 'npm i' in the 'frontend'-directory.
- Run 'npm run start' in the same directory.

# carbon-api

This project provides an API for managing [carbon](https://github.com/alphalumen-hackathon/carbon) credits.

## Getting started

1. Clone this repository to your local machine:
   ```sh
   git clone https://github.com/alphalumen-hackathon/carbon-api
   ```
2. Change your working directory to the project folder:
   ```sh
   cd carbon-api
   ```
3. Install the dependencies:
   ```sh
   npm i
   ```
4. Add a .env file with your database URL:
   ```
   touch .env
   echo 'DB_URL="mysql://user:password@url:port/db_name"' >> .env
   echo 'SESSION_SECRET="strong_password_here"' >> .env
   ```
5. Ensure the database has the latest schema:
   ```sh
   npx prisma migrate dev
   ```
6. To run the application, execute the following command:
   ```sh
   npm start
   ```

   This will start the server on port 3000.

## API Documentation

This document provides information about the API routes and their functionalities in the provided code. The API is designed for user authentication, user actions, and managing user credit logs.

### `POST /signup`

#### Description
This route allows a user to sign up by creating a new account with a username and password.

#### Request
- Method: POST
- Content-Type: application/json
- Request Body:
  - `username` (string): The desired username for the new user.
  - `password` (string): The password for the new user.

#### Response
- Status Code 201 (Created) - A successful user registration.
- Status Code 500 (Internal Server Error) - An error occurred while creating the user.

### `POST /signin`

#### Description
This route allows a user to sign in by providing their username and password.

#### Request
- Method: POST
- Content-Type: application/json
- Request Body:
  - `username` (string): The username of the user.
  - `password` (string): The password of the user.

#### Response
- Status Code 200 (OK) - Successful authentication. The user session is established.
- Status Code 403 (Forbidden) - Authentication failed due to bad credentials.
- Status Code 500 (Internal Server Error) - An error occurred during authentication.

### `GET /feed`

#### Description
This route retrieves a feed of credit logs for the authenticated user and users they follow. It requires user authentication.

#### Request
- Method: GET
- Authentication: User session (requires prior sign-in)

#### Response
- Status Code 200 (OK) - Successful retrieval of the user's feed.
- Status Code 401 (Unauthorized) - User not authenticated.
- Status Code 404 (Not Found) - User not found.
- Status Code 500 (Internal Server Error) - An error occurred during feed retrieval.

### `GET /follow/:username`

#### Description
This route allows the authenticated user to follow another user by their username.

#### Request
- Method: GET
- Authentication: User session (requires prior sign-in)
- Route Parameter:
  - `username` (string): The username of the user to follow.

#### Response
- Status Code 200 (OK) - Successful follow operation.
- Status Code 400 (Bad Request) - Users cannot follow themselves.
- Status Code 401 (Unauthorized) - User not authenticated.
- Status Code 404 (Not Found) - Either the user or the target user not found.
- Status Code 500 (Internal Server Error) - An error occurred during the follow operation.

### `GET /credit/list`

#### Description
This route retrieves a list of credit logs associated with the authenticated user.

#### Request
- Method: GET
- Authentication: User session (requires prior sign-in)

#### Response
- Status Code 200 (OK) - Successful retrieval of the user's credit logs.
- Status Code 401 (Unauthorized) - User not authenticated.
- Status Code 404 (Not Found) - User not found.
- Status Code 500 (Internal Server Error) - An error occurred during credit log retrieval.

### `POST /credit/log`

#### Description
This route allows the authenticated user to create a new credit log.

#### Request
- Method: POST
- Content-Type: application/json
- Authentication: User session (requires prior sign-in)
- Request Body:
  - `amount` (number): The amount associated with the credit log.
  - `type` (string): The type of the credit log.
  - `startLng` (number): The starting longitude.
  - `startLat` (number): The starting latitude.
  - `startAddr` (string): The starting address.
  - `endLng` (number): The ending longitude.
  - `endLat` (number): The ending latitude.
  - `endAddr` (string): The ending address.

#### Response
- Status Code 201 (Created) - Successful creation of the credit log.
- Status Code 401 (Unauthorized) - User not authenticated.
- Status Code 404 (Not Found) - User not found.
- Status Code 500 (Internal Server Error) - An error occurred during credit log creation.

Please make sure to follow the request and response guidelines for each API route. Proper authentication is required for routes that involve user-specific data or actions.

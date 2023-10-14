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

Note that any error status will come along a JSON with an `error` key which will describe the error, and if applied, its causes.

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
  - Response Body:
    - `cookie` (object):
      - `originalMaxAge` (number): The original maximum age of the session cookie.
      - `expires` (string): The timestamp when the session cookie expires.
      - `httpOnly` (boolean): Indicates if the cookie is HTTP-only.
      - `path` (string): The path for the cookie.
    - `authenticated` (boolean): true
    - `user` (object):
      - `username` (string): The username of the authenticated user.
- Status Code 400 (Bad Request) - Invalid request data.
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
  - Response Body:
    - `cookie` (object):
      - `originalMaxAge` (number): The original maximum age of the session cookie.
      - `expires` (string): The timestamp when the session cookie expires.
      - `httpOnly` (boolean): Indicates if the cookie is HTTP-only.
      - `path` (string): The path for the cookie.
    - `authenticated` (boolean): true
    - `user` (object):
      - `username` (string): The username of the authenticated user.
- Status Code 400 (Bad Request) - Invalid request data.
- Status Code 403 (Forbidden) - Authentication failed due to bad credentials.
- Status Code 500 (Internal Server Error) - An error occurred during authentication.

### `POST /signout`

#### Description
This route allows an authenticated user to sign out, clearing their session and logging them out.

#### Request
- Method: POST
- Authentication: User session (requires prior sign-in)

#### Response
- Status Code 200 (OK) - User signed out successfully.
- Status Code 401 (Unauthorized) - User not authenticated.
- Status Code 500 (Internal Server Error) - An error occurred during signout.

### `GET /feed`

#### Description
This route retrieves a feed of credit logs for the authenticated user and users they follow. It requires user authentication.

#### Request
- Method: GET
- Authentication: User session (requires prior sign-in)

#### Response
- Status Code 200 (OK) - Successful retrieval of the user's feed.
  - Response Body:
    - Array of credit logs:
      - `amount` (number): The amount associated with the credit log.
      - `createdAt` (string): The timestamp of the credit log creation.
      - `type` (string): The type of the credit log.
      - `user` (object):
        - `username` (string): The username of the user who created the log.
      - `following` (boolean): Indicates if the log is from a user the authenticated user follows.
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

### `GET /unfollow/:username`

#### Description
This route allows the authenticated user to unfollow another user by their username.

#### Request
- Method: GET
- Authentication: User session (requires prior sign-in)
- Route Parameter:
  - `username` (string): The username of the user to unfollow.

#### Response
- Status Code 200 (OK) - Successful unfollow operation.
- Status Code 400 (Bad Request) - Invalid request data.
- Status Code 401 (Unauthorized) - User not authenticated.
- Status Code 500 (Internal Server Error) - An error occurred during the unfollow operation.

### `GET /credit/list`

#### Description
This route retrieves a list of credit logs associated with the authenticated user.

#### Request
- Method: GET
- Authentication: User session (requires prior sign-in)

#### Response
- Status Code 200 (OK) - Successful retrieval of the user's credit logs.
  - Response Body:
    - Array of credit logs:
      - `amount` (number): The amount associated with the credit log.
      - `createdAt` (string): The timestamp of the credit log creation.
      - `type` (string): The type of the credit log.
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

#### Response
- Status Code 201 (Created) - Successful creation of the credit log.
  - Response Body:
    - `amount` (number): The amount associated with the credit log.
    - `createdAt` (string): The timestamp of the credit log creation.
    - `type` (string): The type of the credit log.
- Status Code 400 (Bad Request) - Invalid request data.
- Status Code 401 (Unauthorized) - User not authenticated.
- Status Code 404 (Not Found) - User not found.
- Status Code 500 (Internal Server Error) - An error occurred during credit log creation.

Please make sure to follow the request and response guidelines for each API route. Proper authentication is required for routes that involve user-specific data or actions.

## Technologies Used

The carbon-api project utilizes a variety of technologies and libraries to create a robust web API for managing carbon credits. Below is a list of the key technologies and dependencies used in this project:

### [Prisma](https://www.prisma.io/)

- **Usage**: Prisma is used to interact with the database, manage data models, and perform database operations.

### [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)

- **Usage**: Bcrypt is used to securely hash and compare user passwords for authentication.

### [dotenv](https://github.com/motdotla/dotenv)

- **Usage**: dotenv is used to load environment variables, such as the database URL and session secret, from a .env file.

### [Express](https://expressjs.com/)

- **Usage**: Express is the foundation of the API, handling routing, request handling, and middleware.

### [express-session](https://github.com/expressjs/session)

- **Usage**: express-session is used to manage user sessions, including user authentication and session storage.

### [zod](https://github.com/colinhacks/zod)

- **Usage**: Zod is used for defining and validating the request and response data schemas for the API routes.

### [TypeScript](https://www.typescriptlang.org/)

- **Usage**: TypeScript is used for type-checking and improving code maintainability.

These technologies and dependencies collectively enable the carbon-api project to provide user registration, authentication, and credit log management through a secure and efficient API.

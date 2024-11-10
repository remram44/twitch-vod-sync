setup steps:
- Clone the repo
- Download node v10 from https://nodejs.org/en/download/prebuilt-installer
- Run `npm install`
- Run `npm start`, then navigate to `localhost:3000`
- This will redirect you to twitch, for auth -- and then it will redirect back to the production website for security reasons.
- Copy the access_token out of the URL and go back to localhost, e.g.:
`http://localhost:3000/#access_token=abcdefghijklmnopqrstuvwxyz&scope=&token_type=bearer`

- You should now be all set for development. Edit files, refresh the page, click buttons, repeat.

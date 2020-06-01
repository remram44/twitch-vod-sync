Twitch VOD Sync
===============

This is a web application that can show multiple recorded videos from Twitch, syncing them exactly.

If you want to see the streams of multiple people playing together, applications like [MultiTwitch.tv](http://www.multitwitch.tv/) ([GitHub](https://github.com/bhamrick/multitwitch)) or Twitch's own "Squad Stream" mode can help. However if you are watching the streams after the fact (or after the event) or if the streams are not exactly synced (because they use different delays, common in competitions) it won't work.

This application can bring up multiple VOD (recorded streams), obtain their starting date from the API, and show them in perfect sync. You will still need to input the appropriate delay for each stream if different.

Work in progress!
-----------------

Unfortunately this project is not yet complete.

* [x] Show the **real timestamp** while playing Twitch videos (obtained from API)
* [ ] Show multiple Twitch videos in the same browser tab
* [ ] Play the stream synced

FAQ
---

### Why do I need to give access to my Twitch account?

Unfortunately I can only get the creation date for a video from the API, not the embed system, and the API needs authorization. Note that I am requesting no permissions on your account, I just query the video API on your behalf. This is also a static web app so I am not collecting the access token (it stays in your browser).

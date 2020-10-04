# mVoter Cloud Functions

This repo contains code for updating and deploying mechanism for mVoter 2020 mobile applications. 
This is open sourced for educational purpose, and because we believe that softwares made with public money should be publicly available. Read more on [Public Money, Public Code](https://publiccode.asia/) here.

## Requirements
- NodeJS version 10
- Firebase CLI

## Setup environment
- Download your own serviceAccount.json from Firebase Console and put it in `./functions`.
- Create `keys.json` file in `./functions` and add the following.

```json
{
  "hash": "YOUR_OWN_SECRET_KEY"
}
```

## What this does? (Background)

By running this on Firebase cloud function, we give 4 endpoints for the developers to work with between forced and relaxed updates.

`/ios/update`
`/android/update` endpoints are embedded in end user's application to ping whenever there is a update and the function compares if there is
a forced update between the user's current version and latest version ranges. It sends back the self updating links with a special `is_forced_update` flag.

`/ios/deploy` and `/android/deploy` endpoints are mainly used for Developers. Android app altogether with special flags, uploads the APK file on build time to self-hosted
storage. iOS app however does the same thing but instead it will only point to App Store.

## Contributing

You're welcomed to submit issues and pull requests as long as you adhere to Github community guideline. Any form of contribution is welcomed, from typo error to submitting a new feature.

## Download

The app can be downloaded from [Play Store](https://play.google.com/store/apps/details?id=com.popstack.mvoter2015). If your phone doesn't have Play Store, you can also manually download the apk from [our website](https://mvoterapp.com/).
The app can also be used from the [Web](https://web.mvoterapp.com).

## License

```
    mVoter 2020
    Copyright (C) 2020 PopStack

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

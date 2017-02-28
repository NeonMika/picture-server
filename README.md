# picture-server

## Prepare

Install node JS (e.g. via your package manager according to https://nodejs.org/en/download/package-manager/)

## How to build?

Run 'gulp'

This starts a continous build script. You can leave it running in the back while developing, it will automatically detect changes and trigger a build for every change.

If this does not work, most likely gulp has to be installed using 'sudo npm install -g gulp'

## How to configure?

Edit src/config.json.

You can edit following fields:

owner: The owner that should be shown on the page

## How to run?

Run 'gulp server'

## How to access?

Access via http://localhost:8080/

## How to set up as a systemd service on Linux?

1.) Copy the file picture-server.service to /etc/systemd/system/

2.) Run systemctl enable picture-server.service
The service should start automatically after rebooting the machine.

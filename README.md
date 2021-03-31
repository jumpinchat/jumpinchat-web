# JumpInChat Web server and Client

API server, used by the [homepage](https://github.com/jumpinchat/jumpinchat-homepage) and client.
The client itself is also maintained in this repository under [./react-client](./react-client)

## Contents
1. [Installation and setup](#installation-and-setup)
1. [Development](#development)
    1. [Requirements](#requirements)
    1. [Running locally](#running-locally)
    1. [Preparing for deployment](#preparing-for-deployment)
    1. [Testing](#testing)
    1. [Storybooks](#storybooks)

## Installation and setup

```
# install nvm and setup to use node version defined in .nvmrc
nvm install
nvm use

# install Yarn via your preferred method
yarn install --frozen-lockfile
```

Note: [FontAwesome V5](https://fontawesome.com/plans/standard) is required, and will require a subscription to
access certain icons.


## Development

### Requirements

Requires Node.js v10+

Ideally use [node version manager (nvm)](https://github.com/nvm-sh/nvm). Running `nvm install && nvm use` should set the version to one best suited for the project, based on `.nvmrc`.

Local environment variables are set in `nodemon.json`

### Dependencies

Install via yarn `yarn install --frozen-lockfile`

### Running locally

1. start local mongodb
2. start local redis
3. start local janus instance (requires deploy scripts: jumpinchat/jumpinchat-deploy)
```bash
cd /working/directory/jumpinchat-deploy
docker-compose -f docker-compose.yml -f local-compose.yml up janus
```
4. start local server:

```bash
# run nodemon, output piped to bunyan to format logs
npx nodemon | npx bunyan
```

### Preparing for deployment

At present, the mechanism for deploying the production-ready code is to create an archive containing the compiled code and store it in remote storage. The artifact will then be downloaded and unpacked during the build process of the docker image. This mechanism used a CI server, a locally hosted [Jenkins](https://www.jenkins.io/) server in my case, which did so on each push to `master`.

The scripts for uploading the artifact are located in [./build](./build)


### Testing

client tests are run via `npx jest`

server tests are run via `npm run test` or `yarn test`, using mocha.

### Storybooks

client storybooks are available by running `npm run storybook`, and is set to run at port `6001`

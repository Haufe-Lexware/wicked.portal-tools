# Development Tooling

## Prerequisites

The tool chain for setting up a wicked development environment has primarily been tested on macOS 10.13, and may have issues on other operating systems. If you run into issues, please feel free to report them, or even file pull requests against this repository.

Still, the following are the current known prerequisites:

* node.js 8
* A `bash` compatible shell
* A recent Docker installation, presumably Docker for Mac or Docker for Windows, or a `docker` installation (with `docker-compose`) on Linux
* `git`
* A good internet connection
* [PM2](http://pm2.keymetrics.io) installed globally: `npm install -g pm2`
* **Important**: Your local machine needs an IPv4 address, such as a `10.x`, a `192.168.x` or similar; this means you cannot develop wicked without being connected to a network of some kind.

## Setting up the environment

### Step 1: Clone all the repositories

To get your wicked development environment up and running as fast as possible, perform the following steps in a new blank directory, which is presumed to be called `wicked` here:

```bash
~/Projects$ mkdir wicked
~/Projects/wicked$ cd wicked
~/Projects/wicked$ git clone https://github.com/apim-haufe-io/wicked.portal-tools
...
~/Projects/wicked$ cd wicked.portal-tools
~/Projects/wicked/wicked.portal-tools$ git checkout wicked_1_0 # This will be removed later
~/Projects/wicked/wicked.portal-tools$ cd development
~/Projects/wicked/wicked.portal-tools/development$ ./checkout.sh <branch> --install
```

Please replace `<branch>` with the branch you want to check out. Please note that these scripts will only work as intended for wicked 1.0 and later, and not for the 0.x releases. As soon as wicked 1.0.0 has been released, the usual branch will be `next`, and until then, use

```
~/Projects/wicked/wicked.portal-tools/development$ ./checkout.sh wicked_1_0 --install
```

This will checkout all repositories which are needed to run wicked locally, plus install all the necessary `node_modules`. This may take a while, but it's mostly only the first time.

### Step 2: Build a local Kong image

As wicked adds a couple of minor things to the original Kong docker image, you will need to build your Kong image locally before you can start it:

```
~/Projects/wicked/wicked.portal-tools/development$ ./build-kong.sh
```

This will create a local docker image (on your machine) called `wicked.kong:local`; this image will be referenced to in the next step (in the [`docker-compose.yml`](docker-compose.yml) file).

### Step 3: Start a local Postgres, Redis and Kong instances

Now it's assumed that you have a local `docker` daemon running, and that you have a recent `docker-compose` binary in your path. Then just run:

```bash
~/Projects/wicked/wicked.portal-tools/development$ docker-compose up -d
Creating network "development_default" with the default driver
Creating development_redis_1         ... done
Creating development_kong-database_1 ... done
Creating development_kong_1          ... done
```

**NOTE**: This assumes that the ports 5432 (Postgres), 6379 (Redis), 8000 and 8001 (Kong) are not already used on your local machine.

### Step 4: Use pm2 to start wicked locally

Now you can start wicked using pm2:

```
~/Projects/wicked/wicked.portal-tools/development$ pm2 start wicked-pm2.config.js 
[PM2][WARN] Applications portal-api, portal, portal-kong-adapter, portal-auth not running, starting...
[PM2] App [portal-api] launched (1 instances)
[PM2] App [portal] launched (1 instances)
[PM2] App [portal-kong-adapter] launched (1 instances)
[PM2] App [portal-auth] launched (1 instances)
┌─────────────────────┬────┬──────┬───────┬────────┬─────────┬────────┬─────┬───────────┬─────────┬──────────┐
│ App name            │ id │ mode │ pid   │ status │ restart │ uptime │ cpu │ mem       │ user    │ watching │
├─────────────────────┼────┼──────┼───────┼────────┼─────────┼────────┼─────┼───────────┼─────────┼──────────┤
│ portal              │ 1  │ fork │ 44863 │ online │ 0       │ 0s     │ 23% │ 20.8 MB   │ martind │ disabled │
│ portal-api          │ 0  │ fork │ 44862 │ online │ 0       │ 0s     │ 37% │ 22.9 MB   │ martind │ disabled │
│ portal-auth         │ 3  │ fork │ 44870 │ online │ 0       │ 0s     │ 14% │ 18.3 MB   │ martind │ disabled │
│ portal-kong-adapter │ 2  │ fork │ 44868 │ online │ 0       │ 0s     │ 21% │ 20.4 MB   │ martind │ disabled │
└─────────────────────┴────┴──────┴───────┴────────┴─────────┴────────┴─────┴───────────┴─────────┴──────────┘
```

The API portal will be available at [http://localhost:3000](http://localhost:3000). Note that the wicked portal will immediately redirect to the IP address of your local machine instead of using the `localhost` alias. This has various reasons, the most important one being that Kong must be able to reach the services run via pm2, such as `portal-api:3001`. This is only possible if Kong actually knows the local IP.

## Now what?

Now that you have a local development environment of wicked running, you can start developing. It's assumed that you have check in rights to the `apim-haufe-io` repositories, and that you are allowed to create a branch. If this is not the case, you will still be able to work locally, or with a fork, but that's not covered here.

### Branching off for features

Features are usually implemented on a separate branch, and not on the main branch (which is usually `next`, but currently it's `wicked_1_0`). Feel free to bash Martin in case he doesn't do that in the future, but currently many things go directly into `wicked_1_0`, as it's very much work in progress.

Still, you make sure that your repository/your repositories you want to change are up to date (pulled), and then you branch off the HEAD of the main branch to create your new branch:

```
~/Projects/wicked/wicked.portal$ git status
On branch wicked_1_0
Your branch is up-to-date with 'origin/wicked_1_0'.
~/Projects/wicked/wicked.portal$ git checkout -b my_new_feature
```

Do this for all repositories you need to change for your feature, **always name the branch the same**.

Now you can use the `checkout.sh` script to switch between features fairly easily; the following assumes you are working on a feature for `wicked_1_0`, and you have branched off that branch for your own work. Now you can check out your own branch by using this:

```
~/Projects/wicked/wicked.portal-tools/development$ ./checkout my_new_feature --install --pull --fallback wicked_1_0
```

This will check out your branch, in case it's present, and if it is not, fall back to the `wicked_1_0` branch (or `next`, or `master`, in that order). Please note that without the `--fallback` option, `checkout.sh` will fall back to the `next` branch, which currently (for wicked 1.0.0) is probably not desirable.

### Checking state of development environment

Use the following command to check the state of your development environment:

```
~/Projects/wicked/wicked.portal-tools/development$ ./checkout.sh --info
==== STARTING ==== ./checkout.sh

Repository                     Branch               Dirty    Needs push
------------------------------------------------------------------------
wicked.portal                  wicked_1_0           Yes                
wicked.portal-api              wicked_1_0           Yes                
wicked.portal-chatbot          next                 Yes                
wicked.portal-env              wicked_1_0                              
wicked.portal-kong-adapter     wicked_1_0           Yes                
wicked.portal-mailer           wicked_1_0           Yes                
wicked.portal-kickstarter      wicked_1_0           Yes                
wicked.portal-auth             next                 Yes                
wicked.k8s-init                next                 Yes                
wicked.portal-test             wicked_1_0           Yes                
wicked.kong                    wicked_1_0           Yes                
wicked.k8s-tool                next                                    
wicked.portal-test             wicked_1_0           Yes                
wicked.node-sdk                wicked_1_0                              
wicked-sample-config           wicked_1_0                              
------------------------------------------------------------------------

==========================
SUCCESS: ./checkout.sh
==========================
```

This enables you to see at one glance where you have open changes ("Dirty") or where you might have forgot to push changes. **Important**: This is not any kind of magic, this is just a more convenient way of iterating over the repositories and running `git status -s` and `git cherry -v`, but it gives a nice overview. Wicked is a little beast to work with, but this makes it easier.

## Working with pm2 and docker

When developing locally with the help of `pm2` and `docker`, you will need to familiarize yourself a little with the tools. This section contains a couple of use cases and how you may solve them.

### Kill the database and start over

To start over completely with a fresh database for wicked and Kong, issue the following commands:

```
~/Projects/wicked/wicked.portal-tools/development$ pm2 kill # This kills all running pm2 daemons and processes
~/Projects/wicked/wicked.portal-tools/development$ docker-compose down # Kill the containers, kill network
```

Now you can restart everything again:

```
~/Projects/wicked/wicked.portal-tools/development$ docker-compose up -d
~/Projects/wicked/wicked.portal-tools/development$ pm2 start wicked-pm2.config.js
```

### Debug in a node component

Debugging in a node component is sometimes convenient, e.g. when running from Visual Studio Code. To do that, first stop the node process for the component you want to debug from in `pm2`:

```
~/Projects/wicked/wicked.portal-tools/development$ pm2 stop portal # as an example
```

Now you can run the debugger e.g. from VS Code, just as usual.

#### Debugging portal-api

In order to be able to debug in `wicked.portal-api`, you will have to make sure your debugger sets a series of environment variables correctly, to make sure the portal API is able to start correctly. You can retrieve the data from [wicked-pm2.config.js](wicked-pm2.config.js); the following variables need to be defined:

* `NODE_ENV=localhost`
* `PORTAL_CONFIG_BASE=../wicked-sample-config`
* Optionally: `DEBUG`; set to `*` to make it output *lots* of information

The env var `PORTAL_CONFIG_BASE` can be set to something else, but this is the sample configuration repository which usually works for development. If you want to test other configurations, go ahead and change this to use your own configuration.

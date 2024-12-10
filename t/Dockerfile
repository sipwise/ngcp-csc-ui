# DOCKER_NAME=ngcp-csc-ui-bookworm
FROM docker.mgm.sipwise.com/sipwise-bookworm:latest

# Important! Update this no-op ENV variable when this Dockerfile
# is updated with the current date. It will force refresh of all
# of the base images and things like `apt-get update` won't be using
# old cached versions when the Dockerfile is built.
ENV REFRESHED_AT 2024-12-10

ENV NODE_PATH=/usr/lib/nodejs:/usr/share/nodejs
ENV DEBIAN_FRONTEND noninteractive
ENV DISPLAY=:0

# files that get-code generates
COPY t/sources.list.d/builddeps.list /etc/apt/sources.list.d/
COPY t/sources.list.d/preferences /etc/apt/preferences.d/

RUN apt-get update && apt-get install --assume-yes --no-install-recommends \
    g++ \
    make \
    nodejs \
    python3

RUN echo "cd /code && ./t/testrunner" >/root/.bash_history

# we cannot use /code/ here otherwise it will be 'mounted over' with following 'docker run'
COPY package.json /tmp/
COPY yarn.lock /tmp/
COPY .yarn/releases/yarn-1.22.22.js /tmp/yarn
COPY README.md /tmp/
WORKDIR /tmp
RUN ./yarn install

WORKDIR /code

################################################################################
# Instructions for usage
# ----------------------
# When you want to build the base image from scratch
# (jump to the next section if you don't want to build yourself!):
#
# you need to put the proper NGCP sources at t/sources.list.d/builddeps.list
# for instance, trunk:
# echo "deb https://deb.sipwise.com/autobuild/ release-trunk-bookworm main" > t/sources.list.d/builddeps.list
#
# NOTE: run the following command from root folder of git repository:
# % docker build --tag="ngcp-csc-ui-bookworm" -f ./t/Dockerfile .
# % docker run --rm -i -t -v $(pwd):/code:ro ngcp-csc-ui-bookworm:latest bash
#
# Use the existing docker image:
# % docker pull docker.mgm.sipwise.com/ngcp-csc-ui-bookworm
# NOTE: run the following command from root folder of git repository:
# % docker run --rm -i -t -v $(pwd):/code:ro -v /results docker.mgm.sipwise.com/ngcp-csc-ui-bookworm:latest bash
#
# Inside docker:
#   cd /code && ./t/testrunner
################################################################################

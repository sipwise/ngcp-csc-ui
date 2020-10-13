#!/bin/bash

set -e

readonly DOCKER_GLOBAL_IMAGE_NAME='docker.mgm.sipwise.com/ngcp-csc-ui-env-buster:latest'
readonly DOCKER_LOCAL_IMAGE_NAME='ngcp-csc-ui-env-buster:latest'

echo "Running CSC UI dev environment in Docker"

if [ $# -eq 0 ] || { [ $# -eq 1 ] && [ "$1" = "local" ]; }; then
  echo "Error: please pass the Sipwise VoIP server IP or its domain name as the CLI argument to this script" >&2
  exit 1
fi

if [ "$1" = "local" ]; then
  shift
  DOCKER_IMAGE_NAME="${DOCKER_LOCAL_IMAGE_NAME}"
else
  DOCKER_IMAGE_NAME="${DOCKER_GLOBAL_IMAGE_NAME}"
  docker pull "${DOCKER_IMAGE_NAME}"
fi

#export MSYS_NO_PATHCONV=1    # might be used to solve automatic path transformation in Git Bash console on Windows platform
                              # try to use "/$PWD..." instead of "$(pwd)..." with Git Bash on Win

ARGS=( "$@" )

docker run --rm -p 8080:8080 -i -t -v "/${PWD}:/code:rw" "${DOCKER_IMAGE_NAME}" env/run_csc_ui "${ARGS[@]}"


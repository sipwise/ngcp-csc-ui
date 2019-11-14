# DOCKER_NAME=ngcp-csc-ui-selenium-test-buster
FROM docker.mgm.sipwise.com/sipwise-buster:latest

# Important! Update this no-op ENV variable when this Dockerfile
# is updated with the current date. It will force refresh of all
# of the base images and things like `apt-get update` won't be using
# old cached versions when the Dockerfile is built.
ENV REFRESHED_AT 2019-10-13

RUN apt-get update
RUN apt-get install --assume-yes \
        curl \
        devscripts \
        fluxbox \
        git \
        libdbus-glib-1-2 \
        libgtk-3-0 \
        lsof \
        net-tools \
        procps \
        python3 \
        python3-nose2 \
        python3-selenium \
        vim-tiny \
        tigervnc-standalone-server \
        wget \
        x11vnc \
        xterm

RUN adduser --disabled-password --gecos=Selenium-User selenium

WORKDIR /home/selenium/

# geckodriver: currently version 0.26
RUN wget https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz && \
    tar xvf geckodriver-v0.26.0-linux64.tar.gz && \
    ln -s /home/selenium/geckodriver /usr/bin/geckodriver && \
    rm -f geckodriver-v0.26.0-linux64.tar.gz

# firefox: lang=en_US currently version 70.0.1
RUN wget https://ftp.mozilla.org/pub/firefox/releases/70.0.1/linux-x86_64/en-US/firefox-70.0.1.tar.bz2 && \
    tar xvf firefox-70.0.1.tar.bz2 && \
    ln -s /home/selenium/firefox/firefox /usr/bin/firefox && \
    rm -f firefox-70.0.1.tar.bz2

RUN echo "cd /code && ./t/selenium/testrunner 1.2.3.4 /code/ tap" >/home/selenium/.bash_history
RUN echo "su - selenium" >/root/.bash_history
EXPOSE 5999

COPY t/selenium/jenkins_docker_run /home/selenium/

################################################################################
# Instructions for usage
# ----------------------
# When you want to build the base image from scratch (jump to the next section if you don't want to build yourself!):
# NOTE: run the following command from root folder of git repository:
# % docker build --tag="ngcp-csc-ui-selenium-test-buster" -f t/selenium/Dockerfile .
# % docker run --rm -p 5999:5999 --shm-size 4g -i -t -v ~/Dokumente/ngcp-csc-ui:/code:rw ngcp-csc-ui-selenium-test-buster bash
#
# Use the existing docker image:
# % docker pull docker.mgm.sipwise.com/ngcp-csc-ui-selenium-test-buster
# % docker run --rm -p 5999:5999 -i -t -v $(pwd):/code:rw docker.mgm.sipwise.com/ngcp-csc-ui-selenium-test-buster:latest bash
#
# Inside docker:
#   su - selenium
#   cd /code && ./t/selenium/testrunner $IP_OF_NGCP_SYSTEM # IP_OF_NGCP_SYSTEM can be e.g. IP of a `vagrant up ce-trunk` system (eth1)
#
# On host (where vncviewer can be e.g. from Debian package tigervnc-viewer):
# % vncviewer geometry=1280x1024x16 localhost:5999
################################################################################

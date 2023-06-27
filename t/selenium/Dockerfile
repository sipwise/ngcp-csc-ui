# DOCKER_NAME=ngcp-csc-ui-selenium-test-bookworm
FROM docker.mgm.sipwise.com/sipwise-bookworm:latest

# Important! Update this no-op ENV variable when this Dockerfile
# is updated with the current date. It will force refresh of all
# of the base images and things like `apt-get update` won't be using
# old cached versions when the Dockerfile is built.
ENV REFRESHED_AT 2023-06-26

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
        python3-pip \
        vim-tiny \
        tigervnc-standalone-server \
        wget \
        xterm

RUN adduser --disabled-password --gecos=Selenium-User selenium

WORKDIR /home/selenium/

# installing geckodriver (0.26)
RUN wget http://deb.sipwise.com/files/geckodriver-v0.26.0-linux64.tar.gz && \
    tar xvf geckodriver-v0.26.0-linux64.tar.gz && \
    ln -s /home/selenium/geckodriver /usr/bin/geckodriver && \
    rm -f geckodriver-v0.26.0-linux64.tar.gz

# installing firefox (lang=en_US) (70.0.1)
RUN wget http://deb.sipwise.com/files/firefox-70.0.1.tar.bz2 && \
    tar xvf firefox-70.0.1.tar.bz2 && \
    ln -s /home/selenium/firefox/firefox /usr/bin/firefox && \
    rm -f firefox-70.0.1.tar.bz2

# installing nose2 (0.9.1), coverage (4.5.4) and selenium (3.141.0) via pip
# considering to package latest version of python3-nose2/selenium/coverage as .deb package
# installing coverage first to satisfy dependency for nose2
RUN wget http://deb.sipwise.com/files/nose2-0.9.1.tar.gz && \
    wget http://deb.sipwise.com/files/selenium-3.141.0.tar.gz && \
    wget http://deb.sipwise.com/files/coverage-4.5.4.tar.gz && \
    pip3 install --break-system-packages coverage-4.5.4.tar.gz && \
    pip3 install --break-system-packages nose2-0.9.1.tar.gz selenium-3.141.0.tar.gz && \
    rm -f nose2-0.9.1.tar.gz selenium-3.141.0.tar.gz coverage-4.5.4.tar.gz

RUN echo "cd /code && ./t/selenium/testrunner 1.2.3.4 /code/ tap" >/home/selenium/.bash_history
RUN echo "su - selenium" >/root/.bash_history
EXPOSE 5999

COPY t/selenium/jenkins_docker_run /home/selenium/

################################################################################
# Instructions for usage
# ----------------------
# When you want to build the base image from scratch (jump to the next section if you don't want to build yourself!):
# NOTE: run the following command from root folder of git repository:
# % docker build --tag="ngcp-csc-ui-selenium-test-bookworm" -f t/selenium/Dockerfile .
# % docker run --rm -p 5999:5999 --shm-size 4g -i -t -v ~/Dokumente/ngcp-csc-ui:/code:rw ngcp-csc-ui-selenium-test-bookworm bash
#
# Use the existing docker image:
# % docker pull docker.mgm.sipwise.com/ngcp-csc-ui-selenium-test-bookworm
# % docker run --rm -p 5999:5999 --shm-size 4g -i -t -v $(pwd):/code:rw docker.mgm.sipwise.com/ngcp-csc-ui-selenium-test-bookworm:latest bash
#
# Inside docker:
#   su - selenium
#   cd /code && ./t/selenium/testrunner $IP_OF_NGCP_SYSTEM # IP_OF_NGCP_SYSTEM can be e.g. IP of a `vagrant up ce-trunk` system (eth1)
#
# On host (where vncviewer can be e.g. from Debian package tigervnc-viewer):
# % vncviewer geometry=1280x1024x16 localhost:5999
################################################################################

#!/bin/bash

CSC_SYS_PATH="/usr/share/ngcp-csc/csc"
CSC_TMP_PATH="/usr/share/ngcp-csc/csc.orig"
CSC_PATH="$PWD/dist"

if [ ! -e "$CSC_SYS_PATH" ]; then
    mkdir -p "$CSC_SYS_PATH"
fi

CSC_LINK_TARGET=""
if [ -L "$CSC_SYS_PATH" ]; then
    CSC_LINK_TARGET=$(readlink "$CSC_SYS_PATH")
fi

ARGS="$*";

case "$1" in
    reset)
        if [ -L "$CSC_SYS_PATH" ]; then
            rm "$CSC_SYS_PATH"
            echo "Removed link to development version $CSC_SYS_PATH -> $CSC_LINK_TARGET"
        fi

        if [ -d "$CSC_TMP_PATH" ]; then
            mv "$CSC_TMP_PATH" "$CSC_SYS_PATH"
            echo "Restored release version $CSC_TMP_PATH -> $CSC_SYS_PATH"
        fi
    ;;
    *)
        i=0
        while [ "$i" -lt "$#" ]; do
            next=$(("$i + 1"))
            case "${ARGS[$i]}" in
                -p)
                    if [ "${ARGS[$next]}" != "" ]; then
                        CSC_PATH="${ARGS[$next]}"
                    else
                        echo "Path to development version must not be empty" >&2
                        exit 1;
                    fi
                ;;
                -*)
                    echo "Invalid option ${ARGS[$i]}" >&2
                    exit 1;
                ;;
            esac
            i=$(("$i + 1"))
        done

        if [ ! -d "$CSC_PATH" ]; then
            echo "Path to development version is not a directory '$CSC_PATH'" >&2
            exit 1;
        fi

        if [ ! -L "$CSC_SYS_PATH" ] && [ ! -d "$CSC_TMP_PATH" ]; then
            mv "$CSC_SYS_PATH" "$CSC_TMP_PATH"
            ln -s -f "$CSC_PATH" "$CSC_SYS_PATH"
        fi

        echo "Link to development version $CSC_SYS_PATH -> $(readlink ${CSC_SYS_PATH})"
        echo "Release temporary moved to $CSC_TMP_PATH"
    ;;
esac

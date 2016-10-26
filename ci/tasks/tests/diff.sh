#!/bin/bash

set -e -x

diff=`json-diff $1 $2 -v`
if [ "$diff" = " undefined" ]
then
    echo "OK"
else
    echo "KO"
    exit 1
fi
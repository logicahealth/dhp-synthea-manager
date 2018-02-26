#!/bin/bash

## Compile and package steps only belong in this script.  
## The script must return proper return codes so that when chained with other steps 
## in the build lifecycle, other scripts inthe sequence will know whether to continue to process or not.
## This script takes one paramater - the target DHP environment.  If not specified, dev is the default.


[[ -n "$1" ]] && env=$1 || env=dev

echo "Compiling/Packaging for $env"

npm install 
npm run $env

if [ $? -eq 0 ]
then
	echo "Successfully compiled and packaged the app."
	exit 0
else
	echo "Errors encountered while compiling and packaging the app."
	exit 1
fi


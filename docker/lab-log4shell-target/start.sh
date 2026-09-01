#!/bin/bash
/inject-flag.sh
cd /app/src && javac VulnApp.java && cd /app && java -cp src VulnApp

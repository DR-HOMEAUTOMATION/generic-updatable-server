#!/bin/bash
echo Starting server ... 
sudo node "`dirname "$0"`/src/index.js" &>> "`dirname "$0"`/logs.txt" 
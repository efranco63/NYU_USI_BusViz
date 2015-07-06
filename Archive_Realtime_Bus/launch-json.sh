#!/bin/bash

until ./archive_bus_all_json.py > bus-json.log; do
    echo "Python apps 'archive_bus_all_json.py' crashed with exit code $?.  Respawning.." >&2
    sleep 1
done

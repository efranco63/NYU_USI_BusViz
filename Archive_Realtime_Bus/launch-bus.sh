#!/bin/bash

until ./archive_bus_text.py > bus.log; do
    echo "Python apps 'archive_bus_text.py' crashed with exit code $?.  Respawning.." >&2
    sleep 1
done

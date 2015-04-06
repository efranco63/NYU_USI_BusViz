#!/usr/bin/env python
"""A more advanced Mapper, using Python iterators and generators."""

import sys
from datetime import datetime

def read_input(file):
    for line in file:
        # split the line into words
        yield line.split('\t')

def main(separator='\t'):
    # input comes from STDIN (standard input)
    data = read_input(sys.stdin)

    for words in data:
        try:
            dt = words[2].split(' ')[0]
            bid = words[3]
            wk = datetime.strptime(dt, '%Y-%m-%d').date().isocalendar()[1]
            print str(wk) + '\t' + dt + '\t' + bid + '\t' + str(1)
        except ValueError:
            continue

if __name__ == "__main__":
    main()
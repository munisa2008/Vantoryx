#!/bin/bash
# Intel CPU tuning — 2 vCPU Premium Intel / 8 GB Ubuntu VPS
export OMP_NUM_THREADS=2
export MKL_NUM_THREADS=2
export OPENBLAS_NUM_THREADS=2
export KMP_BLOCKTIME=0
export KMP_AFFINITY=granularity=fine,compact,1,0
export MALLOC_MMAP_THRESHOLD_=131072
export MALLOC_TRIM_THRESHOLD_=131072

exec daphne -b 0.0.0.0 -p 8000 config.asgi:application

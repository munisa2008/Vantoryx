#!/bin/bash
set -e

export OMP_NUM_THREADS=2
export MKL_NUM_THREADS=2
export OPENBLAS_NUM_THREADS=2
export KMP_BLOCKTIME=0
export KMP_AFFINITY=granularity=fine,compact,1,0
export MALLOC_MMAP_THRESHOLD_=131072
export MALLOC_TRIM_THRESHOLD_=131072

echo "[entrypoint] Running migrations..."
python manage.py migrate --noinput

echo "[entrypoint] Starting supervisord (web + bot)..."
exec supervisord -n -c /etc/supervisor/supervisord.conf

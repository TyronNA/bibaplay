#!/bin/sh
# Lượt xem + click nút mua (D1 ban-rap-hoc, do hoc/worker.js ghi). Tham số: số ngày gần nhất (mặc định 30).
set -e
cd "$(dirname "$0")"
N=${1:-30}
npx wrangler d1 execute ban-rap-hoc --remote --command "SELECT n AS luot_xem FROM dem WHERE k = 'xem'"
npx wrangler d1 execute ban-rap-hoc --remote --command \
  "SELECT ngay, n AS luot_xem FROM xem_ngay WHERE ngay >= date('now', '-$N days') ORDER BY ngay DESC"
npx wrangler d1 execute ban-rap-hoc --remote --command \
  "SELECT id, SUM(n) AS click FROM bam WHERE ngay >= date('now', '-$N days') GROUP BY id ORDER BY click DESC"
npx wrangler d1 execute ban-rap-hoc --remote --command \
  "SELECT tu AS trang, SUM(n) AS click FROM bam WHERE ngay >= date('now', '-$N days') GROUP BY tu ORDER BY click DESC LIMIT 20"

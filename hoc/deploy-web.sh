#!/bin/sh
# Xuất bản tĩnh + PDF của web tự học rồi đẩy lên https://hoc.talesofascension.com
# PDF lên R2 bucket ban-rap-hoc (quá lớn cho static assets), trang lên worker ban-rap-hoc.
set -e
cd "$(dirname "$0")"
python3 xuat-web.py ../build/hoc-web > /dev/null
python3 xuat-pdf.py ../build/hoc-web ../build/ban-rap.pdf
# --pipe chứ không --file: --file dồn cả file vào 1 PUT và ăn 504 với file > ~20MB
npx wrangler r2 object put ban-rap-hoc/ban-rap.pdf --pipe --content-type=application/pdf --remote < ../build/ban-rap.pdf
npx wrangler deploy -c wrangler.jsonc "$@"

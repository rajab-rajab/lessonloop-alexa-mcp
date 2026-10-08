#!/bin/bash
set -euo pipefail
dnf update -y
dnf install -y git nodejs20
git clone https://github.com/rajab-rajab/lessonloop-alexa-mcp.git /opt/lessonloop
cd /opt/lessonloop
npm ci --omit=dev
install -d -m 0750 /var/lib/lessonloop
install -m 0644 deploy/lessonloop.service /etc/systemd/system/lessonloop.service
systemctl daemon-reload
systemctl enable --now lessonloop.service

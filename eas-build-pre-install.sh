#!/usr/bin/env bash

set -euo pipefail

# Decode and create google-services.json for Android
if [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  echo "Creating google-services.json from environment variable"
  echo "$GOOGLE_SERVICES_JSON" | base64 --decode > google-services.json
  echo "✅ google-services.json created"
fi

# Decode and create GoogleService-Info.plist for iOS
if [ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ]; then
  echo "Creating GoogleService-Info.plist from environment variable"
  echo "$GOOGLE_SERVICE_INFO_PLIST" | base64 --decode > GoogleService-Info.plist
  echo "✅ GoogleService-Info.plist created"
fi

#! /bin/bash

set -e

if [[ -z "${ETHERSCAN_TOKEN}" ]]; then
  echo "Please provide your ETHERSCAN_TOKEN as env variable."
  exit 1
fi

if [[ -z "${WEB3_INFURA_PROJECT_ID}" ]]; then
  echo "Please provide your WEB3_INFURA_PROJECT_ID as env variable."
  exit 1
fi

rm -fr yearn-mainnet-fork || true
git clone https://github.com/yearn/yearn-mainnet-fork.git
cd yearn-mainnet-fork
docker build --build-arg ETHERSCAN_TOKEN --build-arg WEB3_INFURA_PROJECT_ID -t yearn-mainnet-fork .
cd ..
docker-compose up

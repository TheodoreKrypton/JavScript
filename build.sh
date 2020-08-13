git submodule init
git submodule update
cd frontend/ && npm install && npm run build
cd / && npm install && npm install --only=dev && pkg . --out-path=./build/

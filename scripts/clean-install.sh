#!/bin/bash
# beeSvat Clean Install Script
# node_modules 손상 시 사용
# 사용법: 모든 에디터/터미널 종료 후 실행

echo "=== beeSvat Clean Install ==="
echo "1. 모든 node 프로세스 종료..."

# Windows: taskkill, Unix: killall
if command -v taskkill &> /dev/null; then
  taskkill //F //IM node.exe 2>/dev/null || true
else
  killall node 2>/dev/null || true
fi

echo "2. node_modules 삭제..."
cd "$(dirname "$0")/.."

if [ -d "node_modules" ]; then
  echo "  Removing node_modules..."
  rm -rf "node_modules" 2>/dev/null || cmd.exe //c "rmdir /s /q node_modules" 2>/dev/null || true
fi

echo "3. package-lock.json 삭제..."
rm -f package-lock.json

echo "4. npm 캐시 정리..."
npm cache clean --force

echo "5. npm install 실행..."
npm install

echo "6. Prisma 클라이언트 생성..."
npx prisma generate

echo "7. Husky 초기화..."
npx husky

echo "=== 완료! ==="

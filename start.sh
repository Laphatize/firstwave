source ~/.zshrc
nvm use node

cd frontend || npm run dev
cd ..
cd backend || node server.js
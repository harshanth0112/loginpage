# Nimbus Login (React + Express)

## 1. Create the client (once)
```
npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom
npm install tailwindcss @tailwindcss/vite
```
Then in `vite.config.js` add `import tailwindcss from "@tailwindcss/vite"` and put `tailwindcss()` in `plugins`.
Replace `src/index.css` with a single line: `@import "tailwindcss";`
Copy `src/App.jsx` and `src/pages/` from this folder over the generated ones.

## 2. Run the server
```
cd server
npm install
npm start      # http://localhost:5000
```

## 3. Run the client
```
cd client
npm run dev    # http://localhost:5173
```

Demo login: demo@nimbus.com / Nimbus@123
# loginpage

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Command for libaries
npm install lucide-react react-leaflet leaflet

## How to run the app (Recommend)

### Step 1 Install node.js
- Note: Make sure that node.js is installed before doing each step as if it isn't, the npm commands won't work
- Download Node.js latest version https://nodejs.org/en

### Step 2 Download and Extract the zip file
First, you download or clone the app zip file.

Then, you extract the file through file explorer.

### Step 3 Access to the Extracted file directory
Open terminal and type exactly: 

     cd ~/Downloads/folder-name/folder-name 
     
('folder-name' is whatever you saved as when extracting the file)

### Step 4 Install the Node_modules by npm install and open the app by npm run dev command
Then, type these 2 words in order:

    npm install
  
    npm run dev

### Step 5 check that it work
It should show:
 VITE v7.3.1  ready in 1001 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

 then press o + enter

 The application should show on the web browser you use, please keep in mind that close this terminal will also close the app.

 if it isn't show please copy http://localhost:5173/ then paste to the browser you want then the app should show.

(Warning, if you close the terminal however or if the terminal isn't open or if the terminal is open but you haven't executed the steps fully, the link will not work).

## Run app by install manually(Alternative)

### Step 1 Install node.js
- Note: Make sure that node.js is installed before doing each step as if it isn't, the npm commands won't work
- Download Node.js latest version https://nodejs.org/en

### Step 2 open Command prompt then go to the directory you want for project
press window + r
There are 2 recommend way open cmd or Visual studio terminal
once cmd is open go to the directory you want

Example
cd C:\Users\XXXX\Desktop\CSE\GUI

### Step 3 create a project
once your are in the directory run command

npm create vite@latest

Follow the process of creating project

Put the project name: [Any Name You Like]
Put the package name: [Any Name You Like Lower case for .js]
Select framework: React
Select a variant: JavaScript + React Compiler
Use Vite 8 beta(Experimental): No
Install with npm and start now?: Yes

### Step 4 go to the Directory project
cd [The Name of your project]

### Step 5 download libaries for the project
npm install lucide-react
npm install -D tailwindcss @tailwindcss/vite
npm install react-leaflet
npm install leaflet

### Step 6 Check
src folder is source folder. You see vite.config.js and others folders in your project, click to the src folder you must see App.jsx.
If you don't see anything inside the src folder, you have to redo Step 1 2 3

### Step 7 Replace code in the vite.config.js with the code below
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})

### Step 8 Delete every singleline and add this to src/index.css and src/App.cs
@import "tailwindcss";

### Step 9 Use our App.jsx from extracted zip file and replace with the App.jsx in src folder

### Step 10 
opend cmd
cd to the project directory
type command below

npm run dev

It should show:
 VITE v7.3.1  ready in 1001 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

 then press o + enter

 The application should show on the web browser you use, please keep in mind that close this terminal will also close the app.

 if it isn't show please copy http://localhost:5173/ then paste to the browser you want then the app should show.

(Warning, if you close the terminal however or if the terminal isn't open or if the terminal is open but you haven't executed the steps fully, the link will not work).






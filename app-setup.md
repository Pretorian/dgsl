# Project Setup Instructions

## Files to Download and Their Locations

Create the following folder structure and save each file in its proper location:

```
dgsl-2026ß/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Step-by-Step Setup

### 1. Create Project Folder
```bash
mkdir dgsl-schedule-filter
cd dgsl-schedule-filter
```

### 2. Create Subdirectories
```bash
mkdir public
mkdir src
```

### 3. Copy Files to Correct Locations

From the artifacts, copy the content of each file to the correct location:

**Root Directory:**
- `package.json` → `dgsl-schedule-filter/package.json`
- `README.md` → `dgsl-schedule-filter/README.md`

**Public Directory:**
- `index.html` → `dgsl-schedule-filter/public/index.html`

**Src Directory:**
- `App.js` (the main DGSL Schedule Filter artifact) → `dgsl-schedule-filter/src/App.js`
- `index.js` → `dgsl-schedule-filter/src/index.js`
- `index.css` → `dgsl-schedule-filter/src/index.css`

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the App
```bash
npm start
```

The app should open automatically at `http://localhost:3000`

## Quick Copy-Paste Commands (Mac/Linux)

If you have all the files in a download folder:

```bash
# Create structure
mkdir -p dgsl-schedule-filter/public dgsl-schedule-filter/src

# Move files (adjust paths as needed)
mv package.json dgsl-schedule-filter/
mv README.md dgsl-schedule-filter/
mv index.html dgsl-schedule-filter/public/
mv App.js dgsl-schedule-filter/src/
mv index.js dgsl-schedule-filter/src/
mv index.css dgsl-schedule-filter/src/

# Navigate and install
cd dgsl-schedule-filter
npm install
npm start
```

## Alternative: Create from Scratch

If you prefer to create files manually:

```bash
# Create project
npx create-react-app dgsl-schedule-filter
cd dgsl-schedule-filter

# Replace files with artifact content
# - Replace src/App.js with the DGSL Schedule Filter artifact
# - Replace public/index.html with the index.html artifact
# - Replace src/index.js with the index.js artifact
# - Replace src/index.css with the index.css artifact
# - Add README.md to root

# Start the app
npm start
```

## Verification

After setup, you should see:
- ✅ Development server starts without errors
- ✅ Browser opens to http://localhost:3000
- ✅ DGSL Spring Schedule 2026 header appears
- ✅ Filters and table display correctly
- ✅ You can filter and sort the schedule

## Troubleshooting

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**Port 3000 already in use**
- Use a different port: `PORT=3001 npm start`

**Module not found errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
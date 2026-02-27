Run the tests with "npm test"

jest will find and run all files in tests/ automatically.

installing jest: npm install --save-dev jest

Open your package.json and modify the "scripts" section:

"scripts": {
  "test": "jest"
}

If you're debugging open handles, you can use: "test": "jest --detectOpenHandles --forceExit"

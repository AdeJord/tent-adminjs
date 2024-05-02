module.exports = {
  apps: [{
    name: 'server',
    script: 'server.mjs',
    exec_mode: 'fork', // ES Modules should work in 'fork' mode
    interpreter: 'node', // Explicitly set to 'node' to ensure it uses the correct binary
    node_args: '--loader ts-node/esm' // Add if using TypeScript or specific module loaders
  }]
};

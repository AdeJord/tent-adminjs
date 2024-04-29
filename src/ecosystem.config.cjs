module.exports = {
  apps: [{
    name: 'server',
    script: 'server.mjs',
    exec_mode: 'fork', // Keep 'fork' mode for ES Modules
    interpreter: 'node' // Assuming 'node' points to the correct binary; check with `which node`
  }]
};

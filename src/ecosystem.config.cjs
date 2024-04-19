module.exports = {
  apps: [{
    name: 'server',
    script: 'server.mjs',
    interpreter: '/usr/bin/node', // Adjust the path to your Node.js binary if necessary
    exec_mode: 'fork', // ESM modules might not work correctly in 'cluster' mode
    node_args: '--experimental-modules', // This might not be necessary for newer Node versions
  }]
};
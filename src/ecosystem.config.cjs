module.exports = {
  apps: [
    {
      name: "server",
      script: "./server.mjs",
      interpreter: "node",
      interpreter_args: "",
      autorestart: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};

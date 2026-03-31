module.exports = {
  apps: [
    {
      name: 'md-viewer',
      script: 'server.js',
      cwd: __dirname,
      env: {
        PORT: 3007,
        NODE_ENV: 'production'
      }
    }
  ]
};

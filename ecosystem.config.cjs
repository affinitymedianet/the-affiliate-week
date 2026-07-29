module.exports = {
  apps: [
    {
      name: "the-affiliate-week",
      script: "./.output/server/index.mjs",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Restart automatically on failure; keep logs manageable.
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      // Log paths (PM2 will create these files).
      log_file: "./logs/pm2-combined.log",
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      // Graceful shutdown window.
      kill_timeout: 5000,
      // Wait for the app to report ready if it ever does.
      wait_ready: false,
      // Don't watch source files in production.
      watch: false,
    },
  ],
};

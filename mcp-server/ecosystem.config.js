module.exports = {
  apps: [
    {
      name: 'ai-playbook-server',
      script: 'src/index.js',
      cwd: __dirname,
      env: {
        PORT: 3100,
        PLAYBOOK_API_KEY: process.env.PLAYBOOK_API_KEY || ''
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true
    }
  ]
};

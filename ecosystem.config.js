module.exports = {
  apps: [{
    name: 'gomotarcar-api',
    script: 'src/index.js',
    cwd: './server',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_restarts: 10,
    restart_delay: 4000,
    min_uptime: 5000,
    listen_timeout: 8000,
    kill_timeout: 5000,
    watch: false,
    merge_logs: true,
    append_env_to_name: true,
  }],
};

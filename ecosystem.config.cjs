module.exports = {
  apps: [
    {
      name: 'seha-server',
      script: './server.mjs',  // تعديل المسار ليشير إلى server.mjs
      watch: true,
    },
    {
      name: 'vite-app',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/ec2-user/seha/client', // المسار الصحيح لتطبيق vite-app
      watch: true,
    },
  ],
};
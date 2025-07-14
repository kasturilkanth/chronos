const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const axios = require('axios');

// 1. Shell Job
async function executeShellJob(command, payload) {
    return new Promise((resolve, reject) => {
        exec(command, { env: { ...process.env, ...payload } }, (error, stdout, stderr) => {
            if (error) return reject(stderr || error.message);
            resolve(stdout);
        });
    });
}

// 2. Email Job
async function executeEmailJob(command, payload) {
    const transporter = nodemailer.createTransport(
        {
            host: 'sandbox.smtp.mailtrap.io',
            port: '2525',
            auth: {
                user: '171d90dcf264c5',
                pass: '6886a71866114d'
            }
        }
    );
    const mailOptions = {
        from: payload.from,
        to: payload.to,
        subject: command,
        text: payload.text,
        html: payload.html,
        ...payload.options
    };
    return transporter.sendMail(mailOptions);
}

// 3. HTTP Job
async function executeHttpJob(command, payload) {
    // command is the URL, payload can have method, headers, data, etc.
    const { method = 'GET', headers = {}, data = {} } = payload || {};
    const response = await axios({
        url: command,
        method,
        headers,
        data
    });
    return response.data;
}

module.exports = {
    executeShellJob,
    executeEmailJob,
    executeHttpJob
};
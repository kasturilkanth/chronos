const { body } = require('express-validator');
const validate = require('@shared/middlewares/validate');
const { CronExpressionParser } = require('cron-parser');

const jobTypeSpecificValidation = [
    body('title').isString().notEmpty().withMessage('Title is required'),

    body('schedule_expression')
        .isString().notEmpty().withMessage('Schedule expression is required')
        .custom((value) => {
            try {
                CronExpressionParser.parse(value);
                return true;
            } catch (err) {
                throw new Error('Invalid cron expression');
            }
        }),

    body('type').isIn(['shell', 'email', 'http']).withMessage('Invalid job type'),

    // Shell job
    body('command')
        .if(body('type').equals('shell'))
        .isString().notEmpty().withMessage('Shell command is required'),

    // Email job
    body('command')
        .if(body('type').equals('email'))
        .isString().notEmpty().withMessage('Email subject is required'),
    body('payload')
        .if(body('type').equals('email'))
        .custom((value) => {
            if (!value) throw new Error('Payload is required for email jobs');
            const json = JSON.parse(value);
            console.log(`payload value ${JSON.stringify(json)}`)
            if (!json.to || !json.from) throw new Error('Email payload must include "to" and "from"');
            if (!json.text && !json.html) throw new Error('Email payload must include "text" or "html"');
            return true;
        }),

    // HTTP job
    body('command')
        .if(body('type').equals('http'))
        .isURL().withMessage('Command must be a valid URL for HTTP jobs'),
    body('payload')
        .if(body('type').equals('http'))
        .custom((value) => {
        if (!value) return true; // optional
        if (value.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(value.method.toUpperCase())) {
            throw new Error('HTTP payload "method" must be a valid HTTP method');
        }
        return true;
        }),
    
    body('retry_strategy').optional().isIn(['immediate', 'exponential', 'linear']).withMessage('Invalid retry strategy'),
    body('max_retries').optional().isInt({ min: 0 }).withMessage('Max retries must be a non-negative integer'),
    validate
];

module.exports = jobTypeSpecificValidation;
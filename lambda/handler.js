import express from 'express';
import serverless from 'serverless-http';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmParameterName = process.env.SSM_ENV_PARAMETER_NAME;

async function loadEnvFromSsm(parameterName) {
	if (!parameterName) return;

	const client = new SSMClient({});
	const response = await client.send(
		new GetParameterCommand({
			Name: parameterName,
			WithDecryption: true
		})
	);
	const json = response.Parameter?.Value;
	if (!json) return;

	const parsed = JSON.parse(json);
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error(`SSM parameter ${parameterName} must contain a JSON object.`);
	}

	for (const [key, value] of Object.entries(parsed)) {
		if (typeof value === 'undefined' || value === null) continue;
		process.env[key] = String(value);
	}
}

await loadEnvFromSsm(ssmParameterName);
const { handler: svelteKitHandler } = await import('../build/handler.js');

const app = express();
app.disable('x-powered-by');
app.use(svelteKitHandler);

export const handler = serverless(app, {
	binary: ['*/*']
});

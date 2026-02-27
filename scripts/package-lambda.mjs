import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const stageDir = resolve(distDir, 'lambda');
const zipPath = resolve(distDir, 'lambda.zip');

function run(command, args, cwd = rootDir) {
	const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

const rootPackage = JSON.parse(await readFile(resolve(rootDir, 'package.json'), 'utf8'));
const runtimePackage = {
	name: `${rootPackage.name}-lambda-runtime`,
	private: true,
	type: 'module',
	dependencies: {
		'@sveltejs/kit': rootPackage.devDependencies['@sveltejs/kit'],
		'@aws-sdk/client-ssm': rootPackage.dependencies['@aws-sdk/client-ssm'],
		express: rootPackage.dependencies.express,
		'serverless-http': rootPackage.dependencies['serverless-http']
	}
};

await rm(stageDir, { recursive: true, force: true });
await rm(zipPath, { force: true });
await mkdir(stageDir, { recursive: true });

await cp(resolve(rootDir, 'build'), resolve(stageDir, 'build'), { recursive: true });
await cp(resolve(rootDir, 'lambda'), resolve(stageDir, 'lambda'), { recursive: true });
await writeFile(resolve(stageDir, 'package.json'), `${JSON.stringify(runtimePackage, null, 2)}\n`);

run('npm', ['install', '--omit=dev', '--package-lock=false'], stageDir);
run('zip', ['-qr', zipPath, '.'], stageDir);

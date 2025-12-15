import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Get git info at build time
const getGitInfo = () => {
  try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const commitFullHash = execSync('git rev-parse HEAD').toString().trim();
    const commitDate = execSync('git log -1 --format=%ci').toString().trim();
    return { commitHash, commitFullHash, commitDate };
  } catch {
    return { commitHash: 'dev', commitFullHash: 'dev', commitDate: new Date().toISOString() };
  }
};

const gitInfo = getGitInfo();

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    __COMMIT_HASH__: JSON.stringify(gitInfo.commitHash),
    __COMMIT_FULL_HASH__: JSON.stringify(gitInfo.commitFullHash),
    __COMMIT_DATE__: JSON.stringify(gitInfo.commitDate),
    __DEV_MODE__: mode === 'development',
  },
}))


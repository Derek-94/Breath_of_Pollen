import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: [
      'app/page.tsx',
      'components/ui/carousel.tsx',
      'components/ui/sidebar.tsx',
      'components/ui/use-mobile.tsx',
      'hooks/use-mobile.ts',
    ],
    rules: {
      // Existing frontend patterns are tracked as warnings while new API code
      // remains subject to the full recommended Next.js rule set.
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '__v0_*',
  ]),
])

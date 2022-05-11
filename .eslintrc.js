module.exports = {
    root: true,
    env: {
        'es6': true,
        'node': true
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module'
    },
    plugins: [
        'eslint-plugin-import',
        'eslint-plugin-jsdoc',
        'eslint-plugin-prefer-arrow',
        '@typescript-eslint',
        'prettier'
    ],
    rules: {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/dot-notation': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
            'off',
            {
                'accessibility': 'explicit'
            }
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/naming-convention': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-shadow': [
            'error',
            {
                'hoist': 'all'
            }
        ],
        '@typescript-eslint/no-unused-expressions': 'error',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/quotes': [
            'error',
            'single',
            {
                'avoidEscape': true
            }
        ],
        '@typescript-eslint/triple-slash-reference': [
            'error',
            {
                'path': 'always',
                'types': 'prefer-import',
                'lib': 'always'
            }
        ],
        '@typescript-eslint/typedef': 'off',
        '@typescript-eslint/unified-signatures': 'error',
        'brace-style': [
            'off',
            'off'
        ],
        'complexity': 'off',
        'constructor-super': 'error',
        'dot-notation': 'error',
        'eol-last': 'off',
        'eqeqeq': [
            'error',
            'smart'
        ],
        'guard-for-in': 'error',
        'id-denylist': [
            'error',
            'any',
            'Number',
            'number',
            'String',
            'string',
            'Boolean',
            'boolean',
            'Undefined',
            'undefined'
        ],
        'id-match': 'error',
        'import/order': 'error',
        'indent': 'off',
        'jsdoc/check-alignment': 'error',
        'jsdoc/check-indentation': 'error',
        'jsdoc/newline-after-description': 'error',
        'linebreak-style': 'off',
        'max-classes-per-file': 'off',
        'new-parens': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': 'off',
        'no-debugger': 'error',
        'no-empty': 'error',
        'no-empty-function': 'error',
        'no-eval': 'error',
        'no-fallthrough': 'off',
        'no-invalid-this': 'off',
        'no-new-wrappers': 'error',
        'no-shadow': 'error',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-underscore-dangle': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-expressions': 'error',
        'no-unused-labels': 'error',
        'no-use-before-define': 'off',
        'no-var': 'error',
        'object-shorthand': 'error',
        'one-var': [
            'error',
            'never'
        ],
        'prefer-arrow/prefer-arrow-functions': 'error',
        'prefer-const': 'error',
        'quotes': ['error', 'single'],
        'radix': 'error',
        'spaced-comment': [
            'error',
            'always',
            {
                'markers': [
                    '/'
                ]
            }
        ],
        'use-isnan': 'error',
        'valid-typeof': 'off'
    },
    overrides: [
        {
            files: [
                './schematics'
            ],
            parserOptions: {
                project: 'tsconfig.schematics.json',
            }
        }
    ]
};

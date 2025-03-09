/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    bracketSpacing: false,
    printWidth: 180,
    arrowParens: 'avoid',
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: ['^[./]', '<THIRD_PARTY_MODULES>'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
}

module.exports = config

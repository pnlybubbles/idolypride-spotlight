/* global module,process */
/** @type { import('@graphql-codegen/plugin-helpers').Types.Config } */
module.exports = {
  overwrite: true,
  schema: {
    'https://idolypride-spotlight.hasura.app/v1/graphql': {
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        'x-hasura-role': 'user',
      },
    },
  },
  documents: 'api/**/*.graphql',
  generates: {
    'generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        enumsAsTypes: true,
      },
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
}

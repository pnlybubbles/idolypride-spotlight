<h1 align="center">
  <img margin="auto" width="612px" src="site/banner.png" alt="IDOLY PRIDE SPOTLIGHT">
  <br>
</h1>

<h4 align="center">No one starts from the spotlight.</h4>

## Setup

Make sure to install the dependencies

```bash
yarn install
```

## Development

> **Wraning**
> Development environment is now under construction.
> Sandbox database has not been provisioned yet.
> If you want to contribute, feel free to mention to me!

Start the development server on http://localhost:3000

```bash
yarn dev
```

Currently, Hasura environment is required individually. The description of hasura environment is inside `/hasura` directory.

Rough steps for setup is below:

- Create account and project on Hasura
- Install Hasura CLI
- Export environment variables `HASURA_GRAPHQL_ENDPOINT`, `HASURA_GRAPHQL_ADMIN_SECRET`
- `cd hasura && hasura deploy`
- Update `HASURA_GRAPHQL_JWT_SECRET` Env vars on Hasura cloud used for Auth0 (please contact me)

## Editor settings (Optional)

Enable Take Over Mode for Volar extension integration. [How to enable](https://github.com/johnsoncodehk/volar/discussions/471).

## Production

Build and serve the application as production environment:

```bash
yarn build
yarn start
```

## Deployment

Using github action to deploy on vercel.

In case db migration is required, manually deploying schema and metadata on hasura before the application deployment.

## Structure

- `Nuxt3`
  - Integrate with `Volar` to achieve robust type constraint.
- `GraphQL` to communicate with Hasura (PostgreSQL)
  - fetching and caching: `urql`
- `Auth0` to manage user identity

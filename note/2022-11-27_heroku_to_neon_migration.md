# Heroku to Neon migration

Dump database from heroku with custom profile. Download into `latest.dump`.

```
heroku pg:backups:capture --app idolypride-spotlight
heroku pg:backups:download --app idolypride-spotlight
```

Create neon database with one-click Hasura Cloud integration. (very easy!)

Restore database with `pg_restore`

```
pg_restore -v -h soft-limit-907789.us-east-2.aws.neon.tech -p 5432 -U pnlybubbles -d main --no-owner --no-privileges latest.dump
```

Remove database connection with heroku in Hasura Cloud configuration.

Edit database_url in `hasura/metadata/databases/databases.yaml`.

Apply GraphQL quering metadata to Hasura Cloud.

```
hasura metadata apply
```

DONE!

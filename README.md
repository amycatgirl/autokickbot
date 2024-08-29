# AutoKick (ak)

Bot that kicks inactive users after an specified period of time.

## Running

### Docker

```sh
docker compose up -d
```

### Local

```sh
pnpm i
node .
```

## Configuration

Internal bot configuration is managed via a `.env` file.

A template is provided alongside this repository.

| Option      | Description       | Type   |
|-------------|-------------------|--------|
| PG_USER     | Database username | string |
| PG_PASSWORD | Database password | string |
| PG_DATABASE | Database name     | string |
| AK_PREFIX   | Bot's Prefix      | string |
| AK_TOKEN    | Bot token         | string |

Other configuration options are *server specific* and **must** be configured
via the `config set` command. 


## License

This bot, and it's components are all licensed under the MIT license.

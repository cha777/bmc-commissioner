# BMC Commissioner

Employee commission calculation app for Bandula Metal Crusher

## Deployment

This app can be deployed using Docker

1. Copy pocketbase pb_data and pb_migrate folders to pb folder
2. Run following command to generate docker image tarball files and `docker-compose.yml` file in `build` folder

```
npm run docker:export
```

3. Copy the content in build folder to remote server
4. Run following commands to load the docker images

```
docker load -i bmc-commissioner-app.tar
docker load -i bmc-commissioner-pocketbase.tar
```

5. Update port mappings as needed in the docker-compose.yml file
6. Run following command to build and run the docker container

```
docker-compose up --build --detach
```

7. Validate status of the docker container using following command

```
docker ps
```

## Author

Chathuranga Mohottala – [@cha777](https://github.com/cha777) – chathuranga_wm@yahoo.com

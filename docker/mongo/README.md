## Run
```sh
# 첫 실행
> docker run --name guardian_db -d \
 -v $PWD/db:/db
 -p 27017:27017 \
 -e MONGO_INITDB_ROOT_USERNAME=guardian \
 -e MONGO_INITDB_ROOT_PASSWORD={PASSWORD} \
 mongo:latest

# 일반 실행
> docker run -d -p 27017:27017 --name guardian_db -v $PWD/db:/db mongo:latest 

# 관리
> docker exec -it guardian_db mongo
```
## mongod 명령어 
```sh
# Init
> db.createCollection("statistics")
> db.statistics.insert({"name": "Motion", "count":0});
> db.statistics.insert({"name": "Person", "count":0});
> db.statistics.insert({"name": "Car", "count":0});

# Delete
> db.statistics.remove({"Motion": 0})

# Update
> db.statistics.update({"name":"Motion"},{ $set: { count: 1 } } );

# Confirm
> db.statistics.find()
```

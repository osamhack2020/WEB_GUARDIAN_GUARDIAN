## Run
```sh
# 실행
> echo {MONGO_PASSWORD} > MONGO_PW
> cat MONGO_PW
> docker-compose up -d

# 관리
> docker exec -it mongo_go_guardian_db_1 mongo admin -u guardian -p {MONGO_PASSWORD}
```
## mongod 명령어 
```sh
# Init
> db.createCollection("statistics")
> db.statistics.insert({"date":"20201023", time:[
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
{"Motion":0,"Person":0,"Car":0},
]});
# Delete
> db.statistics.remove({"date": "20201023"})

# Update
> db.statistics.update({"date": "20201023"},{ $inc: { "time.23.Motion": 1 } } );

# Confirm
> db.statistics.find()
```

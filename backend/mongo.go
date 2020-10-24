package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Mongo struct {
	guardianDB *mongo.Collection
}

// Init is Connect Mongo Server
func (M *Mongo) Init() {
	dat, err := ioutil.ReadFile("MONGO_PW")
	MONGO_PW := string(dat)
	clientOptions := options.Client().ApplyURI("mongodb://gron1gh2.southeastasia.cloudapp.azure.com:27017").SetAuth(options.Credential{
		Username: "guardian",
		Password: MONGO_PW,
	})
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	if err != nil {
		log.Fatal(err)
	}
	M.guardianDB = client.Database("guardian").Collection("statistics")
}

// Find Use hourData["Motion"], hourData["Person"], hourData["Car"]
func (M *Mongo) Find(date string) (bson.A, bool) {
	cursor, _ := M.guardianDB.Find(context.TODO(), bson.D{
		{"date", date},
	})
	if cursor.Next(context.TODO()) {
		var elem bson.M
		err := cursor.Decode(&elem)
		if err != nil {
			return nil, false
		}
		data := elem["time"].(bson.A)
		return data, true
	}
	return nil, false
}

// InsertDefaultData is Date Default Data
func (M *Mongo) InsertDefaultData(date string) {
	timeInitData := []bson.M{}
	for i := 0; i < 24; i++ {
		timeInitData = append(timeInitData,
			bson.M{
				"motion": 0,
				"person": 0,
				"car":    0})
	}
	M.guardianDB.InsertOne(context.TODO(), bson.M{
		"date": date,
		"time": timeInitData})
}

// Update is Mongo "motion","person","car" in Mongo DB Update
func (M *Mongo) Update(date string, hour int, event string) {
	M.guardianDB.UpdateOne(context.TODO(), bson.D{
		{"date", date}}, bson.D{
		{"$inc", bson.D{
			{fmt.Sprintf("time.%d.%s", hour, event), 1},
		}},
	})
}

func (M *Mongo) ComposeUpdate(event string) {
	Now := time.Now()
	NowDate := Now.Format("20060102")
	NowHour, _ := strconv.Atoi(Now.Format("15"))
	if _, ok := M.Find(NowDate); !ok {
		M.InsertDefaultData(NowDate)
	}
	M.Update(NowDate, NowHour, event)
}

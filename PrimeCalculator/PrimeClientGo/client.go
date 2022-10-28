package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/salem84/primeclientgo/pb"
	"google.golang.org/grpc"
)

func main() {
	fmt.Println("Hello from GoLang World!")

	serviceHost := os.Getenv("SERVICE__PRIMECALCULATOR__HOST") + ":" + os.Getenv("SERVICE__PRIMECALCULATOR__PORT")

	if serviceHost == ":" {
		log.Fatalln("Service Address not valid")
		os.Exit(1)
	}

	fmt.Printf("Service Address: %s", serviceHost)

	time.Sleep(3 * time.Second)

	connection, err := grpc.Dial(serviceHost, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("Could not connect to gRPC Server: %v", err)
	}
	defer connection.Close()

	client := pb.NewPrimeCalculatorClient(connection)
	rand.Seed(time.Now().UnixNano())

	minNumber, err := strconv.Atoi(os.Getenv("MIN_NUMBER"))
	maxNumber, err := strconv.Atoi(os.Getenv("MAX_NUMBER"))
	sleepSeconds, err := strconv.Atoi(os.Getenv("INTERVAL_MS"))

	for {
		num := rand.Intn(maxNumber-minNumber+1) + minNumber
		req := &pb.PrimeRequest{
			Number: int64(num),
		}
		res, err := client.IsItPrime(context.Background(), req)

		if err != nil {
			log.Fatalf("Error when calling IsItPrime: %s", err)
		}

		log.Printf("Number %d is Prime?: %t", uint64(req.Number), res.IsPrime)

		time.Sleep(time.Duration(sleepSeconds) * time.Millisecond)
	}

}

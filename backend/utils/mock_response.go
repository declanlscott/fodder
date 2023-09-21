package utils

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func GetMockResponse(fileName string) ([]byte, error) {
	var file *os.File

	_, err := os.Stat(fileName)
	if err == nil {
		// File exists
		file, err = os.Open(fileName)
		if err != nil {
			// An error occurred while opening the file
			return nil, err
		}
		defer file.Close()

		return io.ReadAll(file)
	} else if os.IsNotExist(err) {
		// File does not exist
		cfg, err := config.LoadDefaultConfig(context.TODO())
		if err != nil {
			return nil, err
		}

		s3Client := s3.NewFromConfig(cfg)

		result, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String("fodder-test-files"),
			Key:    aws.String(fmt.Sprintf("mock-responses/%s", fileName)),
		})
		if err != nil {
			// An error occurred while getting the file from S3
			return nil, err
		}
		defer result.Body.Close()

		file, err = os.Create(fileName)
		if err != nil {
			// An error occurred while creating the file
			return nil, err
		}
		defer file.Close()

		body, err := io.ReadAll(result.Body)
		if err != nil {
			// An error occurred while reading the file from S3
			return nil, err
		}

		_, err = file.Write(body)
		if err != nil {
			// An error occurred while writing the file to disk
			return nil, err
		}

		return body, nil
	} else {
		// An error occurred while checking if the file exists
		return nil, err
	}
}

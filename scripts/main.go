package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

type CommitData struct {
	Date   string `json:"date"`
	Commit int    `json:"commit"`
}

func main() {
	filePath := filepath.Join(".", "backdates.json")

	file, err := os.Open(filePath)
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		return
	}
	defer file.Close()

	byteValue, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		return
	}

	// Parse the JSON data
	var commitData []CommitData
	err = json.Unmarshal(byteValue, &commitData)
	if err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		return
	}

	fmt.Print("Enter the directory name: ")
	var dirName string
	fmt.Scanln(&dirName)

	// Create the directory if it doesn't exist
	err = os.MkdirAll(dirName, os.ModePerm)
	if err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		return
	}

	// Change to the directory
	err = os.Chdir(dirName)
	if err != nil {
		fmt.Printf("Error changing directory: %v\n", err)
		return
	}

	// Initialize a Git repository
	cmd := exec.Command("git", "init")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error running git init: %v\n", err)
		return
	}

	// Switch branch to main
	cmd = exec.Command("git", "branch", "-m", "master", "main")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error switching branch to main: %v\n", err)
		return
	}

	// Create log.txt file
	logFile, err := os.Create("log.txt")
	if err != nil {
		fmt.Printf("Error creating log file: %v\n", err)
		return
	}
	defer logFile.Close()

	// Process commit data
	for _, entry := range commitData {
		for i := 0; i < entry.Commit; i++ {
			// Write to log.txt
			logEntry := fmt.Sprintf("Commit: %s-%d\n", entry.Date, i+1)
			_, err := logFile.WriteString(logEntry)
			if err != nil {
				fmt.Printf("Error writing to log file: %v\n", err)
				return
			}

			// Append data to a file
			content := fmt.Sprintf("Date: %s, Commit number: %d\n", entry.Date, i+1)
			err = os.WriteFile("metrics.txt", []byte(content), 0644)
			if err != nil {
				fmt.Printf("Error writing to file.txt: %v\n", err)
				return
			}

			cmd = exec.Command("git", "add", ".")
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr

			err = cmd.Run()
			if err != nil {
				fmt.Printf("Error staging changes: %v\n", err)
				return
			}

			// Commit changes with backdated timestamp
			commitMessage := fmt.Sprintf("Commit for %s - #%d", entry.Date, i+1)
			commitDate := entry.Date
			cmd = exec.Command("git", "commit", "-m", commitMessage, fmt.Sprintf("--date=%s", commitDate))
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr

			err = cmd.Run()
			if err != nil {
				fmt.Printf("Error committing changes: %v\n", err)
				return
			}
		}
	}

	// Make the final commit with message "completed"
	cmd = exec.Command("git", "add", ".")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error staging changes for final commit: %v\n", err)
		return
	}

	cmd = exec.Command("git", "commit", "-m", "completed")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error making final commit: %v\n", err)
		return
	}

	fmt.Println("Process completed successfully.")
}

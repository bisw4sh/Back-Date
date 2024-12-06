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

	totalCommits := 0

	// Process commit data
	for _, entry := range commitData {
		for i := 0; i < entry.Commit; i++ {
			// Prepare log entry
			logEntry := fmt.Sprintf("Commit: %s-%d\nCommit for %s - #%d\n", entry.Date, i+1, entry.Date, i+1)

			// Open logs.txt in append mode
			f, err := os.OpenFile("logs.txt", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
			if err != nil {
				fmt.Printf("Error opening logs.txt for appending: %v\n", err)
				return
			}

			// Write log entry
			_, err = f.WriteString(logEntry)
			if err != nil {
				fmt.Printf("Error appending to logs.txt: %v\n", err)
				f.Close() // Ensure the file is closed
				return
			}
			f.Close() // Close the file after writing

			// Stage the file
			cmd := exec.Command("git", "add", "logs.txt")
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

			totalCommits++
		}
	}

	// Append the total commits count to logs.txt
	logSummary := fmt.Sprintf("\nTotal backdated commits made: %d\nTotal commits: %d", totalCommits, totalCommits+1)
	f, err := os.OpenFile("logs.txt", os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening logs.txt for appending: %v\n", err)
		return
	}
	_, err = f.WriteString(logSummary)
	if err != nil {
		fmt.Printf("Error appending commit summary to logs.txt: %v\n", err)
		f.Close() // Ensure we close the file
		return
	}
	f.Close() // Ensure we close the file

	// Stage the updated logs.txt
	cmd = exec.Command("git", "add", "logs.txt")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error staging changes for final commit: %v\n", err)
		return
	}

	// Commit the changes with the final message
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

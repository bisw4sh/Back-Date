# BackDate Git/Hub Commit

This project aims to backdate Git/GitHub commits to a past date, allowing us to commit to GitHub and perform specific figures or be artisian in the github activity graph.

```sh
git commit --date='1999-10-31'
```

1. Add the Github Access Token from [here](https://github.com/settings/tokens) and put in .env
2. Type username and year, you would like to paint.
3. Paint the graph with click(s)
4. Press **Download** button, initiates the *backdates.json* file.
5. Place it where *main.go* is, in **scripts** folder.
6. Run the program
```go
go run main.go
```
7. Repo has the necessary commit, push it to your github/gitlab to see contributions.
---
*Note: didn't compile the go code for reasons, got to have **GO** in your system.*
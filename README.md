# BackDate Git/Hub Commit

This project aims to backdate Git/GitHub commits to a past date, allowing us to commit to GitHub and perform specific figures or be artisian in the github activity graph.

```sh
git commit --date='1999-10-31'
```

1. Add the Github Access Token from [here](https://github.com/settings/tokens) and put in .env
2. Type username and year, you would like to paint.
3. Paint the graph with click(s)
4. Press **Download** button, initiates the _backdates.json_ file.
5. Run the program

```sh
./backdate --json ~/Downloads/backdates.json --repo ~/Downloads/hello
```

> --json flag can be omitted but that is the default file and path. Since, the file will be downloaded with the given name and in that location. Unless, default is changed or if there are multiple downloads of same file which will make incremented filenames.

> ./backdate depend on the output binary, choose by the below information in distribution.

7. Repo has the necessary commit, push it to your github/gitlab to see contributions.

---

_Note: didn't compile the go code for reasons, got to have **GO** in your system._

## Distribution

1. Linux

```sh
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o backdate-linux
```

2. macOS (Intel)

```
GOOS=darwin GOARCH=amd64 go build -o backdate-macos
```

3. macOS (Apple Silicon)

```sh
GOOS=darwin GOARCH=arm64 go build -o backdate-macos-arm
```

4. Windows

```sh
GOOS=windows GOARCH=amd64 go build -o backdate.exe
```

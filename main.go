package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"

	_ "github.com/denisenkom/go-mssqldb"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SavePlanRequest struct {
	Title string `json:"title"`
	Text  string `json:"text"`
	Email string `json:"email"`
}
type Plan struct {
	Title string `json:"title"`
	Text  string `json:"text"`
}

var db *sql.DB

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Accept")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
}

func encodeID(s string) string {
	return strings.NewReplacer(" ", "_", ".", "_").Replace(s)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		//enableCORS(w)
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var u User
	err := json.NewDecoder(r.Body).Decode(&u)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	var storedName string
	var storedHash string
	var storedEmail string
	err = db.QueryRow("SELECT Username, PasswordHash, Email FROM Users WHERE Email = @p1", u.Email).Scan(&storedName, &storedHash, &storedEmail)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(u.Password))
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	resp := User{
		Name:  storedName,
		Email: storedEmail,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func signupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		enableCORS(w)
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}
	enableCORS(w)

	var u User
	err := json.NewDecoder(r.Body).Decode(&u)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if u.Name == "" || u.Email == "" || u.Password == "" {
		http.Error(w, "Name, email and password are required", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	tsql := `INSERT INTO Users (Username, Email, PasswordHash) VALUES (@p1, @p2, @p3)`
	_, err = db.Exec(tsql, u.Name, u.Email, string(hashedPassword))
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "PRIMARY KEY") {
			http.Error(w, "Email already registered", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to insert user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	resp := User{
		Name:  u.Name,
		Email: u.Email,
	}
	json.NewEncoder(w).Encode(resp)
}

func getPlansHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email string `json:"email"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	var userId int
	err = db.QueryRow("SELECT UserId FROM Users WHERE Email = @p1", req.Email).Scan(&userId)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	rows, err := db.Query(`
		SELECT c.Title, ce.TextContent
		FROM Chats c
		JOIN ChatEntries ce ON c.ChatId = ce.ChatId
		WHERE c.UserId = @p1
	`, userId)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var plans []Plan
	for rows.Next() {
		var plan Plan
		if err := rows.Scan(&plan.Title, &plan.Text); err != nil {
			continue
		}
		plans = append(plans, plan)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"plans": plans,
	})
}

func savePlanHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var req SavePlanRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if req.Title == "" || req.Text == "" || req.Email == "" {
		http.Error(w, "title, text and email are required", http.StatusBadRequest)
		return
	}

	var userId int
	err = db.QueryRow("SELECT UserId FROM Users WHERE Email = @p1", req.Email).Scan(&userId)
	if err != nil {
		http.Error(w, "User not found. Please log in first.", http.StatusUnauthorized)
		return
	}

	var existingChatId int
	err = db.QueryRow("SELECT ChatId FROM Chats WHERE UserId = @p1 AND Title = @p2", userId, req.Title).Scan(&existingChatId)
	if err == sql.ErrNoRows {
		insertChatSQL := `INSERT INTO Chats (UserId, Title) OUTPUT INSERTED.ChatId VALUES (@p1, @p2)`
		var newChatId int
		err = db.QueryRow(insertChatSQL, userId, req.Title).Scan(&newChatId)
		if err != nil {
			http.Error(w, "Failed to save plan: "+err.Error(), http.StatusInternalServerError)
			return
		}

		insertEntrySQL := `INSERT INTO ChatEntries (ChatId, TextContent) VALUES (@p1, @p2)`
		_, err = db.Exec(insertEntrySQL, newChatId, req.Text)
		if err != nil {
			http.Error(w, "Failed to save chat entry: "+err.Error(), http.StatusInternalServerError)
			return
		}

	} else if err == nil {
		updateEntrySQL := `
			UPDATE ChatEntries 
			SET TextContent = @p1
			WHERE ChatId = @p2
		`
		_, err = db.Exec(updateEntrySQL, req.Text, existingChatId)
		if err != nil {
			http.Error(w, "Failed to update plan: "+err.Error(), http.StatusInternalServerError)
			return
		}

	} else {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message":"Plan saved successfully"}`))
}
func generateMindMap(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Cannot read body", http.StatusBadRequest)
		return
	}
	text := string(body)

	lines := strings.Split(text, "\n")
	topic := strings.TrimSpace(lines[0])
	planLines := lines[1:]

	re := regexp.MustCompile(`^(\d+(?:\.\d+)*)\.\s*(.*)$`)

	var nodes []string
	var edges []string
	parentStack := []string{topic}
	lastLevel := 0

	
	nodes = append(nodes, topic)

	for _, line := range planLines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		m := re.FindStringSubmatch(line)
		if m != nil {
			numbering := m[1]
			content := m[2]
			level := strings.Count(numbering, ".") + 1
			key := numbering + ". " + content

			if level > lastLevel {
				parentStack = append(parentStack, parentStack[len(parentStack)-1])
			} else if level < lastLevel {
				parentStack = parentStack[:level]
			}
			parentStack[len(parentStack)-1] = key
			parent := parentStack[level-1]
			edges = append(edges, parent+" -> "+key)
			nodes = append(nodes, key)
			lastLevel = level
		} else {

			key := line
			edges = append(edges, topic+" -> "+key)
			nodes = append(nodes, key)
			parentStack = []string{topic, key}
			lastLevel = 1
		}
	}

	var dot bytes.Buffer
	dot.WriteString("graph MindMap {\n")
	dot.WriteString("  labelloc=\"t\";\n")
	dot.WriteString("  label=\"" + topic + "\";\n")
	dot.WriteString("  layout=dot;\n")
	dot.WriteString("  rankdir=LR;\n")

	dot.WriteString("  node [shape=box, style=filled, fillcolor=lightyellow, fontname=Arial];\n")
	dot.WriteString(fmt.Sprintf("  \"%s\" [label=\"%s\"];\n", encodeID(topic), topic))
	for _, n := range nodes {
		if n == topic {
			continue
		}
		dot.WriteString(fmt.Sprintf("  \"%s\" [label=\"%s\"];\n", encodeID(n), n))
	}
	for _, e := range edges {
		parts := strings.SplitN(e, " -> ", 2)
		if len(parts) == 2 {
			dot.WriteString(fmt.Sprintf("  \"%s\" -- \"%s\";\n", encodeID(parts[0]), encodeID(parts[1])))
		}
	}
	dot.WriteString("}\n")

	os.WriteFile("mindmap.dot", dot.Bytes(), 0644)
	err = exec.Command("dot", "-Tpng", "-o", "mindmap.png", "mindmap.dot").Run()
	if err != nil {
		log.Println("dot command failed:", err)
	}

	w.Header().Set("Content-Type", "image/png")
	http.ServeFile(w, r, "mindmap.png")
}

func main() {
	var err error
	err = godotenv.Load()
	if err != nil {
		log.Println("No .env file found or error loading it")
	}

	connString := os.Getenv("CONNECTION_STRING")
	if connString == "" {
		log.Fatal("CONNECTION_STRING environment variable not set")
	}

	db, err = sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal("Error creating connection pool: ", err.Error())
	}
	defer db.Close()
	http.HandleFunc("/api/getplans", getPlansHandler)
	http.HandleFunc("/api/login", loginHandler)
	http.HandleFunc("/api/signup", signupHandler)
	http.HandleFunc("/api/saveplan", savePlanHandler)
	http.HandleFunc("/api/generate_mindmap", generateMindMap)

	log.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

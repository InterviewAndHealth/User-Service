CREATE TABLE IF NOT EXISTS students (
    studentid SERIAL PRIMARY KEY, 
    firstname VARCHAR(100) NOT NULL, 
    lastname VARCHAR(100) NOT NULL, 
    contactnumber VARCHAR(15) UNIQUE NOT NULL, 
    gender VARCHAR(10) NOT NULL, 
    city VARCHAR(100) NOT NULL, 
    country VARCHAR(100) NOT NULL, 
    skills TEXT[] NOT NULL, 
    preparingfor VARCHAR(100) NOT NULL, 
    workmode VARCHAR(50) NOT NULL, 
    preferedcity VARCHAR(100), 
    resumelink VARCHAR(100) DEFAULT NULL, 
    userid VARCHAR(12) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (userid) REFERENCES "users" (public_id) ON DELETE CASCADE
);


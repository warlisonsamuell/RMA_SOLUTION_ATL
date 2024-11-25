create database RMASOLUTION;
USE RMASOLUTION;

CREATE TABLE users (
    matricula VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE rma_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto VARCHAR(255),
    defeito VARCHAR(255),
    status VARCHAR(255),
    usuario VARCHAR(255),
    FOREIGN KEY (usuario) REFERENCES users(matricula)
);

select * from users;
ALTER TABLE rma_requests ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

select * from rma_requests;



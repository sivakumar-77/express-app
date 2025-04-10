create table users (
    id SERIAL
    PRIMARY KEY,
    email varchar(255)
    UNIQUE NOT NULL,
    username varchar(255)
    UNIQUE NOT NULL,
    password varchar(1000)
    NOT NULL,
    role varchar(255) NOT NULL,
    created_at timestamp
    updated_at timestamp
)


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_type') THEN
        CREATE TYPE auth_type AS ENUM ('google', 'linkedin', 'github', 'twitter','normal','facebook');
    END IF;
END $$;



CREATE TABLE IF NOT EXISTS users (
    id SERIAL,
    public_id VARCHAR(12) DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    authtype auth_type DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_public_id_unique UNIQUE (public_id)
);


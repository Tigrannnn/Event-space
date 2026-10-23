UPDATE "users" SET "is_shadow" = false WHERE "email_verified" = true AND "is_shadow" = true;

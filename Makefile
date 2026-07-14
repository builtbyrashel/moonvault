.PHONY: db-up db-down db-stop db-destroy db-logs db-ps

db-up:
	docker compose -f docker-compose.dev.yml up -d

db-stop:
	docker compose -f docker-compose.dev.yml stop

db-down:
	docker compose -f docker-compose.dev.yml down

db-destroy:
	docker compose -f docker-compose.dev.yml down -v

db-logs:
	docker compose -f docker-compose.dev.yml logs -f

db-ps:
	docker compose -f docker-compose.dev.yml ps
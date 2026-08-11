.PHONY: up down logs seed test lint migrate fresh

up:            ## Start the whole stack
	docker compose up --build -d
	@echo "API      http://localhost:8000/docs"
	@echo "Frontend http://localhost:3000"
	@echo "Sign in  owner@irobox.in / Demo@12345"

down:
	docker compose down

fresh:         ## Wipe the database and start clean
	docker compose down -v && docker compose up --build -d

logs:
	docker compose logs -f backend

seed:
	docker compose exec backend python -m app.services.seed

test:
	cd backend && pytest

lint:
	cd backend && ruff check app tests
	cd frontend && npm run lint

migrate:
	cd backend && alembic upgrade head

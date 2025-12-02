.PHONY: help install build test lint typecheck clean dev

help: ## Show this help message
	@echo "ZecRep Development Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install

build: ## Build all packages
	pnpm turbo build

test: ## Run all tests
	pnpm turbo test

lint: ## Lint all packages
	pnpm turbo lint

typecheck: ## Typecheck all packages
	pnpm turbo typecheck

clean: ## Clean build artifacts
	rm -rf node_modules packages/*/node_modules services/*/node_modules apps/*/node_modules
	rm -rf packages/*/dist services/*/dist apps/*/dist
	rm -rf packages/*/out apps/*/.next

dev-aggregator: ## Start aggregator service in dev mode
	pnpm --filter @zecrep/aggregator dev

dev-web: ## Start web frontend in dev mode
	pnpm --filter @zecrep/web dev

dev: ## Start all services in dev mode (requires multiple terminals)
	@echo "Starting services..."
	@echo "Run 'make dev-aggregator' in one terminal and 'make dev-web' in another"

docker-up: ## Start all services with Docker Compose
	docker-compose up

docker-build: ## Build all Docker images
	docker-compose build

docker-down: ## Stop all Docker services
	docker-compose down

contracts-test: ## Run contract tests
	pnpm --filter @zecrep/contracts test

contracts-deploy: ## Deploy contracts (requires .env with PRIVATE_KEY)
	pnpm --filter @zecrep/contracts script script/Deploy.s.sol:DeployZecRep

prover-run: ## Run prover CLI (usage: make prover-run ADDRESS=0x... VIEWING_KEY=...)
	pnpm --filter @zecrep/prover dev run --address $(ADDRESS) --viewing-key $(VIEWING_KEY)


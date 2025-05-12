docker network create --driver bridge chat_app_network
docker compose -f docker-compose-redis.yml up -d
docker compose -f docker-compose-mongo.yml up -d
FROM node:22-alpine AS build

RUN apk add curl bash git

RUN curl -sfL https://gobinaries.com/tj/node-prune | bash -s -- -b /usr/local/bin

# RUN corepack enable && corepack prepare yarn@stable --activate

# RUN yarn set version 1.22.22

# RUN yarn -v

RUN npm i -g @nestjs/cli

WORKDIR /app 

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# run node prune
# RUN /usr/local/bin/node-prune

# remove unused dependencies
# RUN rm -rf node_modules/rxjs/src/
# RUN rm -rf node_modules/rxjs/bundles/
# RUN rm -rf node_modules/rxjs/_esm5/
# RUN rm -rf node_modules/rxjs/_esm2015/
RUN rm -rf node_modules
RUN yarn install --production

FROM node:22-alpine AS deploy

# RUN corepack enable && corepack prepare yarn@stable --activate

# RUN yarn set version 1.22.22

WORKDIR /app

COPY --from=build /app/package*.json /app/
COPY --from=build /app/yarn.lock /app/
COPY --from=build /app/dist/ /app/dist/
COPY --from=build /app/node_modules/ /app/node_modules/
COPY --from=build /app/config.yml /app/config.yml
COPY --from=build /app/config.prod.yml /app/config.yml

CMD [ "node", "dist/main.js" ]

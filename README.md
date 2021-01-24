# DemoApp
## Contents

-   [Start Application](#start-application)
-   [Usage](#usage)
-   [Testing](#testing)

## Start Application

This App uses json-server as its dependency. So, first we need to start the json-server and then the App.

To start the json-server:
```console
npm run json:server
```
To start the app:
```console
npm start
```

## Usage

#### Login to the App
For logging in to the app:
```console
curl -X POST http://localhost:3000/login -c cookie-file.txt -H 'Content-Type: application/json' -d '{"email":"test@test.com", "password":"password"}' -L
```

#### List all products
For listing all the products:
```console
curl -X GET http://localhost:3000/products -b cookie-file.txt -L
```

#### Add products to cart
For adding product to the cart:
```console
curl -X PATCH http://localhost:3000/cart -b cookie-file.txt -d '{"itemId":2}' -L
```

#### Get cart for a specific user
For listing cart item of specific user:
```console
curl -X GET http://localhost:3000/cart -b cookie-file.txt -L
```

Here, we have used some flags/options with curl.
- `-L` flag: It will allow to follow the redirects.
- `-c filename`: It will create the cookie file for the firtst time we logged in.
- `-b filename`: It will use the file(created for the first time) to pass it with subsequent request.

## Testing

To run tests, first start the json-server:

```console
npm run json:server
```

then type below command in new terminal:

```console
npm test
```

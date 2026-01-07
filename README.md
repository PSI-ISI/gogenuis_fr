# GogeniusFr

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Overview
A cutting-edge web application platform designed to enhance the modern traveler's experience. It implements a highly intuitive user interface and integrates essential travel-tech features. The platform integrates with the Pathfinder API to provide secure multi-factor authentication, personalized user profiles, real-time location-based messaging, and dynamic itinerary management. Built using TypeScript and the Google Angular framework for a robust and scalable front-end.

## Topics
* [5 Minute Test](#5-minute-test)
* [Features](#features)
* [Development server](#development_server)
* [Code scaffolding](code_scaffolding)
* [Building](Building)
* [Additional Resources](Additional_Resources)

## 5 Minute Test
To quickly get the application running for development or testing:
```
# Clone repository.
$ git clone https://github.com/jemyouag155-eng/gogenius_app.git

# Change directory to your app.
$ cd gogenius_fr

# Install angular cli globally.
$ npm install -g @angular/cli
# Install development dependencies with npm.
$ npm install

# Start the server.
$ npm start
```
## Features

- The Intelligent Tourist Guide Application is equipped with a suite of features designed for the modern traveler:
  
* Personalized Itinerary Generation based on user preferences, historical data, and real-time conditions.
* Real-time GPS Navigation with dynamic points of interest (POI ) and support for offline map usage.
* Multi-lingual Support for all content, including voice-guided tours and user interface elements.
* User Account & Profile Management with secure multi-factor authentication and password recovery.
* Integrated Messaging for connecting with local guides, support staff, and fellow travelers.
* Responsive UI optimized for seamless use across mobile, tablet, and in-car display systems.
* Lazy loaded modules and Ahead-of-Time (AOT) compilation to ensure high performance and fast initial load times.
* Integrates exclusively with the Pathfinder API for all dynamic travel data and backend services.


## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:8443/v1/register/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

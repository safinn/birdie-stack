### TODO

- [ ] full invitation flow and UI
- users and organisations
  - [ ] cannot delete initial users organisation (personal)
  - [ ] removing a user from an organisation (delete membership) changes their `defaultOrganisationId` to their initial organisation if on the removed organisation. This needs to be changed in the session as well.
    - [ ] if membership check fails, change and `defaultOrganisationId` in session using getMembership db abstraction?
  - [ ] deleting an organisation changes all users who have `defaultOrganisationId` as the deleted organisation to their initial organisation
- [ ] second deploy github action workflow for non-arm deploy
- [ ] style the app
- [ ] fix readme
- [ ] nat -> private link
- [ ] basti in terraform????

---

- [ ] conform forms
- [ ] feature flags
- [ ] role based user permsisions
- [ ] stripe
- [ ] i18n
- [ ] image hosting s3

<h1 align="center">Birdie Stack</h1>

<div align="center">
  <a href="https://makeapullrequest.com/">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat">
  </a>
  <a href="https://github.com/safinn/birdie-stack/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/safinn/birdie-stack?style=flat">
  </a>
</div>

<br/>

<div align="center">
  The <a href="https://github.com/safinn/birdie-stack">Birdie Stack</a> is focused on hosting a <a href="https://github.com/remix-run/remix">Remix</a> application on <a href="aws.com">AWS</a> <em>(<strong>A</strong>mazon <strong>W</strong>eb <strong>S</strong>ervices)</em> with minimal cost.
</div>

<br/>

<div align="center">
  <img alt="Logo" src="https://user-images.githubusercontent.com/4719461/236650539-e4c8d380-8078-4d79-b3e8-66db1be95b55.png">
</div>

<br/>

<!-- The following toc is generated with the Markdown All in One VSCode extension (https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) -->

## Table of contents <!-- omit from toc -->

- [Features](#features)
- [Getting Started](#getting-started)
- [Infrastructure](#infrastructure)
  - [Remote State](#remote-state)
    - [OpenID Connect Provider](#openid-connect-provider)
  - [Application Environment](#application-environment)
- [Setup](#setup)
  - [Migrations](#migrations)
    - [Basti](#basti)
    - [Drizzle](#drizzle)
  - [GitHub Actions](#github-actions)
- [Development](#development)
- [Deployment](#deployment)

<br/>

## Features

- Deploy using containers to AWS ECS

## Getting Started

```sh
pnpm create remix@latest --template safinn/birdie-stack
```

- [Terraform](https://www.terraform.io) is required to manage and deploy the infrastructure-as-code.
- [Basti](https://github.com/BohdanPetryshyn/basti) is used to setup the bastion server giving access to the private RDS instance.

Having all these tools installed and ready to go will get you started fast.

## Infrastructure

### Remote State

This module creates the S3 bucket and DynamoDB table to remotely manage the terraform state for the application.

1. Update the `reponame` and `domain` variables in the [./infra/prod/terraform.tfvars](./infra/prod/terraform.tfvars) file.
2. From the application root:

```sh
cd ./infra/remote-state && \
terraform init && \
terraform apply --var-file ../prod/terraform.tfvars
```

#### OpenID Connect Provider

This module also sets up the GitHub OpenID connect provider so GitHub action workflows can assume a AWS IAM role and obtain short-lived credentials to manage resources on AWS.

### Application Environment

This module sets up all the infrastructure required for the application.

```sh
cd ../prod && \
terraform init && \
terraform apply
```

## Setup

### Migrations

#### Basti

Access to the RDS instance in the private subnet is allowed via [Basti](https://github.com/BohdanPetryshyn/basti)

```sh
pnpm install --global basti
```

```sh
basti init
```

After a few minutes the infrastructure should be ready to connect to with:

```sh
basti connect
```

#### Drizzle

Generate your migration files from the schema using the command:

```sh
pnpm generate
```

Apply migrations making sure to use the correct connection string. The `password` can be taken from AWS Secrets Manager once access is gained to the private RDS instance using [Basti](#basti). Run the command:

```sh
pnpm migrate 'postgres://birdie-stack:password@localhost:port/birdie-stack'
```

### GitHub Actions

Update the `deploy` workflows in the `.github/workflows/` directory by changing the role arn provided to `role-to-assume` in all the `Configure AWS Credentials` steps to the arn of the role named `github-actions-role` in AWS IAM.

## Development

From your terminal:

```sh
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
pnpm build
```

Then run the app in production mode:

```sh
npm start
```

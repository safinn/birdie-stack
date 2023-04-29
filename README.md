### TODO

- [ ] github action github credentials
- [ ] full invitation flow and UI
- users and organisations
  - [ ] cannot delete initial users organisation (personal)
  - [ ] removing a user from an organisation (delete membership) changes their `defaultOrganisationId` to their initial organisation if on the removed organisation. This needs to be changed in the session as well.
    - [ ] if membership check fails, change and `defaultOrganisationId` in session using getMembership db abstraction?
  - [ ] deleting an organisation changes all users who have `defaultOrganisationId` as the deleted organisation to their initial organisation
- [ ] test github action
  - [ ] does single instance have enough memory to update app
- [ ] fastify > express server
- [ ] use tailwind in email templates
- [ ] style the app
- aws infrastructure
  - [ ] app ECS health
  - postgresql db rds
    - [ ] backups
  - [ ] scalable - choose number of instances and use ALB

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
